import { useState } from 'react';
import socket from '../socket';
import { TurnStatus } from "../types/TurnStatus";

export default function ReceptionPanel() {
  const [patientName, setPatientName] = useState('');
  const [specialty, setSpecialty] = useState('Medicina General');

  function createTurn() {
    if (!patientName.trim()) return alert("Por favor ingresar el nombre del paciente");

    // Envia la data minima; el backend asigna id/turnNumber/status
    socket.emit("queue.add", {
      patientName: patientName.trim(),
      specialty,
      status: TurnStatus.WAITING,
    });
    setPatientName(''); //Limpiar el campo despues de crear el turno
  }

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 8 }}>
      <h2>Recepcion</h2>
      <div>
        <label className='block text-sm text-gray-600'>Nombre del paciente</label>
        <input
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          style={{ width: "100%", padding: 6, marginBottom: 10 }}
        />
      </div>
      <div>
        <label className='block text-sm text-gray-600'>Especialidad</label>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          style={{ width: "100% ", padding: 6 }}
        >
          <option>Medicina General</option>
          <option>Pediatria</option>
          <option>Odontologia</option>
          <option>Radiologia</option>
        </select>
      </div>

      <button
        onClick={createTurn}
        className='w-full bg-blue-600 text-white py-2 rounded'
      >
        Crear Turno
      </button>
    </div>
  );
}