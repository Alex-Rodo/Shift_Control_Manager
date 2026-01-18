import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { TurnStatus } from "../types/TurnStatus";
import { Turn } from '../types/Turn';
import { data } from 'react-router-dom';

export default function DoctorPanel({ specialty }: { specialty: string }) {
  const [queue, setQueue] = useState<Turn[]>([]);
  const [lastCalled, setLastCalled] = useState<Turn | null>(null);

  useEffect(() => {
    //snapshot + updates
    socket.on("queue.snapshot", (data: Turn[]) => {
      setQueue(data.filter(t => t.specialty === specialty));
    })

    socket.on("queue.update", (t: Turn) => {
      if (t.status === TurnStatus.CALLED) {
        setLastCalled(t);
      }
    });

    return () => {
      socket.off("queue.snapshot");
      socket.off("queue.update");
    };
  }, []);

  const next = queue.find(t => t.status === TurnStatus.WAITING);

  function callNext() {
    if (!next) return;

    socket.emit("queue.update", {
      id: next.id, status: TurnStatus.CALLED
    });
  }

  return (
    <div>
      <h2>
        Medico ({specialty})
      </h2>
      <button onClick={callNext} disabled={!next}>
        Llamar Siguiente turno
      </button>
      <p>Ultimo llamado: {lastCalled?.name ?? "-"}</p>
    </div>
  );
}