import { logout } from "../authService";

function Chat() {
  return (
    <div>
      <h1>Chat Room</h1>
      <button onClick={logout}>Logout</button>
      {/* Messages will go here later */}
    </div>
  );
}

export default Chat;
