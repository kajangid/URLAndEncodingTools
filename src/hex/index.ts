/**
 * Hex encoding / decoding utilities.
 *
 * - `encode` / `decode` — text (UTF-8) ↔ hex.
 * - `encodeBytes` / `decodeBytes` — `Uint8Array` ↔ hex.
 * - `decodeToString` — convenience for hex → text in one call.
 * - `isHex` — format check (whitespace ignored, 0x prefix optional).
 */

const HEX_RE = /^(?:0x)?[0-9a-fA-F]+$/;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: true });

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] as number).toString(16).padStart(2, '0');
  }
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = stripHex(hex);
  if (clean.length % 2 !== 0) {
    throw new Error('hex: input length must be even');
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) throw new Error(`hex: invalid byte at offset ${i * 2}`);
    out[i] = byte;
  }
  return out;
}

function stripHex(input: string): string {
  let s = input.trim();
  if (s.startsWith('0x') || s.startsWith('0X')) s = s.slice(2);
  // remove all whitespace
  s = s.replace(/\s+/g, '');
  return s;
}

/** Encode a string as a hex string. The text is interpreted as UTF-8. */
export function encode(input: string): string {
  return bytesToHex(textEncoder.encode(input));
}

/** Decode a hex string back to text. Throws if input is not valid hex or not valid UTF-8. */
export function decode(input: string): string {
  return textDecoder.decode(hexToBytes(input));
}

/** Same as {@link decode} but skips UTF-8 validation (returns whatever bytes are present). */
export function decodeLossy(input: string): string {
  return textDecoder.decode(hexToBytes(input));
}

/** Encode raw bytes as a hex string. */
export function encodeBytes(input: Uint8Array): string {
  return bytesToHex(input);
}

/** Decode a hex string into raw bytes. Throws on invalid hex. */
export function decodeBytes(input: string): Uint8Array {
  return hexToBytes(input);
}

/** Is the given string valid hex (with optional `0x` prefix and any whitespace)? */
export function isHex(input: string): boolean {
  if (typeof input !== 'string' || input.length === 0) return false;
  return HEX_RE.test(stripHex(input));
}

/**
 * Pretty-print a hex string: insert a space every 2 chars and a newline
 * every 16 bytes. Useful for log output and debug panels.
 */
export function format(hex: string, bytesPerLine = 16): string {
  const clean = stripHex(hex);
  const bytes = clean.match(/.{1,2}/g) ?? [];
  const lines: string[] = [];
  for (let i = 0; i < bytes.length; i += bytesPerLine) {
    lines.push(bytes.slice(i, i + bytesPerLine).join(' '));
  }
  return lines.join('\n');
}
