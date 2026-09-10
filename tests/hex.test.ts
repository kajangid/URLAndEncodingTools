import { describe, it, expect } from 'vitest';
import { encode, decode, encodeBytes, decodeBytes, isHex, format } from '../src/hex/index.js';

describe('encode / decode (text)', () => {
  it('round-trips ASCII', () => {
    expect(decode(encode('Hello'))).toBe('Hello');
  });

  it('round-trips UTF-8', () => {
    const s = '你好';
    expect(decode(encode(s))).toBe(s);
  });

  it('encodes bytes 0-15 with leading zero', () => {
    expect(encodeBytes(new Uint8Array([0, 1, 15]))).toBe('00010f');
  });
});

describe('decodeBytes', () => {
  it('decodes to bytes', () => {
    expect(Array.from(decodeBytes('deadbeef'))).toEqual([0xde, 0xad, 0xbe, 0xef]);
  });

  it('handles 0x prefix', () => {
    expect(Array.from(decodeBytes('0xdeadbeef'))).toEqual([0xde, 0xad, 0xbe, 0xef]);
  });

  it('handles whitespace', () => {
    expect(Array.from(decodeBytes('de ad be ef'))).toEqual([0xde, 0xad, 0xbe, 0xef]);
  });

  it('throws on odd length', () => {
    expect(() => decodeBytes('abc')).toThrow();
  });
});

describe('isHex', () => {
  it('accepts valid hex', () => {
    expect(isHex('deadbeef')).toBe(true);
    expect(isHex('0xDEADBEEF')).toBe(true);
    expect(isHex('de ad be ef')).toBe(true);
  });
  it('rejects invalid', () => {
    expect(isHex('xyz')).toBe(false);
    expect(isHex('')).toBe(false);
  });
});

describe('format', () => {
  it('groups bytes with a space and breaks lines', () => {
    const out = format('000102030405060708090a0b0c0d0e0f10', 4);
    expect(out).toBe('00 01 02 03\n04 05 06 07\n08 09 0a 0b\n0c 0d 0e 0f\n10');
  });
});
