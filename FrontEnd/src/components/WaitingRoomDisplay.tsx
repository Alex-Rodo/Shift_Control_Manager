import { use, useEffect, useRef, useState } from 'react';
import socket from '../socket';
import { TurnStatus } from "../types/TurnStatus";
import { Turn } from '../types/Turn';
import { channel } from 'diagnostics_channel';

export default function WaitingRoomDisplay({
  title = "Sala de Espera",
  specialtyFilter = null,
}: {
  title?: string;
  specialtyFilter?: string | null;
}) {
  const [queue, setQueue] = useState<Turn[]>([]);
  const [lastCalled, setLastCalled] = useState<Turn | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  //Audio cuando llaman un turno
  useEffect(() => {
    audioRef.current = new Audio("/sounds/turn_called.mp3");
    audioRef.current.volume = 0.8;
  }, []);

  useEffect(() => {
    function handleSnapshot(data: Turn[]) {
      setQueue(data);
    }

    function handleAdd(turn: Turn) {
      setQueue((prev) => [...prev, turn]);
    }

    function handleUpdate(updated: Turn) {
      setQueue((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );

      //Si el turno vambia a CALLED -> reproducir sonido
      if (updated.status === TurnStatus.CALLED) {
        if (!specialtyFilter || updated.specialty === specialtyFilter) {
          setLastCalled(updated);
          audioRef.current?.play().catch(() => { });
        }
      }
    }

    function handleDelete(id: string) {
      setQueue((prev) => prev.filter((t) => t.id !== id));
    }

    socket.on("queue.snapshot", handleSnapshot);
    socket.on("queue.add", handleAdd);
    socket.on("queue.update", handleUpdate);
    socket.on("queue.remove", handleDelete);

    //Suscribe by channel / specialty 
    socket.emit("suscribe", { channel: specialtyFilter || "global" });

    return () => {
      socket.off("queue.snapshot", handleSnapshot);
      socket.off("queue.add", handleAdd);
      socket.off("queue.update", handleUpdate);
      socket.off("queue.remove", handleDelete);
    };
  }, [specialtyFilter]);

  const filteredQueue = specialtyFilter
    ? queue.filter((t) => t.specialty === specialtyFilter)
    : queue;

  const waiting = filteredQueue.filter((t) => t.status === TurnStatus.WAITING);
  const called = filteredQueue.filter((t) => t.status === TurnStatus.CALLED);

  return (
    <div className='p-4 bg-white shadow-md rounded-md'>
      <header>
        <div>
          <h2 className='text-xl font-bold'>
            {title}
          </h2>
          {specialtyFilter && <div className='text-sm text-gray-500'>
            {specialtyFilter}
          </div>
          }
        </div>
        <div className='text-sm text-gray-600'>
          Turnos: {filteredQueue.length}
        </div>
      </header>
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
