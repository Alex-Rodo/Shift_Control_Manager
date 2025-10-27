import React, { useState } from 'react';

export default function ReceptionPanel() {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Medicina General');
  const [scheduledAt, setScheduledAt] = useState<string>('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return alert('Nombre requerido');
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/turns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName: name, specialty, scheduledAt: scheduledAt || null })
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Error: ' + (err?.error || res.statusText));
    } else {
      setName('');
      alert('Turno creado');
    }
  }

  return (
    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input placeholder="Nombre paciente" value={name} onChange={e => setName(e.target.value)} />
      <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
        <option>Medicina General</option>
        <option>Pediatría</option>
        <option>Odontología</option>
      </select>
      <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
      <button type="submit">Crear turno</button>
    </form>
  );
}
