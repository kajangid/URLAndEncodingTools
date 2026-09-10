import { describe, it, expect } from 'vitest';
import { encode, decode, decodeLossy, encodeBytes, decodeBytes, isHex, format } from './index.js';

describe('hex', () => {
  it('encodes and decodes text round-trip', () => {
    expect(decode(encode('Hello'))).toBe('Hello');
    expect(decodeLossy(encode('Hello'))).toBe('Hello');
    expect(decode(encode('你好'))).toBe('你好');
  });

  it('encodeBytes pads with leading zeroes', () => {
    expect(encodeBytes(new Uint8Array([0, 1, 15]))).toBe('00010f');
  });

  it('decodeBytes decodes hex strings with prefixes and spaces', () => {
    expect(Array.from(decodeBytes('deadbeef'))).toEqual([0xde, 0xad, 0xbe, 0xef]);
    expect(Array.from(decodeBytes('0xdeadbeef'))).toEqual([0xde, 0xad, 0xbe, 0xef]);
    expect(Array.from(decodeBytes('de ad be ef'))).toEqual([0xde, 0xad, 0xbe, 0xef]);
  });

  it('throws on odd-length input', () => {
    expect(() => decodeBytes('abc')).toThrow();
  });

  it('isHex validates correctly', () => {
    expect(isHex('deadbeef')).toBe(true);
    expect(isHex('0xDEADBEEF')).toBe(true);
    expect(isHex('de ad be ef')).toBe(true);
    expect(isHex('xyz')).toBe(false);
    expect(isHex('')).toBe(false);
  });

  it('format formats bytes with linebreaks and spaces', () => {
    const out = format('000102030405060708090a0b0c0d0e0f10', 4);
    expect(out).toBe('00 01 02 03\n04 05 06 07\n08 09 0a 0b\n0c 0d 0e 0f\n10');
  });
});
