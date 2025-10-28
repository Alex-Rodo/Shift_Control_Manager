import express from "express";
import { createServer} from "http";
import cors from "cors";
import { Server } from "socket.io";
import turnsRouter from "./routes/turns";
import { initSocket } from "./socket";

const app = express()
app.use(cors())

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // URL de tu frontend
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id)
  })
})

server.listen(4000, () => {
  console.log('Servidor escuchando en http://localhost:4000')
})