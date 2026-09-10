import { describe, it, expect, beforeEach } from 'vitest';
import {
  isPrototypePollutionKey,
  createSafeObject,
  safeHasOwn,
  safeSet,
  toSafeObject,
} from './security.js';
import { parse as parseQueryString } from '../query-string/index.js';
import { parseUrl } from '../url-parser/index.js';

describe('security primitives', () => {
  it('detects prototype pollution keys', () => {
    expect(isPrototypePollutionKey('__proto__')).toBe(true);
    expect(isPrototypePollutionKey('constructor')).toBe(true);
    expect(isPrototypePollutionKey('prototype')).toBe(true);
    expect(isPrototypePollutionKey('safeKey')).toBe(false);
    expect(isPrototypePollutionKey('toString')).toBe(false);
  });

  it('creates safe null-prototype objects', () => {
    const obj = createSafeObject();
    expect(Object.getPrototypeOf(obj)).toBeNull();
    expect(obj['toString']).toBeUndefined();
    expect(obj['constructor']).toBeUndefined();
  });

  it('safeSet blocks dangerous prototype keys and accepts valid keys', () => {
    const obj = createSafeObject<unknown>();
    expect(safeSet(obj, '__proto__', { admin: true })).toBe(false);
    expect(safeSet(obj, 'constructor', { admin: true })).toBe(false);
    expect(safeSet(obj, 'prototype', { admin: true })).toBe(false);

    expect(safeSet(obj, 'validKey', 'hello')).toBe(true);
    expect(obj['validKey']).toBe('hello');
    expect((Object.prototype as unknown as Record<string, unknown>)['admin']).toBeUndefined();
  });

  it('safeHasOwn safely checks own properties', () => {
    const obj = { a: 1 };
    expect(safeHasOwn(obj, 'a')).toBe(true);
    expect(safeHasOwn(obj, 'toString')).toBe(false);
    expect(safeHasOwn(null, 'a')).toBe(false);
    expect(safeHasOwn(undefined, 'a')).toBe(false);
  });

  it('toSafeObject strips prototype pollution keys', () => {
    const regularObj = {
      name: 'test',
      val: 42,
    };
    const safe = toSafeObject(regularObj);
    expect(Object.getPrototypeOf(safe)).toBeNull();
    expect(safe['name']).toBe('test');
    expect(safe['val']).toBe(42);
  });
});

describe('Security: Prototype Pollution Defenses', () => {
  beforeEach(() => {
    delete (Object.prototype as Record<string, unknown>)['polluted'];
    delete (Object.prototype as Record<string, unknown>)['isAdmin'];
    delete (Object.prototype as Record<string, unknown>)['hacked'];
  });

  it('blocks direct __proto__ in query string', () => {
    const res = parseQueryString('__proto__=polluted&safe=1');
    expect(res['safe']).toBe('1');
    expect(res['__proto__']).toBeUndefined();
    expect((Object.prototype as Record<string, unknown>)['polluted']).toBeUndefined();
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('blocks bracketed __proto__ property injection', () => {
    const res = parseQueryString('__proto__[isAdmin]=true&__proto__[polluted]=yes');
    expect(res['isAdmin']).toBeUndefined();
    expect((Object.prototype as Record<string, unknown>)['isAdmin']).toBeUndefined();
    expect((Object.prototype as Record<string, unknown>)['polluted']).toBeUndefined();
    expect(({} as Record<string, unknown>)['isAdmin']).toBeUndefined();
  });

  it('blocks constructor.prototype injection', () => {
    const res = parseQueryString('constructor[prototype][isAdmin]=true');
    expect((Object.prototype as Record<string, unknown>)['isAdmin']).toBeUndefined();
    expect(({} as Record<string, unknown>)['isAdmin']).toBeUndefined();
  });

  it('blocks nested object prototype pollution vectors', () => {
    const res = parseQueryString('user[__proto__][role]=admin&user[constructor][prototype][hacked]=true');
    expect((Object.prototype as Record<string, unknown>)['role']).toBeUndefined();
    expect((Object.prototype as Record<string, unknown>)['hacked']).toBeUndefined();
    expect(({} as Record<string, unknown>)['role']).toBeUndefined();
    expect(({} as Record<string, unknown>)['hacked']).toBeUndefined();
  });

  it('blocks prototype pollution in url-parser query parsing', () => {
    const parsed = parseUrl('https://example.com/?__proto__=polluted&constructor=evil&valid=ok');
    expect(parsed.query['valid']).toBe('ok');
    expect(parsed.query['__proto__']).toBeUndefined();
    expect(parsed.query['constructor']).toBeUndefined();
    expect((Object.prototype as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('returns null-prototype object from query-string parse', () => {
    const res = parseQueryString('a=1&b=2');
    expect(Object.getPrototypeOf(res)).toBeNull();
    expect(res['toString']).toBeUndefined();
    expect(res['a']).toBe('1');
  });

  it('returns null-prototype query object from url-parser', () => {
    const parsed = parseUrl('https://example.com/?a=1');
    expect(Object.getPrototypeOf(parsed.query)).toBeNull();
    expect(parsed.query['toString']).toBeUndefined();
    expect(parsed.query['a']).toBe('1');
  });
});
