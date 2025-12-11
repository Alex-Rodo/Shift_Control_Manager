import { useEffect, useState } from 'react';
import socket from '../socket';
import { TurnStatus } from "../types/TurnStatus";
import { Turn } from '../types/Turn';

export default function DoctorPanel({ specialty }: { specialty: string }) {
  const [queue, setQueue] = useState<Turn[]>([]);
  const [lastCalled, setLastCalled] = useState<Turn | null>(null);

  useEffect(() => {
    //snapshot + updates
    function onSnapshot(data: Turn[]) {
      setQueue(data.filter((t) => t.specialty === specialty));
    }
    function onAdd(t: Turn) {
      if (t.specialty === specialty) setQueue((prev) => [...prev, t]);
    }
    function onUpdate(u: Turn) {
      if (u.specialty !== specialty) return;
      setQueue((prev) => prev.map((p) => (p.id === u.id ? u : p)));
      if (u.status === TurnStatus.CALLED) setLastCalled(u);
    }
    function onRemove(id: string) {
      setQueue((prev) => prev.filter((p) => p.id !== id));
    }
    function onError(err: any) {
      alert(err.message || "Error del servidor");
    }

    socket.on("queue.snapshot", onSnapshot);
    socket.on("queue.add", onAdd);
    socket.on("queue.update", onUpdate);
    socket.on("queue.remove", onRemove);
    socket.on("error", onError);

    //Suscribe optionally
    socket.emit("suscribe", { channel: specialty });

    return () => {
      socket.off("queue.snapshot", onSnapshot);
      socket.off("queue.add", onAdd);
      socket.off("queue.update", onUpdate);
      socket.off("queue.remove", onRemove);
      socket.off("error", onError);
    };
  }, [specialty]);

  const waiting = queue.filter((t) => t.status === TurnStatus.WAITING);
  const nextToCall = waiting[0];

  function callTurn() {
    if (!nextToCall) return alert("No hay turnos para llamar");
    socket.emit("queue.update", { id: nextToCall.id, status: TurnStatus.CALLED });
  }

  function completeTurn(id: string) {
    socket.emit("queue.update", { id, status: TurnStatus.DONE });
  }

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 8 }}>
      <h2>
        Medico ({specialty})
      </h2>
      <div className='mb-3'>
        <button
          onClick={callTurn}
          className='w-full bg-green-600 text-white py-2 rounded'
          disabled={!nextToCall}
        >
          Llamar Siguiente Turno
        </button>
      </div>
      <div className='text-sm text-gray-600 mb-2'>
        último llamado: {lastCalled ? `T-${String(lastCalled.turnNumber).padStart(3, '0')} - ${lastCalled.name}` : '-'}
      </div>
      <div>
        {queue.map((t) =>
          <div key={t.id} className='p-2 border-b'>
            <div className='flex justify-between'>
              <div>
                <div className='font-medium'>
                  T-{String(t.turnNumber).padStart(3, '0')} - {t.name}
                </div>
                <div className='text-xs text-gray-500'>
                  {t.specialty}
                </div>
                {t.status === TurnStatus.CALLED ? (
                  <button onClick={() => completeTurn(t.id)} className='mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs'>
                    Completar Turno
                  </button>
                ) : (
                  <div className='mt-2 text-xs text-gray-400'>
                    Esperando
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


