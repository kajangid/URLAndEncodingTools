import { describe, it, expect } from 'vitest';
import {
  encode,
  decode,
  encodeUrl,
  decodeUrl,
  encodeBytes,
  decodeBytes,
  encodeBytesUrl,
  decodeBytesUrl,
  isBase64,
  isBase64Url,
} from './index.js';

describe('base64', () => {
  it('round-trips ASCII', () => {
    expect(decode(encode('hello world'))).toBe('hello world');
  });

  it('round-trips UTF-8', () => {
    const s = '你好,世界 🚀';
    expect(decode(encode(s))).toBe(s);
  });

  it('handles empty string', () => {
    expect(encode('')).toBe('');
    expect(decode('')).toBe('');
  });

  it('produces URL-safe output', () => {
    const enc = encodeUrl('subjects/?+');
    expect(enc).not.toContain('+');
    expect(enc).not.toContain('/');
    expect(enc).not.toContain('=');
  });

  it('round-trips URL-safe without padding', () => {
    const s = 'data with ?+/?';
    expect(decodeUrl(encodeUrl(s))).toBe(s);
  });

  it('decodes padded input', () => {
    expect(decodeUrl('aGVsbG8=')).toBe('hello');
  });

  it('encodeBytes and decodeBytes round-trip', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 255]);
    expect(Array.from(decodeBytes(encodeBytes(bytes)))).toEqual(Array.from(bytes));
  });

  it('encodeBytesUrl produces URL-safe bytes', () => {
    const bytes = new Uint8Array([0xff, 0xfe, 0xfd]);
    const enc = encodeBytesUrl(bytes);
    expect(enc).not.toContain('+');
    expect(enc).not.toContain('/');
    expect(decodeBytesUrl(enc)).toEqual(bytes);
  });

  it('isBase64 validates correctly', () => {
    expect(isBase64('aGVsbG8=')).toBe(true);
    expect(isBase64('aGVsbG8h')).toBe(true);
    expect(isBase64('')).toBe(false);
    expect(isBase64('not!valid')).toBe(false);
  });

  it('isBase64Url validates correctly', () => {
    expect(isBase64Url('aGVsbG8')).toBe(true);
    expect(isBase64Url('a-_b')).toBe(true);
    expect(isBase64Url('a+b')).toBe(false);
    expect(isBase64Url('a/b')).toBe(false);
  });
});
