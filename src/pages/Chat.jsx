import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Card,
  Avatar,
} from "@mui/material";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const lastMessageRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!auth.currentUser) navigate("/login");
  }, [navigate]);

  // Load messages in real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, []);

  // Scroll last message into view on change
  useEffect(() => {
    if (lastMessageRef.current) {
      // Scroll first
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });

      // Animate slide in after the DOM has painted
      requestAnimationFrame(() => {
        lastMessageRef.current.style.transform = "translateY(0)";
      });
    }
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const user = auth.currentUser;
    if (!user) return alert("You must be logged in");

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
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
        overflow: "hidden",
      }}
    >
      <Card sx={{ width: 600, height: 600, display: "flex", flexDirection: "column" }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Chat - {auth.currentUser?.displayName}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            bgcolor: "grey.50",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={1}>
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              return (
                <Stack
                  key={msg.id}
                  direction="row"
                  spacing={1}
                  justifyContent={msg.uid === auth.currentUser?.uid ? "flex-end" : "flex-start"}
                  sx={{
                    alignItems: "flex-start",
                    minWidth: 100,
                    transform: isLast ? "translateY(20px)" : "translateY(0)",
                    transition: "transform 0.4s ease-out",
                  }}
                  ref={isLast ? lastMessageRef : null}
                >
                  {msg.uid !== auth.currentUser?.uid && (
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {msg.displayName?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                  )}

                  <Paper
                    sx={{
                      p: 1,
                      bgcolor: msg.uid === auth.currentUser?.uid ? "primary.light" : "grey.300",
                      maxWidth: "70%",
                      minWidth: 100,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {msg.uid === auth.currentUser?.uid ? "Me" : msg.displayName}
                    </Typography>
                    <Typography>{msg.text}</Typography>
                  </Paper>

                  {msg.uid === auth.currentUser?.uid && (
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      {msg.displayName?.charAt(0).toUpperCase() || "M"}
                    </Avatar>
                  )}
                </Stack>
              );
            })}
          </Stack>
          <div ref={lastMessageRef} />
        </Box>

        {/* Input */}
        <Box
          component="form"
          onSubmit={handleSend}
          sx={{ display: "flex", borderTop: "1px solid #ccc", p: 1, gap: 1 }}
        >
          <TextField
            variant="outlined"
            placeholder="Type a message..."
            fullWidth
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            size="medium"
          />
          <Button variant="contained" type="submit">
            Send
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
