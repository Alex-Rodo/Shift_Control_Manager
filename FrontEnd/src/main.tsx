import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from "react-dom/client";


import './index.css';
import App from './App';

import socket from "./socket"; // 👈 Importante: esto inicializa la conexión

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
createRoot(document.getElementById('root')!).render(<App/>);
