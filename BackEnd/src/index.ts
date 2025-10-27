import express from "express";
import http from "http";
import cors from "cors";
import turnsRouter from "./routes/turns";
import { initSocket } from "./socket";

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/turns", turnsRouter);

// Inicializar Socket.IO
initSocket(server);

// Iniciar servidor HTTP
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
