/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // добавяй още env променливи тук при нужда
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
