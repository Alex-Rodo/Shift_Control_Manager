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
      </header> //
      {/* Ultimo turno atendido con numero grande */}
      {lastCalled && (
        <div className='mb-6 text-center'>
          <div className='text-5xl font-extrabold text-green-600'>
            T-{String(lastCalled.turnNumber).padStart(3, '0')}
          </div>
          <div className='mt-1 text-lg'>
            {lastCalled.name} -
            <span className='text-sm text-gray-500'>
              {lastCalled.specialty}
            </span>
          </div>
        </div>
      )}

      <section className='mb-4'>
        <h4 className='font-semibold'>
          En Espera:
        </h4>
        {waiting.length === 0 && (
          <div className='text-gray-500 italic mt-2'>
            No hay turnos en espera.
          </div>
        )}
        {waiting.map((t) => (
          <div key={t.id} className='border p-2 mt-2 rounded flex justify-between items-center'>
            <div>
              <div className='font-medium'>
                T-{String(t.turnNumber).padStart(3, '0')} -
                {t.name}
              </div>
              <div className='text-sm text-gray-500'>
                {t.specialty}
              </div>
            </div>
            <div className='text-sm text-gray-600'>
              {t.status}
            </div>
          </div>
        ))}
      </section>
      <br />

      <section>
        <h4 className='font-semibold text-gray-700'>
          Llamados:
        </h4>
        {called.length === 0 &&
          <div className='text-sm text-gray-500'>
            No hay turnos llamados.
          </div>
        }
        {called.map((t) => (
          <div key={t.id} className='border p-2 mt-2 rounded bg-green-50 flex justify-between items-center'>
            <div>
              <div className='font-medium'>
                T-{String(t.turnNumber).padStart(3, '0')} -
                {t.name}
              </div>
              <div className='text-sm text-gray-500'>
                {t.specialty}
              </div>
            </div>
            <div className='text-sm text-indigo-600 font-semibold'>
              LLAMADO
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
