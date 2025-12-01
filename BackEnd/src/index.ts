// =======================
//  SHIFT CONTROL MANAGER
//  BackEnd con Socket.IO
// =======================

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { log } from "console";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
export const TURN_STATUS =["WAITING", "CALLED", "DONE"] as const;
export type TurnStatus = typeof TURN_STATUS[number];

// ======================
//   Servidor Socket.IO
// ======================

const io = new Server(server, {
  cors: {
    origin: '*', // URL de tu frontend
  },
});

// ===========================================
// Memoria temporal de la cola de turnos
// (Luego esto se puede pasar a MongoDB)
// ===========================================
interface Turn {
  id: string;
  name: string;
  specialty: string;
  createdAt: number;
  //status: TurnStatus; 
}

let queue: Turn[] = [];

// Formato recomendado: 
// {
//     id: "abc123",
//     name: "Juan Perez",
//     specialty: "Medicina General",
//     createdAt: Date.now(),
//     status: "WAITING",
// }

// ======================================
//  Enviar Snapshot a TODOS los clients
// ======================================

function broadCastSnapshot() {
  io.emit("queue.snapshot", queue);
}

// ===================================
//   Conexión Principal Socket.IO
// ===================================

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);

  //Enviar snapshot inicial
  socket.emit("queue.snapshot", queue);

  // ========================
  //   Event: Crear Turno
  // ========================

  socket.on("queue.add", (data) => {
    console.log("Nuevo turno recibido: ", data);

    const newTurn = {
      id: Date.now().toString(),
      name: data.name,
      specialty: data.specialty,
      createdAt: Date.now(),
      //status: "WAITING",
    };

    queue.push(newTurn);

    //Emitir evento a todos
    io.emit("queue.add", newTurn);
    broadCastSnapshot();
  });

  // =================================================
  //  Event: Actualizar turno (ej: doctor lo llama)
  // =================================================

  socket.on("queue.update", (data) => {
    console.log("Actualizacion de turno: ", data);

    const index = queue.findIndex((t) => t.id === data.id);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...data };
      io.emit("queue.update", queue[index]);
      broadCastSnapshot();
    }
  });

  // ==================================================
  //   Event: Eliminar turno (ej: paciente atendido)
  // ==================================================

  socket.on("queue.remove", (id) => {
    console.log("Eliminando turno: ", id);

    queue = queue.filter((t) => t.id !== id);

    io.emit("queue.remove", id);
    broadCastSnapshot();
  });

  // ===========================================
  //  Cliente solicitada snapshot manualmente
  // ===========================================

  socket.on("queue.snapshot", () => {
    socket.emit("queue.snapshot", queue);
  });

  // ================
  //  Dissconected
  // ================
    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado:', socket.id);
    });
  });

  // ========================================
  //   Levantar servidor HTTP + WebSocket
  // ========================================

  const PORT = 4000;
  server.listen(PORT, () => {
    console.log(`Servidor Socket.IO escuchando en http://localhost:${PORT}`)
  })