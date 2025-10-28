import WaitingRoomDisplay from './components/WaitingRoomDisplay';
import ReceptionPanel from './components/ReceptionPanel';
import DoctorPanel from './components/DoctorPanel';
import React, { useEffect } from 'react'
import io from 'socket.io-client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


const socket = io('http://localhost:4000', { transports: ['websocket'] })

function App() {
   useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket')
    })

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket')
    })

    // Limpieza al desmontar el componente
    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  return (
     <><Router>
      <Routes>
        <Route path="/" element={<WaitingRoomDisplay />} />
      </Routes>
    </Router><><div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>Shift Control Manager</h1>
      <p>Verifica la consola del navegador para ver la conexión Socket.IO</p>
    </div><div style={{ display: 'flex', gap: 20, padding: 20 }}>
          <div style={{ flex: 1 }}>
            <h2>Recepción</h2>
            <ReceptionPanel />
            <h2 style={{ marginTop: 40 }}>Médico (Pediatría demo)</h2>
            <DoctorPanel specialty="Pediatría" />
          </div>

          <div style={{ width: 640 }}>
            <WaitingRoomDisplay title="Sala de Espera - General" />
          </div>
        </div></></>
  );
}
export default App