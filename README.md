# @omnidev-tools/url-and-encoding

[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen.svg)](https://github.com/omnidev-tools/url-and-encoding/actions)
[![NPM Version](https://img.shields.io/npm/v/@omnidev-tools/url-and-encoding.svg)](https://www.npmjs.com/package/@omnidev-tools/url-and-encoding)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](tsconfig.json)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](package.json)

A high-performance, **zero-runtime-dependency** TypeScript utility toolkit and standalone CLI for URL manipulation, query string parsing, validation, and encoding across all modern JavaScript environments.

Works out of the box in **Node.js (>= 18.0.0)**, **Modern Browsers**, **Deno**, **Bun**, and **Cloudflare Workers**.

---

## Tools Overview

| Tool | Module Path | CLI Command / Alias | Description |
| :--- | :--- | :--- | :--- |
| **`url-parser`** | `@omnidev-tools/url-and-encoding/url-parser` | `url-tools url-parser` / `url-parse` | Structured URL parsing conforming to WHATWG URL specifications. |
| **`query-string`** | `@omnidev-tools/url-and-encoding/query-string` | `url-tools query-string` / `query-string` | Build & parse query strings with nested objects, arrays, and prototype pollution guards. |
| **`url-validator`** | `@omnidev-tools/url-and-encoding/url-validator` | `url-tools url-validator` / `url-validate` | Validate URLs with protocol allowlists, RFC host validation, and loopback detection. |
| **`utm-builder`** | `@omnidev-tools/url-and-encoding/utm-builder` | `url-tools utm-builder` / `utm-build` | Append and extract campaign tracking parameters (`utm_source`, `utm_campaign`, etc.). |
| **`base64`** | `@omnidev-tools/url-and-encoding/base64` | `url-tools base64` / `b64` | UTF-8 safe Base64 and URL-safe Base64URL string and byte array conversions. |
| **`url-encoder`** | `@omnidev-tools/url-and-encoding/url-encoder` | `url-tools url-encoder` / `url-encode` | RFC 3986 URI component, path, and full URL encoding with custom reserved keep-sets. |
| **`html-encoder`** | `@omnidev-tools/url-and-encoding/html-encoder` | `url-tools html-encoder` / `html-encode` | Escape/unescape HTML text and attribute values, named/numeric entities, and strip tags. |
| **`hex`** | `@omnidev-tools/url-and-encoding/hex` | `url-tools hex` / `hex-convert` | Text and byte array to hexadecimal conversion, formatting, and validation. |

---

## Installation

```bash
# npm
npm install @omnidev-tools/url-and-encoding

# pnpm
pnpm add @omnidev-tools/url-and-encoding

# yarn
yarn add @omnidev-tools/url-and-encoding

# bun
bun add @omnidev-tools/url-and-encoding
```

Global CLI installation:
```bash
npm install -g @omnidev-tools/url-and-encoding
```

---

## Quick Start

### Subpath Imports (Recommended for Minimal Bundle Size)
```ts
import { parseUrl } from '@omnidev-tools/url-and-encoding/url-parser';
import { parse as parseQuery, stringify } from '@omnidev-tools/url-and-encoding/query-string';
import { buildUtm } from '@omnidev-tools/url-and-encoding/utm-builder';
import { encode as b64Encode } from '@omnidev-tools/url-and-encoding/base64';

const url = parseUrl('https://example.com/api?user=alice');
console.log(url.hostname); // 'example.com'

const campaign = buildUtm('https://example.com/shop', {
  source: 'twitter',
  medium: 'social',
  campaign: 'spring_launch',
});
```

### Root Import (Namespaced or Direct Named Exports)
```ts
// Namespaces
import { base64, hex, queryString } from '@omnidev-tools/url-and-encoding';

const encoded = base64.encode('Hello World');
const hexStr = hex.encode('Hello World');
const query = queryString.parse('filter=shoes&page=2');

// Direct named imports
import { parseUrl, validateUrl, escapeHtml } from '@omnidev-tools/url-and-encoding';
```

---

## Standalone CLI Toolkit

The package includes both a unified CLI (`url-tools` / `omnidev`) and dedicated binary aliases for every tool.

### CLI Features
- **Standard Input Piping**: `cat urls.txt | url-tools url-validator` or `echo "hello" | b64 encode`
- **File Input**: `url-tools base64 encode path/to/file.txt`
- **CLI Flags**: `--help`, `-h`, `--version`, `-v`, and tool-specific options.
- **POSIX Exit Codes**:
  - `0`: Success
  - `1`: Operation or validation failure (e.g. invalid URL, malformed Base64)
  - `2`: CLI usage syntax error (unknown flag, missing required parameter)

### Command Reference

#### 1. URL Parser
```bash
# JSON output of structured URL
url-tools url-parser "https://user:pass@example.com:8080/path?a=1#section"

# Extract single field
url-parse "https://example.com:8080" --field hostname
# Output: example.com
```

#### 2. Query String
```bash
# Parse query string to JSON
query-string parse "user=alice&roles[]=admin&roles[]=dev"

# Stringify JSON object to query string
query-string stringify '{"a":1,"b":["x","y"]}' --array-format bracket
# Output: a=1&b%5B%5D=x&b%5B%5D=y
```

#### 3. URL Validator
```bash
# Validate URL
url-validate "https://example.com"
# Output: VALID: https://example.com/ (Exit 0)

# Reject localhost
url-validate "http://localhost:3000" --reject-localhost
# Output: INVALID [INVALID_HOST]: Localhost hostnames are not allowed: localhost (Exit 1)
```

#### 4. UTM Campaign Builder
```bash
utm-build "https://example.com/landing" \
  --source twitter \
  --medium social \
  --campaign spring_sale \
  --lowercase

# Extract UTM parameters
utm-build "https://example.com/?utm_source=fb&utm_medium=cpc&utm_campaign=retarget" --extract
```

#### 5. Base64 & Base64URL
```bash
# Standard Base64
b64 encode "Hello World"
# Output: aGVsbG8gV29ybGQ=

b64 decode "aGVsbG8gV29ybGQ="

# URL-Safe Base64 (RFC 4648 §5)
b64 encode "subjects/?+" --url

# Check validity
b64 check "aGVsbG8="
```

#### 6. URL Component & Path Encoder
```bash
# Encode component
url-encode encode "hello world?"
# Output: hello%20world%3F

# Preserve custom characters
url-encode encode "user:pass@example.com" --keep ":@"

# Encode path segment
url-encode encode "folder/sub folder" --path
```

#### 7. HTML Encoder
```bash
# Escape HTML for text
html-encode escape '<script>alert("xss")</script>'
# Output: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

# Unescape entities
html-encode unescape "&copy; 2026 &mdash; ACME"

# Strip tags
html-encode strip "<p>Hello <b>World</b></p>"
```

#### 8. Hexadecimal
```bash
# Text to hex
hex-convert encode "Hello"
# Output: 48656c6c6f

# Format hex view
hex-convert format "000102030405060708090a0b0c0d0e0f10" --bytes-per-line 4
```

---

## Security by Default

- **Prototype Pollution Immunization**: All query parsing functions discard `__proto__`, `constructor`, and `prototype` tokens and generate null-prototype dictionary objects (`Object.create(null)`).
- **Zero Third-Party Dependencies**: No dependency supply-chain risks.
- **Strict Depth Limits**: Query parsing restricts recursive object nesting to 5 levels by default to prevent stack overflows.

---

## NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run build` | `tsup` | Bundle dual ESM (`.mjs`), CJS (`.cjs`), sourcemaps, and TypeScript declarations (`.d.ts`). |
| `npm test` | `vitest run` | Execute unit and integration tests. |
| `npm run test:watch` | `vitest` | Run Vitest in interactive watch mode. |
| `npm run test:coverage` | `vitest run --coverage` | Generate V8 code coverage reports. |
| `npm run typecheck` | `tsc --noEmit` | Strict TypeScript compiler validation. |
| `npm run bump:patch` | `npm version patch` | Increment patch version (e.g. 0.1.0 -> 0.1.1). |
| `npm run bump:minor` | `npm version minor` | Increment minor version (e.g. 0.1.0 -> 0.2.0). |
| `npm run bump:major` | `npm version major` | Increment major version (e.g. 0.1.0 -> 1.0.0). |
| `npm run prepublishOnly`| `npm run typecheck && npm run test && npm run build` | Release gate verification. |
| `npm run publish:dry` | `npm publish --dry-run` | Test npm packaging and review tarball output. |

---

## Documentation Suite

For in-depth architectural and operational guides, refer to the documentation in `docs/`:

- [Architecture & Design](docs/ARCHITECTURE.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Features & API Reference](docs/FEATURES.md)
- [Limitations & Boundaries](docs/LIMITATIONS.md)
- [Testing Strategy & Coverage](docs/TESTING.md)
- [Deployment & Publishing](docs/DEPLOYMENT.md)

---

## License

[MIT](LICENSE) © OmniDev Tools Team
