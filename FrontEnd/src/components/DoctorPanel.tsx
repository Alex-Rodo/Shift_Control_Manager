import { useEffect, useState } from 'react';
import socket from '../socket';
import { TurnStatus } from "../types/TurnStatus";
import { Turn } from '../types/Turn';

export default function DoctorPanel({ specialty }: { specialty: string }) {
  const [queue, setQueue] = useState<Turn[]>([]);

  useEffect(() => {
    socket.on("queue.snapshot", (data: Turn[]) => {
      setQueue(data.filter((t) => t.specialty === specialty));
    });

    return () => {
      socket.off("queue.snapshot");
    };
  }, [specialty]);

  const nextToCall = queue.find((t) => t.status === TurnStatus.WAITING);

  function callTurn(id: string) {
    socket.emit("queue.update", { id, status: TurnStatus.CALLED });
  }

  function completeTurn(id: string) {
    socket.emit("queue.update", { id, status: TurnStatus.DONE });
  }

  return (
    <div style={{ padding: 20, border: "1px solid gray", borderRadius: 8 }}>
      <h2>
        Medico ({specialty})
      </h2>
      {
        queue.map(t => (
          <div key={t.id} style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
            <b>
              {t.name}
            </b>
            <br />
            Estado: {t.status}
            <br />
            {/* -------- BOTON LLAMAR -------- */}
            {t.status === TurnStatus.WAITING && (
              <button disabled={t.id !== nextToCall?.id}
                onClick={() => callTurn(t.id)}
                style={{ marginTop: 5 }}>
                Llamar
              </button>
            )}

            {/* -------- BOTON COMPLETAR -------- */}
            {t.status === TurnStatus.CALLED && (
              <button onClick={() => completeTurn(t.id)} style={{ marginTop: 5 }}>
                Completar Consulta
              </button>
            )}
          </div>
        ))
      }
    </div>
  );
}


