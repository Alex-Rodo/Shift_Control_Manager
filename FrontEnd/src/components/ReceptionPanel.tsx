import React, { useState } from 'react';
import socket from '../socket';
import e from 'cors';

export default function ReceptionPanel() {
  const [patientName, setPatientName] = useState('');
  const [specialty, setSpecialty] = useState('Medicina General');
  const [scheduledAt, setScheduledAt] = useState<string>('');

  const handleCreateTurn = () => {
    if (!patientName) return alert("Por favor ingresar el nombre del paciente");

    const newTurn = {
      id: Date.now().toString(),
      patientName,
      specialty,
      consultRoom: null,
      scheduledAt,
      status: "waiting",
    };

    socket.emit("queue.add", newTurn);
    setPatientName("");
    setScheduledAt("");
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-2">LINEA DE FRENTE</h2>

      <input
      type='text'
      placeholder='Nombre paciente'
      value={patientName}
      onChange={(e) => setPatientName(e.target.value)}
      className='border p-2 rounded w-full mb-2'
      />

      <select
      value={specialty}
      onChange={(e) => setSpecialty(e.target.value)}
      className='border p-2 rounded w-full mb-2'
      >
        <option value="Mamografia"></option>
        <option value="Pediatria"></option>
        <option value="Odontologia"></option>
      </select>

      <input 
      type="datetime-local"
      value={scheduledAt}
      onChange={(e) => setScheduledAt(e.target.value)}
      className='border p-2 rounded w-full mb-2' 
      />

      <button onClick={handleCreateTurn} className='bg-blue-600 text-white px-4 py-2 rounded w-full'>
        Crear Turno
      </button>
    </div>
  );
}
