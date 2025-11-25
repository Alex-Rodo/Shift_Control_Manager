import React, { useEffect, useState } from 'react';
import socket from '../socket';
import { snapshot } from 'node:test';
import { channel } from 'diagnostics_channel';

type Turn = {
  id: string;
  patientName: string;
  specialty: string;
  consultRoom: string | null;
  status: "waiting" | "called" | "completed" | "skipped";
};

export default function DoctorPanel({ specialty }: { specialty: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [lastCalled, setLastCalled] = useState<string | null>(null);

  useEffect(()=> {
    socket.emit("suscribe", { channel: specialty });
    socket.on("queue.snapshot", (snapshot: Turn[]) => {
      setTurns(snapshot.filter((t) => t.specialty));
    })
  })

  async function callNext() {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/turns/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialty })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'No hay más turnos' }));
      alert(err.error || 'Error');
      return;
    }
    const t = await res.json();
    setLastCalled(t.patient_name || t.patientName || t.patientName);
    alert(`Llamando a ${t.patient_name || t.patientName}`);
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={callNext}>Llamar siguiente ({specialty})</button>
      <div>Último llamado: {lastCalled || '—'}</div>
    </div>
  );
}
