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

  useEffect(() => {
    socket.emit("suscribe", { channel: specialty });
    socket.on("queue.snapshot", (snapshot: Turn[]) => {
      setTurns(snapshot.filter((t) => t.specialty));
    });

    socket.on("queue.add", (turn: Turn) => {
      if (turn.specialty === specialty) setTurns((prev) => [...prev, turn]);
    });
    socket.on("queue.update", (turn: Turn) => {
      if (turn.specialty === specialty)
        setTurns((prev) => prev.map((p) => (p.id === turn.id ? turn : p)));
    });

    socket.on("queue.remove", (id: string) =>
      setTurns((prev) => prev.filter((p) => p.id !== id))
    );

    return () => {
      socket.off("queue.snapshot");
      socket.off("queue.add");
      socket.off("queue.update");
      socket.off("queue.remove");
    };
  }, [specialty]);

  const callNextTurn = () => {
    const nextTurn = turns.find((t) => t.status === "waiting");
    if (!nextTurn) return alert("No hay turnos en espera");

    const updatedTurn = { ...nextTurn, status: "called" };
    socket.emit("queue.update", updatedTurn);
    setLastCalled(nextTurn.patientName);
  };

  return (
    <div className='p-4 bg-white rounded-2xl shadow'>
      <h2 className='text-lg font-semibold mb-2'>
        Medico ({specialty})
      </h2>
      <button onClick={callNextTurn} className='bg-green-600 text-white px-4 py-2 rounded w-full mb-2'>
        Llamar Siguiente Turno
      </button>
      <div className='text-sm text-gray-600'>
        Ultimo Llamado: {lastCalled || "Ninguno"}
      </div>
    </div>
  );
}


