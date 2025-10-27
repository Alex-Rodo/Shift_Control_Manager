import React, { useState } from 'react';

export default function DoctorPanel({ specialty }: { specialty: string }) {
  const [lastCalled, setLastCalled] = useState<string | null>(null);

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
