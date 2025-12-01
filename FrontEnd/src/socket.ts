import  io  from "socket.io-client";

// Usa la URL desde tu .env o localhost por defecto
export const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("✅ Conectado al servidor con ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Desconectado del servidor");
});

export default socket;
