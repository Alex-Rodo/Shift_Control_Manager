import { use, useEffect, useState } from 'react';
import socket from '../socket';
import { TurnStatus } from "../types/TurnStatus";
import { Turn } from '../types/Turn';

export default function WaitingRoomDisplay({
  title,
  specialtyFilter
}: {
  title: string;
  specialtyFilter: string;
}) {
  const [queue, setQueue] = useState<Turn[]>([]);
  const [lastCalled, setLastCalled] = useState<Turn | null>(null);

  //Audio cuando llaman un turno
  const audio = new Audio('/notification.mp3');

  useEffect(() => {
    socket.on("queue.snapshot", (data: Turn[]) => {
      setQueue(data);
    });

    socket.on("queue.updated", (updated: Turn) => {
      setQueue((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );

      //Si el turno vambia a CALLED -> reproducir sonido
      if (updated.status === TurnStatus.CALLED) {
        setLastCalled(updated);
        audio.play().catch(() => { });
      }
    });

    return () => {
      socket.off("queue.snapshot");
      socket.off("queue.updated");
    };
  }, []);

  const filteredQueue = queue.filter(
    t => t.specialty === specialtyFilter
  );

  const waiting = filteredQueue.filter((t) => t.status === TurnStatus.WAITING);
  const called = filteredQueue.filter((t) => t.status === TurnStatus.CALLED);

  return(
    <div className='p-4 bg-white shadow-md rounded-md'>
      <h2 className='text-xl font-bold mb-2'>
        {title}
      </h2>
      <h3 className='text-lg mb-4 text-gray-600'>
        {specialtyFilter}
      </h3>
      {/* Ultimo turno atendido con numero grande */}
      {lastCalled && (
        <div className='mb-6 text-center'>
          <div className='text-4xl font-extrabold text-green-600'>
            Turno {lastCalled.turnNumber}
          </div>
          <div className='text-xl'>
            {lastCalled.name}
          </div>
        </div>
      )}
      <h4 className='font-semibold'>
        En Espera: 
      </h4>
      {waiting.map((t) => (
        <div key={t.id} className='border p-2 mt-2 rounded'>
            Turno {t.turnNumber} - <b>{t.name}</b>
        </div>
      ))}
      <br />

      <h4 className='font-semibold'>
        Llamados:
      </h4>
      {called.map((t) => (
        <div key={t.id} className='border p-2 mt-2 rounded bg-green-100'>
            Turno: {t.turnNumber} - <b>{t.name}</b>
        </div>
      ))}
    </div>
  );
}
