import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

  // Load messages in real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      scrollToBottom();
    });
    return unsubscribe;
  }, []);

  // Send a new message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to send messages.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName, // <-- username
        email: user.email,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // redirect to login
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>Chat Room - Logged in as {auth.currentUser?.displayName}</h2>
      <button onClick={handleLogout}>Logout</button>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 400,
          overflowY: "scroll",
          marginTop: 20,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              marginBottom: 10,
              textAlign: msg.uid === auth.currentUser?.uid ? "right" : "left",
            }}
          >
            <strong>{msg.uid === auth.currentUser?.uid ? "Me" : msg.displayName}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ marginTop: 10, display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: "0 16px", marginLeft: 8 }}>Send</button>
      </form>
    </div>
  );
}
