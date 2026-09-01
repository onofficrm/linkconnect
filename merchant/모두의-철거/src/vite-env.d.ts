/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LC_DRY_RUN?: string;
  readonly VITE_USE_MERCHANT_STATIC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
