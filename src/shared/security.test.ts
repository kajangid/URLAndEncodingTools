import { describe, it, expect } from 'vitest';
import {
  isPrototypePollutionKey,
  createSafeObject,
  safeHasOwn,
  safeSet,
  toSafeObject,
  DANGEROUS_KEYS,
} from './security.js';

describe('security utils', () => {
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
    expect(obj.toString).toBeUndefined();
    expect(obj.constructor).toBeUndefined();
  });

  it('safeSet blocks dangerous prototype keys and accepts valid keys', () => {
    const obj = createSafeObject<unknown>();
    expect(safeSet(obj, '__proto__', { admin: true })).toBe(false);
    expect(safeSet(obj, 'constructor', { admin: true })).toBe(false);
    expect(safeSet(obj, 'prototype', { admin: true })).toBe(false);

    expect(safeSet(obj, 'validKey', 'hello')).toBe(true);
    expect(obj['validKey']).toBe('hello');
    // Ensure Object.prototype was NOT polluted
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
