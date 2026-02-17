import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function getCanisterIds() {
  try {
    const envPath = resolve(__dirname, '.env');
    const content = readFileSync(envPath, 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const match = line.match(/^(\w+)=(.+)$/);
      if (match) vars[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
    return vars;
  } catch {
    return {};
  }
}

export default defineConfig(({ mode: _mode }) => {
  const env = getCanisterIds();
  const canisterId = env.CANISTER_ID_NFT || process.env.CANISTER_ID_NFT || '';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:4943',
          changeOrigin: true,
          // Set Host header to raw subdomain to bypass response verification
          headers: {
            Host: `${canisterId}.raw.localhost`,
          },
        },
      },
    },
    define: {
      'process.env.CANISTER_ID_NFT': JSON.stringify(canisterId),
      'process.env.DFX_NETWORK': JSON.stringify(env.DFX_NETWORK || process.env.DFX_NETWORK || 'local'),
      'global': 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: { global: 'globalThis' },
      },
    },
  };
});
