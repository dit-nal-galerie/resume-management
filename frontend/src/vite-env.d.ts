/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_TYPE: string;
  readonly VITE_API_URL_PHP: string;
  readonly VITE_API_URL_NODE: string;
  // Weitere Variablen hier
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
