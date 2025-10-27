import  io  from "socket.io-client";

// Usa la URL desde tu .env o localhost por defecto
const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Conectado al servidor con ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Desconectado del servidor");
});

export default socket;
