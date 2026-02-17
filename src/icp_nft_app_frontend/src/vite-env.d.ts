/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    CANISTER_ID_NFT: string;
    DFX_NETWORK: string;
  }
}
