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

// ======================
//   ENUM Turn Status
// ======================
export enum TurnStatus {
  WAITING = "WAITING",
  CALLED = "CALLED",
  DONE = "DONE"
}

// ======================
//   Servidor Socket.IO
// ======================

const io = new Server(server, {
  cors: {
    origin: '*', 
  },
});

// =============================
//   Turno y Memoria temporal 
// =============================
interface Turn {
  id: string;
  name: string;
  specialty: string;
  createdAt: number;
  status: TurnStatus;
  turnNumber: number;
}

let queue: Turn[] = [];
let turnCounter = 1;

// Formato recomendado: 
// {
//     id: "abc123",
//     name: "Juan Perez",
//     specialty: "Medicina General",
//     createdAt: Date.now(),
//     status: "WAITING",
// }

// =================================
//       Broadcast General
// =================================

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

    const newTurn: Turn = {
      id: crypto.randomUUID(),
      name: data.name,
      specialty: data.specialty,
      createdAt: Date.now(),
      status: TurnStatus.WAITING,
      turnNumber: turnCounter++,
    };
    //console.log("Turno creado: ", newTurn);
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
    if (index === -1) return;

    const turn = queue[index];

    // Validar orden al llamar turno
    if (data.status === TurnStatus.CALLED) {
      //Buscar primer turno en estado WAITING
      const nextToCall = queue.find(t => t.status === TurnStatus.WAITING);
      //No hay turnos en espera
      if (!nextToCall) return;

      if (nextToCall.id !== turn.id) {
        console.log("Intento de llamar un turno fuera de orden");
        socket.emit("queue.error", {
          message: "Solo puede llamar el siguiente turno en orden."
        });
        return;
      }
    }

    //Aplicar actualizacion valida
      queue[index] = { 
        ...queue[index], ...data,
      };
      io.emit("queue.update", queue[index]);
      broadCastSnapshot();
  });

  // ===============================
  //   Event: Eliminar turno 
  // ===============================

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
  //  Disconnected
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