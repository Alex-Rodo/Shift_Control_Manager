import React from 'react';
import WaitingRoomDisplay from './components/WaitingRoomDisplay';
import ReceptionPanel from './components/ReceptionPanel';
import DoctorPanel from './components/DoctorPanel';

export default function App() {
  return (
    <div style={{ display: 'flex', gap: 20, padding: 20 }}>
      <div style={{ flex: 1 }}>
        <h2>Recepción</h2>
        <ReceptionPanel />
        <h2 style={{ marginTop: 40 }}>Médico (Pediatría demo)</h2>
        <DoctorPanel specialty="Pediatría" />
      </div>

      <div style={{ width: 640 }}>
        <WaitingRoomDisplay title="Sala de Espera - General" />
      </div>
    </div>
  );
}
