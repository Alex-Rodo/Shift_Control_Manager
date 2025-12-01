import { useEffect, useState } from "react";
import { socket } from "../socket";
import { TurnStatus } from "../types/TurnStatus";
import { Turn } from "../types/Turn";


export default function QueueList({ turns }: {turns:Turn[]}) {

    const [queue, setQueue] = useState<Turn[]>([]);

    useEffect(() => {
        socket.on("queue.snapshot", (data) => {
            setQueue(data);
        });

        return () => {
            socket.off("queue.snapshot");
        };
    }, []);

    function callTurn(id: string) {
        socket.emit("queue.update", {
            id,
            status: TurnStatus.CALLED
        });
    }

    const nextToCall = queue.find(t => t.status === TurnStatus.WAITING);

    return (
        <div>
            <h2>
                Sala de Espera
            </h2>
            {queue.map((t) => (
                <div key={t.id} style={{ margin: 10, padding: 10, border: "1px solid gray" }}>
                    <b>{t.name}</b> - {t.specialty}
                    <br />
                    Estado: {t.status}
                    <br />

                    {t.status === TurnStatus.WAITING && (
                        <button disabled={t.id !== nextToCall?.id} onClick={() => callTurn(t.id)}>
                            Llamar
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}