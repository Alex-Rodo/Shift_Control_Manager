import { useState } from "react";
import { socket } from "../socket";

export function CreateTurn() {
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");

    function addTurn() {
        socket.emit("queue.add", {
            name,
            specialty,
        });

        setName("");
        setSpecialty("");
    }

    return (
        <div>
            <h2>
                Crear Turno
            </h2>
            <input
                placeholder="Nombre"
                value={name}
                onChange={(e) => setSpecialty(e.target.value)}
            />

            <button onClick={addTurn}>
                Crear
            </button>
        </div>
    );
}