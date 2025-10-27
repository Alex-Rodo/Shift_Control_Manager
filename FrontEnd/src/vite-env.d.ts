/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string

  // agrega aquí otras variables que uses
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

VITE_WS_URL= "http://localhost:4000";
