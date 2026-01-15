import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
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
  Avatar,
  Fade,
  Grow,
} from "@mui/material";
import MiniProfile from "../components/MiniProfile";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const lastMessageRef = useRef(null);
  const [miniProfile, setMiniProfile] = useState({ user: null, position: null });
  const [, setForceUpdate] = useState({});

  useEffect(() => {
    if (!auth.currentUser) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
      },
      error => console.error("Snapshot error:", error)
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
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
        photoURL: user.photoURL || null,
        email: user.email,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Check console.");
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

  const showMiniProfile = (msg, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const cardWidth = 220;
    const cardHeight = 220;
    let top = rect.top - cardHeight - 8;
    let left = rect.left + rect.width / 2 - cardWidth / 2;

    if (top < 8) top = rect.bottom + 8;
    if (left < 8) left = 8;
    if (left + cardWidth > window.innerWidth - 8) left = window.innerWidth - cardWidth - 8;

    setMiniProfile({
      user: msg,
      position: { top, left },
    });
  };

  const hideMiniProfile = () => setMiniProfile({ user: null, position: null });

  const handleAvatarClick = (msg, event) => {
    if (msg.uid === auth.currentUser.uid) showMiniProfile(msg, event);
  };

  const handleProfileUpdate = () => setForceUpdate({});

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", bgcolor: "grey.100", overflow: "hidden" }}>
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

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column" }}>
        <Stack spacing={1}>
          {messages.map((msg, index) => {
            const isLast = index === messages.length - 1;
            const isMe = msg.uid === auth.currentUser?.uid;
            const displayName = isMe ? auth.currentUser.displayName : msg.displayName;
            const photoURL = isMe ? auth.currentUser.photoURL : msg.photoURL;

            return (
              <Stack
                key={msg.id}
                direction="row"
                spacing={1}
                justifyContent={isMe ? "flex-end" : "flex-start"}
                sx={{ alignItems: "flex-start", minWidth: 100, transform: isLast ? "translateY(20px)" : "translateY(0)", transition: "transform 0.4s ease-out" }}
                ref={isLast ? lastMessageRef : null}
              >
                {isMe ? (
                  <>
                    <Paper sx={{ p: 1, bgcolor: "primary.light", maxWidth: "70%", minWidth: 100 }}>
                      <Typography variant="subtitle2">Me</Typography>
                      <Typography>{msg.text}</Typography>
                    </Paper>
                    <Avatar
                      sx={{ bgcolor: "secondary.main", cursor: "pointer" }}
                      src={photoURL || ""}
                      onClick={e => handleAvatarClick(msg, e)}
                    >
                      {!photoURL && displayName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </>
                ) : (
                  <>
                    <Avatar
                      sx={{ bgcolor: "primary.main", cursor: "pointer" }}
                      src={photoURL || ""}
                      onMouseEnter={e => showMiniProfile(msg, e)}
                      onMouseLeave={hideMiniProfile}
                    >
                      {!photoURL && displayName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Paper sx={{ p: 1, bgcolor: "grey.300", maxWidth: "70%", minWidth: 100 }}>
                      <Typography variant="subtitle2">{displayName}</Typography>
                      <Typography>{msg.text}</Typography>
                    </Paper>
                  </>
                )}
              </Stack>
            );
          })}
        </Stack>
        <div ref={lastMessageRef} />
      </Box>

      {miniProfile.user && miniProfile.position && (
        <Fade in={!!miniProfile.user} timeout={200}>
          <Box sx={{ position: "fixed", zIndex: 1000, top: miniProfile.position.top, left: miniProfile.position.left }}>
            <Grow in={!!miniProfile.user} timeout={200}>
              <Box>
                <MiniProfile user={miniProfile.user} onClose={() => setMiniProfile({ user: null, position: null })} onProfileUpdate={handleProfileUpdate} />
              </Box>
            </Grow>
          </Box>
        </Fade>
      )}

      <Box component="form" onSubmit={handleSend} sx={{ display: "flex", borderTop: "1px solid #ccc", p: 1, gap: 1 }}>
        <TextField variant="outlined" placeholder="Type a message..." fullWidth value={newMessage} onChange={e => setNewMessage(e.target.value)} size="medium" />
        <Button variant="contained" type="submit">
          Send
        </Button>
      </Box>
    </Box>
  );
}
