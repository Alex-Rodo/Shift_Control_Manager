import { io }  from "socket.io-client";

// Usa la URL desde tu .env o localhost por defecto
// const socketUrl = import.meta.env.VITE_WS_URL || "http://localhost:4000";

export const socket = io("http://localhost:4000",{
  transports: ["websocket"],
  reconnection: true,
});

socket.on("connect", () => {
  console.log("✅ Conectado al servidor con ID:", socket.id);
});

socket.on("disconnect", () => { 
  console.log("❌ Desconectado del servidor");
});

