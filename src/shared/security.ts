/**
 * Security utilities and defenses against Prototype Pollution,
 * prototype poisoning, and boundary checking.
 */

import type { SafeRecord } from './types.js';

export const DANGEROUS_KEYS = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

/**
 * Checks whether a given property key is a dangerous prototype pollution vector.
 */
export function isPrototypePollutionKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key);
}

/**
 * Creates a prototype-free object (dictionary) that cannot be polluted
 * via Object.prototype inheritance.
 */
export function createSafeObject<T = unknown>(): SafeRecord<T> {
  return Object.create(null);
}

/**
 * Safely checks whether an object possesses an own property without prototype traversal.
 */
export function safeHasOwn(obj: unknown, key: PropertyKey): boolean {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Safely assigns a key/value pair to a target dictionary, discarding or rejecting
 * any keys matching dangerous prototype keys.
 *
 * @returns `true` if assigned, `false` if blocked due to prototype pollution danger.
 */
export function safeSet(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
): boolean {
  if (isPrototypePollutionKey(key)) {
    return false;
  }
  target[key] = value;
  return true;
}

/**
 * Clones or converts a dictionary into a safe null-prototype object, stripping
 * any dangerous prototype properties.
 */
export function toSafeObject<T = unknown>(input: Record<string, T>): Record<string, T> {
  const safe = createSafeObject<T>();
  for (const key of Object.keys(input)) {
    if (!isPrototypePollutionKey(key) && safeHasOwn(input, key)) {
      safe[key] = input[key] as T;
    }
  }
  return safe;
}
