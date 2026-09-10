/**
 * Universal primitive and generic types used across @omnidev-tools/url-and-encoding.
 */

/**
 * JavaScript primitive types.
 */
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * Convenience helper for nullable or optional values.
 */
export type Nullable<T> = T | null | undefined;

/**
 * Prototype-free dictionary mapping string keys to values of type T.
 */
export type SafeRecord<T = unknown> = Record<string, T>;

/**
 * Generic string-keyed dictionary.
 */
export type Dictionary<T = unknown> = Record<string, T>;

/**
 * Binary buffer representation.
 */
export type ByteArray = Uint8Array;

/**
 * Common string transformation function.
 */
export type StringTransformer = (value: string) => string;

/**
 * Common byte transformation function.
 */
export type ByteTransformer = (bytes: Uint8Array) => Uint8Array;

/**
 * Recognized text and byte encoding formats.
 */
export type EncodingFormat = 'utf-8' | 'hex' | 'base64' | 'base64url';
