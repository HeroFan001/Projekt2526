import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  AppBar,
  Toolbar,
} from "@mui/material";

export default function Register() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (auth.currentUser) navigate("/chat");
  }, [navigate]);

  const handleRegister = async e => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Set display name
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      navigate("/chat");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "grey.100",
      }}
    >
      <Card sx={{ width: 400, p: 4, display: "flex", flexDirection: "column" }}>
        {/* AppBar */}
        <AppBar position="static" sx={{ mb: 3 }}>
          <Toolbar variant="dense" sx={{ px: 0 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Register
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Registration form */}
        <form onSubmit={handleRegister}>
          <Stack spacing={2}>
            <TextField
              label="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button variant="contained" type="submit" fullWidth>
              Register
            </Button>
            <Typography variant="body2" align="center">
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
