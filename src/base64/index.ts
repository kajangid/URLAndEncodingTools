/**
 * Base64 and Base64URL utilities. Works in both browser and Node.
 *
 * - `encode` / `decode` — standard Base64 (uses `btoa`/`atob` when available,
 *   falls back to a global `Buffer`).
 * - `encodeUrl` / `decodeUrl` — Base64URL: `-`/`_` instead of `+`/`/`,
 *   padding stripped on encode, re-padded on decode.
 * - `encodeBytes` / `decodeBytes` — operate on `Uint8Array` directly.
 * - `isBase64` / `isBase64Url` — format detection.
 *
 * All string APIs treat the input as UTF-8.
 */

export type Base64Alphabet = 'standard' | 'url';

interface B64Backing {
  encode: (bytes: Uint8Array) => string;
  decode: (s: string) => Uint8Array;
}

function getB64(): B64Backing {
  const g = globalThis as unknown as {
    btoa?: (s: string) => string;
    atob?: (s: string) => string;
    Buffer?: {
      from: (data: ArrayBuffer | Uint8Array | string, enc?: 'base64') => Uint8Array;
    };
  };

  if (typeof g.btoa === 'function' && typeof g.atob === 'function') {
    return {
      encode: (bytes) => {
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        return g.btoa!(binary);
      },
      decode: (s) => {
        const binary = g.atob!(s);
        const out = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
        return out;
      },
    };
  }
  if (g.Buffer) {
    return {
      encode: (bytes) => Buffer.from(bytes).toString('base64'),
      decode: (s) => {
        const buf = Buffer.from(s, 'base64');
        const out = new Uint8Array(buf.length);
        for (let i = 0; i < buf.length; i++) out[i] = buf[i] as number;
        return out;
      },
    };
  }
  throw new Error('No Base64 implementation available in this environment');
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/** Encode a string to standard Base64 (UTF-8). */
export function encode(input: string): string {
  return getB64().encode(textEncoder.encode(input));
}

/** Decode a standard Base64 string to text (UTF-8). */
export function decode(input: string): string {
  return textDecoder.decode(getB64().decode(input));
}

/** Encode a string to Base64URL (URL-safe, unpadded). */
export function encodeUrl(input: string): string {
  return encode(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a Base64URL string. Accepts both padded and unpadded input. */
export function decodeUrl(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad === 0 ? normalized : normalized + '='.repeat(4 - pad);
  return decode(padded);
}

/** Encode raw bytes as standard Base64. */
export function encodeBytes(input: Uint8Array): string {
  return getB64().encode(input);
}

/** Decode standard Base64 into raw bytes. */
export function decodeBytes(input: string): Uint8Array {
  return getB64().decode(input);
}

/** Encode raw bytes as Base64URL. */
export function encodeBytesUrl(input: Uint8Array): string {
  return encodeBytes(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode Base64URL into raw bytes. */
export function decodeBytesUrl(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad === 0 ? normalized : normalized + '='.repeat(4 - pad);
  return decodeBytes(padded);
}

/** Check whether a string looks like standard Base64. */
export function isBase64(input: string): boolean {
  return checkFormat(input, 'standard');
}

/** Check whether a string looks like Base64URL. */
export function isBase64Url(input: string): boolean {
  return checkFormat(input, 'url');
}

function checkFormat(input: string, kind: Base64Alphabet): boolean {
  if (typeof input !== 'string' || input.length === 0) return false;

  if (kind === 'standard') {
    // The core (padding stripped) must be only base64 chars; at most 2 trailing '='
    const stripped = input.replace(/=*$/, '');
    const pad = input.length - stripped.length;
    if (pad > 2) return false;
    if (!/^[A-Za-z0-9+/]+$/.test(stripped)) return false;
    // core length mod 4: 0 → no padding, 2 → two '=' chars, 3 → one '='.
    // mod 1 is never valid.
    const mod = stripped.length % 4;
    if (mod === 1) return false;
    if (mod === 0 && pad !== 0) return false;
    if (mod === 2 && pad !== 2) return false;
    if (mod === 3 && pad !== 1) return false;
    return true;
  }

  return /^[A-Za-z0-9_-]+$/.test(input);
}
