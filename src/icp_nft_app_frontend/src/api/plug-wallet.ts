import { Principal } from '@dfinity/principal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    ic?: {
      plug?: any;
    };
  }
}

/** Check if Plug wallet extension is installed */
export function isPlugAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.ic?.plug;
}

/** Check if Plug is currently connected */
export async function isPlugConnected(): Promise<boolean> {
  if (!isPlugAvailable()) return false;
  try {
    return await window.ic!.plug!.isConnected();
  } catch {
    return false;
  }
}

/** Connect Plug wallet. Returns principal + accountId on success. */
export async function connectPlug(
  whitelist: string[] = []
): Promise<{ principal: string; accountId: string }> {
  if (!isPlugAvailable()) {
    throw new Error('Plug wallet is not installed. Get it at plugwallet.ooo');
  }

  const connected = await window.ic!.plug!.requestConnect({
    whitelist,
    host: 'https://ic0.app',
  });

  if (!connected) {
    throw new Error('Connection rejected');
  }

  return {
    principal: window.ic!.plug!.principalId,
    accountId: window.ic!.plug!.accountId,
  };
}

/** Disconnect Plug wallet */
export function disconnectPlug(): void {
  if (isPlugAvailable()) {
    try { window.ic!.plug!.disconnect(); } catch { /* ignore */ }
  }
}

// ─── AccountIdentifier computation ──────────────────────────────────

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** SHA-224 (pure JS — same as SHA-256 with different IV, truncated to 28 bytes) */
function sha224(data: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const bitLen = data.length * 8;
  const padLen = (data.length % 64 < 56 ? 56 : 120) - (data.length % 64);
  const padded = new Uint8Array(data.length + 1 + padLen + 8);
  padded.set(data);
  padded[data.length] = 0x80;
  new DataView(padded.buffer).setUint32(padded.length - 4, bitLen >>> 0, false);

  let h0 = 0xc1059ed8, h1 = 0x367cd507, h2 = 0x3070dd17, h3 = 0xf70e5939;
  let h4 = 0xffc00b31, h5 = 0x68581511, h6 = 0x64f98fa7, h7 = 0xbefa4fa4;

  const w = new Array<number>(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    const view = new DataView(padded.buffer, offset, 64);
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(28);
  const rv = new DataView(out.buffer);
  rv.setUint32(0, h0, false); rv.setUint32(4, h1, false); rv.setUint32(8, h2, false);
  rv.setUint32(12, h3, false); rv.setUint32(16, h4, false); rv.setUint32(20, h5, false);
  rv.setUint32(24, h6, false);
  return out;
}

function crc32(data: Uint8Array): Uint8Array {
  const tbl = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    tbl[i] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of data) crc = tbl[(crc ^ b) & 0xff] ^ (crc >>> 8);
  crc = (crc ^ 0xffffffff) >>> 0;
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, crc, false);
  return out;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute ICP AccountIdentifier from a principal text (default sub-account).
 * Returns 64-char hex string.
 */
export function principalToAccountId(principalText: string, subaccount?: Uint8Array): string {
  const principalBytes = Principal.fromText(principalText).toUint8Array();
  const sub = subaccount || new Uint8Array(32);
  // Domain separator: byte 0x0A + "account-id"
  const prefix = new Uint8Array([10, 97, 99, 99, 111, 117, 110, 116, 45, 105, 100]);
  const blob = new Uint8Array(prefix.length + principalBytes.length + sub.length);
  blob.set(prefix, 0);
  blob.set(principalBytes, prefix.length);
  blob.set(sub, prefix.length + principalBytes.length);

  const hash = sha224(blob);
  const check = crc32(hash);
  const accountId = new Uint8Array(32);
  accountId.set(check, 0);
  accountId.set(hash, 4);
  return toHex(accountId);
}
