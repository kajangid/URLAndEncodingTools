/**
 * @omnidev-tools/url-and-encoding
 *
 * Production-grade, zero-runtime-dependency TypeScript URL manipulation,
 * validation, encoding, and decoding toolkit with standalone CLI.
 */

// Namespaced exports (recommended when importing multiple tools at once)
export * as urlParser from './url-parser/index.js';
export * as queryString from './query-string/index.js';
export * as urlValidator from './url-validator/index.js';
export * as utmBuilder from './utm-builder/index.js';
export * as base64 from './base64/index.js';
export * as urlEncoder from './url-encoder/index.js';
export * as htmlEncoder from './html-encoder/index.js';
export * as hex from './hex/index.js';
export * as security from './shared/security.js';
export * from './shared/types.js';

// Direct named exports for distinct APIs
export { parseUrl, tryParseUrl, toUrlString } from './url-parser/index.js';
export type { ParsedUrl } from './url-parser/index.js';

export { parse as parseQuery, stringify as stringifyQuery, appendParams, removeParams } from './query-string/index.js';
export type { QueryInput, QueryValue, StringifyOptions, ParseOptions, ArrayFormat } from './query-string/index.js';

export { validate as validateUrl, isValidUrl } from './url-validator/index.js';
export type {
  UrlValidationCode,
  UrlValidationError,
  UrlValidationResult,
  ValidateOptions,
} from './url-validator/index.js';

export { buildUtm, extractUtm, hasUtm } from './utm-builder/index.js';
export type { UtmParams, BuildUtmOptions } from './utm-builder/index.js';

export {
  encodeComponent,
  decodeComponent,
  encodeComponentKeep,
  encodeFull,
  decodeFull,
  encodePath,
  isEncoded,
  isFullyEncoded,
  diffEncoded,
} from './url-encoder/index.js';
export type { EncodeOptions } from './url-encoder/index.js';

export {
  escapeHtml,
  escapeAttribute,
  unescapeHtml,
  stripHtml,
} from './html-encoder/index.js';

export {
  isPrototypePollutionKey,
  createSafeObject,
  safeHasOwn,
  safeSet,
  toSafeObject,
} from './shared/security.js';

export { VERSION } from './version.js';
