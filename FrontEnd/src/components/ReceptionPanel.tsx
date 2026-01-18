import { useState } from 'react';
import { socket } from '../socket';
import { TurnStatus } from "../types/TurnStatus";

export default function ReceptionPanel() {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Seleccione la especialidad');

  function createTurn() {
    if (!name.trim())
      return alert("Por favor ingresar el nombre del paciente");

    if (specialty === 'Seleccione la especialidad') {
      alert("Por favor seleccionar una especialidad valida");
      return;
    }

    // Envia la data minima; el backend asigna id/turnNumber/status
    socket.emit("queue.add", {
      name,
      specialty,
      status: TurnStatus.WAITING,
    });
    setName(''); //Limpiar el campo despues de crear el turno
  }

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 8 }}>
      <h2>Recepcion</h2>
      <div>
        <label className='block text-sm text-gray-600'>Nombre del paciente</label>
        <input
          placeholder='Nombre del paciente'
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 6, marginBottom: 10 }}
        />
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