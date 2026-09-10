import { describe, it, expect } from 'vitest';
import { stringify, parse, appendParams, removeParams } from '../src/query-string/index.js';

describe('stringify', () => {
  it('handles flat primitives', () => {
    expect(stringify({ a: 1, b: 'x', c: true, d: null, e: undefined })).toBe('a=1&b=x&c=true');
  });

  it('repeat-keys for arrays (none format)', () => {
    expect(stringify({ a: ['x', 'y', 'z'] })).toBe('a=x&a=y&a=z');
  });

  it('bracket format', () => {
    expect(stringify({ a: ['x', 'y'] }, { arrayFormat: 'bracket' })).toBe('a%5B%5D=x&a%5B%5D=y');
  });

  it('index format', () => {
    expect(stringify({ a: ['x', 'y'] }, { arrayFormat: 'index' })).toBe('a%5B0%5D=x&a%5B1%5D=y');
  });

  it('comma format', () => {
    // Comma is the separator — values joined with literal ','.
    expect(stringify({ a: ['x', 'y'] }, { arrayFormat: 'comma' })).toBe('a=x,y');
  });

  it('nested objects', () => {
    expect(stringify({ a: { b: { c: 1 } } })).toBe('a%5Bb%5D%5Bc%5D=1');
  });

  it('encodes special characters', () => {
    expect(stringify({ q: 'hello world?' })).toBe('q=hello%20world%3F');
  });

  it('supports custom delimiter', () => {
    expect(stringify({ a: 1, b: 2 }, { delimiter: ';' })).toBe('a=1;b=2');
  });

  it('include nulls when skipNulls is false', () => {
    expect(stringify({ a: null, b: 'x' }, { skipNulls: false })).toBe('a=&b=x');
  });
});

describe('parse', () => {
  it('parses flat pairs', () => {
    expect(parse('a=1&b=x&c=true')).toEqual({ a: '1', b: 'x', c: 'true' });
  });

  it('strips leading ?', () => {
    expect(parse('?a=1')).toEqual({ a: '1' });
  });

  it('treats + as space', () => {
    expect(parse('q=hello+world')).toEqual({ q: 'hello world' });
  });

  it('parses brackets as nested objects', () => {
    expect(parse('a[b]=x&a[c]=y')).toEqual({ a: { b: 'x', c: 'y' } });
  });

  it('parses bracket-array form when parseArrays is on', () => {
    const r = parse('a[]=1&a[]=2&a[]=3');
    expect(r).toEqual({ a: ['1', '2', '3'] });
  });

  it('collapses repeated keys into arrays', () => {
    expect(parse('a=1&a=2&a=3')).toEqual({ a: ['1', '2', '3'] });
  });

  it('handles empty input', () => {
    expect(parse('')).toEqual({});
  });
});

describe('appendParams', () => {
  it('merges into existing query', () => {
    expect(appendParams('https://example.com/?a=1', { b: '2' })).toBe(
      'https://example.com/?a=1&b=2',
    );
  });

  it('overwrites duplicate keys', () => {
    expect(appendParams('https://example.com/?a=1', { a: '2' })).toBe('https://example.com/?a=2');
  });
});

describe('removeParams', () => {
  it('removes the given keys', () => {
    expect(removeParams('https://example.com/?a=1&b=2&c=3', ['b'])).toBe(
      'https://example.com/?a=1&c=3',
    );
  });
});
