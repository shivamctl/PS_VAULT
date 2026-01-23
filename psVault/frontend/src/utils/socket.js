import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  autoConnect: false,
});

export function connectSocket() {
  const token = localStorage.getItem("psvault-auth-token");
  if (!token) return;

  if (socket.connected) return;

  socket.auth = { token };
  socket.connect();
}

export default socket;

socket.on("connect_error", (err) => {
  console.warn("Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});
