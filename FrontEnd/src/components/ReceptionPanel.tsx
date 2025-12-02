import { useState } from 'react';
import socket from '../socket';
import { TurnStatus } from "../types/TurnStatus";

export default function ReceptionPanel() {
  const [patientName, setPatientName] = useState('');
  const [specialty, setSpecialty] = useState('Medicina General');

  function createTurn() {
    if (!patientName.trim()) return alert("Por favor ingresar el nombre del paciente");
  }

  const handleCreateTurn = () => {
    if (!patientName) return alert("Por favor ingresar el nombre del paciente");

    socket.emit("queue.add", {
      patientName,
      specialty,
      status: TurnStatus.WAITING,
    });

    setPatientName(''); //Limpiar el campo despues de crear el turno
  }

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 8 }}>
      <h2>Recepcion</h2>
      <div>
        <label>Nombre del paciente</label>
        <input
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          style={{ width: "100%", padding: 6, marginBottom: 10 }}
        />
      </div>
      <div>
        <label>Especialidad</label>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          style={{ width: "100%", padding: 6 }}
        >
          <option>Medicina General</option>
          <option>Pediatria</option>
          <option>Odontologia</option>
          <option>Radiologia</option>
        </select>
      </div>

      <button
        onClick={createTurn}
        style={{marginTop: 10, padding: 10, width: "100%"}}
      >
        Crear Turno
      </button>
    </div>
  );
}