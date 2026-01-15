import { useState, useEffect } from "react";
import { Avatar, Card, CardContent, Typography, TextField, Button, Stack } from "@mui/material";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function MiniProfile({ user, onClose }) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName });
      // Update Firestore user profile for live sync
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        displayName,
        photoURL: auth.currentUser.photoURL || null,
      }, { merge: true });
      setEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 2, width: 220, boxShadow: 3 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Avatar
          src={user.photoURL || ""}
          sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
        >
          {!user.photoURL && displayName?.charAt(0).toUpperCase()}
        </Avatar>

        {editing ? (
          <Stack spacing={1} sx={{ width: "100%" }}>
            <TextField
              label="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              fullWidth
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditing(false)}
              fullWidth
            >
              Cancel
            </Button>
          </Stack>
        ) : (
          <>
            <Typography variant="subtitle1">{displayName}</Typography>
            {user.email && (
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
            )}
            {user.uid === auth.currentUser.uid && (
              <Button variant="text" onClick={() => setEditing(true)} size="small">
                Edit Name
              </Button>
            )}
          </>
        )}

        <Button variant="text" onClick={onClose} size="small">
          Close
        </Button>
      </CardContent>
    </Card>
  );
}
