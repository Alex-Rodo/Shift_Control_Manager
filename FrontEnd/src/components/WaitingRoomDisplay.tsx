import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { TurnStatus } from "../types/TurnStatus";
import { Turn } from '../types/Turn';

interface Props {
  specialtyFilter?: string;
  title: string;
}

export default function WaitingRoomDisplay({
  specialtyFilter,
  title
}: Props) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  //Audio cuando llaman un turno
  useEffect(() => {
    audioRef.current = new Audio("/public/audio/ding-47489.mp3");
    audioRef.current.volume = 0.8;
  }, []);

  useEffect(() => {
    console.log("WaitingRoomDisplay mounted");

    socket.on("queue.snapshot", (data: Turn[]) => {
      console.log("Snapshot received: ", data);
      setTurns(data);
    });

    socket.on("queue.update", (turn: Turn) => {
      if (turn.status === TurnStatus.CALLED) {
        audioRef.current?.play();
      }
    });

    return () => {
      socket.off("queue.snapshot");
      socket.off("queue.update");
    };
  }, []);

  const filtered = specialtyFilter
    ? turns.filter(t => t.specialty === specialtyFilter)
    : turns;

  const waiting = filtered.filter((t) => t.status === TurnStatus.WAITING);
  const called = filtered.filter((t) => t.status === TurnStatus.CALLED);

  return (
    <div>
      <h2>
        {title}
      </h2>
      <p>{specialtyFilter}</p>
      <p>Turnos: {filtered.length}</p>

      <h3>En Espera</h3>
      {waiting.length === 0 && <p>No hay turnos en espera.</p>}
      {waiting.map((t, i) => (
        <div key={t.id}>
          <b>Turno: {i + 1}</b> - {t.name}
        </div>
      ))}

      <h3>Llamados</h3>
      {called.length === 0 && <p>No hay turnos llamados.</p>}
      {called.map((t) => (
        <div key={t.id}>
          <b>{t.name}</b> - Consultorio
        </div>
      ))}

      <audio ref={audioRef} src="/audio/ding-47489.mp3" />
    </div> 
  );
}