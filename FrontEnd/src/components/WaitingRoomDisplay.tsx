import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

type Turn = {
  id: string;
  patientName: string;
  specialty: string;
  consultRoom: string | null;
  scheduledAt?: string | null;
  status: 'waiting' | 'called' | 'completed' | 'skipped';
};

export default function WaitingRoomDisplay({
  wsUrl,
  specialtyFilter = null,
  title = 'Sala de Espera',
}: {
  wsUrl?: string;
  specialtyFilter?: string | null;
  title?: string;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [connected, setConnected] = useState(false);

  const resolvedWsUrl =
    wsUrl ??
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_WS_URL) ??
    (typeof window !== 'undefined' && (window as any).__REACT_APP_WS_URL) ??
    'http://localhost:4000';

  useEffect(() => {
    const socket = io(resolvedWsUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('subscribe', { channel: specialtyFilter || 'global' });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('queue.snapshot', (snapshot: Turn[]) => {
      setTurns(snapshot.filter(t => (specialtyFilter ? t.specialty === specialtyFilter : true)));
    });

    socket.on('queue.add', (t: Turn) => {
      if (!specialtyFilter || t.specialty === specialtyFilter) setTurns(prev => [...prev, t]);
    });

    socket.on('queue.update', (t: Turn) => {
      setTurns(prev => prev.map(p => (p.id === t.id ? t : p)));
    });

    socket.on('queue.remove', (id: string) => {
      setTurns(prev => prev.filter(p => p.id !== id));
    });

    socket.on('connect_error', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [resolvedWsUrl, specialtyFilter]);

  const topTurns = turns
    .filter(t => t.status === 'waiting' || t.status === 'called')
    .sort((a, b) => {
      const aTime = a.scheduledAt || '';
      const bTime = b.scheduledAt || '';
      if (aTime === bTime) return 0;
      return aTime > bTime ? 1 : -1;
    })
    .slice(0, 10);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="text-sm">
            <span className={`px-2 py-1 rounded ${connected ? 'bg-green-100' : 'bg-red-100'}`}>
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topTurns.map(turn => (
            <div key={turn.id} className="p-4 bg-white rounded-2xl shadow-sm flex justify-between items-center">
              <div>
                <div className="text-xl font-semibold">{turn.patientName}</div>
                <div className="text-sm text-gray-500">{turn.specialty} • {turn.consultRoom || 'Por asignar'}</div>
                {turn.scheduledAt && <div className="text-xs text-gray-400">Cita: {new Date(turn.scheduledAt).toLocaleString()}</div>}
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${turn.status === 'called' ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {turn.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}

          {topTurns.length === 0 && (
            <div className="p-6 bg-white rounded-2xl shadow-sm col-span-full text-center text-gray-600">No hay turnos en espera</div>
          )}
        </div>

        <footer className="mt-6 text-xs text-gray-400">Última actualización: {new Date().toLocaleTimeString()}</footer>
      </div>
    </div>
  );
}
