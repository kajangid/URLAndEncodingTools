# Features & API Reference

Detailed guide, type signatures, and practical code examples for every utility in `@omnidev-tools/url-and-encoding`.

---

## 1. `url-parser`

Structured URL decomposition conforming to WHATWG specifications.

### Import
```ts
import { parseUrl, tryParseUrl, toUrlString, type ParsedUrl } from '@omnidev-tools/url-and-encoding/url-parser';
```

### Signatures
```ts
function parseUrl(input: string): ParsedUrl;
function tryParseUrl(input: string): ParsedUrl | null;
function toUrlString(parts: ParsedUrl): string;
```

### Example
```ts
const url = parseUrl('https://alice:secret@api.example.com:8443/v1/users?role=admin&tag=dev#heading');

console.log(url.protocol);    // 'https'
console.log(url.username);    // 'alice'
console.log(url.password);    // 'secret'
console.log(url.hostname);    // 'api.example.com'
console.log(url.port);        // '8443'
console.log(url.origin);      // 'https://api.example.com:8443'
console.log(url.pathname);    // '/v1/users'
console.log(url.query);       // { role: 'admin', tag: 'dev' } (Null-prototype safe dictionary)
console.log(url.hash);        // '#heading'
```

---

## 2. `query-string`

Robust serialization and deserialization of query strings with nested objects, array formats, and prototype pollution protection.

### Import
```ts
import { parse, stringify, appendParams, removeParams } from '@omnidev-tools/url-and-encoding/query-string';
```

### Supported Array Formats
- `'none'`: `a=1&a=2` (default)
- `'bracket'`: `a[]=1&a[]=2`
- `'index'`: `a[0]=1&a[1]=2`
- `'comma'`: `a=1,2`

### Example
```ts
// Serialization
const qs = stringify(
  { filter: { status: 'active', tags: ['node', 'ts'] } },
  { arrayFormat: 'bracket' }
);
// 'filter%5Bstatus%5D=active&filter%5Btags%5D%5B%5D=node&filter%5Btags%5D%5B%5D=ts'

// Parsing (Prototype Pollution Safe)
const parsed = parse('filter[status]=active&__proto__[admin]=true');
console.log(parsed); // { filter: { status: 'active' } }
console.log(({} as any).admin); // undefined
```

---

## 3. `url-validator`

Strict URL validation with RFC host verification, protocol allow-lists, and loopback detection.

### Import
```ts
import { validate, isValidUrl, type ValidateOptions, type UrlValidationResult } from '@omnidev-tools/url-and-encoding/url-validator';
```

### Options
```ts
interface ValidateOptions {
  protocols?: string[];        // Default: ['http', 'https']
  requireHost?: boolean;       // Default: true
  rejectLocalhost?: boolean;   // Default: false
  maxLength?: number;          // Default: 2048
  allowedHosts?: string[];     // Hostname allowlist
  ipOnly?: boolean;            // Require IPv4 or IPv6
}
```

### Example
```ts
const result = validate('http://localhost:3000', { rejectLocalhost: true });
if (!result.valid) {
  console.log(result.error.code);    // 'INVALID_HOST'
  console.log(result.error.message); // 'Localhost hostnames are not allowed: localhost'
}
```

---

## 4. `utm-builder`

Campaign tag builder and query string parser for marketing automation and analytics.

### Import
```ts
import { buildUtm, extractUtm, hasUtm } from '@omnidev-tools/url-and-encoding/utm-builder';
```

### Example
```ts
const campaignUrl = buildUtm('https://example.com/product', {
  source: 'newsletter',
  medium: 'email',
  campaign: 'summer_promo',
  term: 'shoes',
  content: 'hero_button',
}, { lowercase: true });

console.log(campaignUrl);
// 'https://example.com/product?utm_source=newsletter&utm_medium=email&utm_campaign=summer_promo&utm_term=shoes&utm_content=hero_button'

const extracted = extractUtm(campaignUrl);
console.log(extracted?.campaign); // 'summer_promo'
```

---

## 5. `base64`

UTF-8 safe Base64 and URL-safe Base64URL string and byte array utilities.

### Import
```ts
import {
  encode,
  decode,
  encodeUrl,
  decodeUrl,
  encodeBytes,
  decodeBytes,
  isBase64,
  isBase64Url,
} from '@omnidev-tools/url-and-encoding/base64';
```

### Example
```ts
encode('Unicode text: 🚀 Hello');       // 'VW5pY29kZSB0ZXh0OiDwn5qAIEhlbGxv'
decode('VW5pY29kZSB0ZXh0OiDwn5qAIEhlbGxv'); // 'Unicode text: 🚀 Hello'

// URL-safe (replaces + with -, / with _, strips =)
const urlSafe = encodeUrl('path/to?a=1+2');
const original = decodeUrl(urlSafe);
```

---

## 6. `url-encoder`

RFC 3986 URI component and path encoding with custom preserved character sets.

### Import
```ts
import {
  encodeComponent,
  decodeComponent,
  encodeComponentKeep,
  encodePath,
  isEncoded,
} from '@omnidev-tools/url-and-encoding/url-encoder';
```

### Example
```ts
encodeComponent('search query?&='); // 'search%20query%3F%26%3D'

// Keep specific characters unencoded
encodeComponentKeep('user:pass@domain/path', { keep: ':@/' });
// 'user:pass@domain/path'
```

---

## 7. `html-encoder`

Safe HTML escaping for text and attributes, full entity unescaping, and tag stripping.

### Import
```ts
import { escapeHtml, escapeAttribute, unescapeHtml, stripHtml } from '@omnidev-tools/url-and-encoding/html-encoder';
```

### Example
```ts
escapeHtml('<script>alert("XSS")</script>');
// '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

unescapeHtml('&copy; 2026 &mdash; ACME &#x41;BC');
// '© 2026 — ACME ABC'

stripHtml('<p>Welcome <b>Guest</b>!</p>');
// 'Welcome Guest!'
```

---

## 8. `hex`

Hexadecimal string encoding, decoding, formatting, and validation.

### Import
```ts
import { encode, decode, encodeBytes, decodeBytes, format, isHex } from '@omnidev-tools/url-and-encoding/hex';
```

### Example
```ts
encode('Hello'); // '48656c6c6f'
decode('48656c6c6f'); // 'Hello'

decodeBytes('0xdeadbeef'); // Uint8Array([0xde, 0xad, 0xbe, 0xef])

format('000102030405060708090a0b0c0d0e0f10', 4);
// '00 01 02 03\n04 05 06 07\n08 09 0a 0b\n0c 0d 0e 0f\n10'
```
