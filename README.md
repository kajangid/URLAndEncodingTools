# @kjangid/url-encode-tools

[![NPM Version](https://img.shields.io/npm/v/@kjangid/url-encode-tools.svg)](https://www.npmjs.com/package/@kjangid/url-encode-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/kajangid/URLAndEncodingTools/blob/master/LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](https://www.npmjs.com/package/@kjangid/url-encode-tools)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/kajangid/URLAndEncodingTools/actions/workflows/ci.yml/badge.svg)](https://github.com/kajangid/URLAndEncodingTools/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](https://nodejs.org)

A high-performance, **zero-runtime-dependency** TypeScript utility suite and standalone CLI for URL manipulation, query string parsing, validation, encoding, and extraction across modern JavaScript runtimes.

Works out of the box in **Node.js (>= 18)**, **Modern Browsers**, **Deno**, **Bun**, and **Cloudflare Workers**.

---

## Key Highlights

- ⚡ **Zero Runtime Dependencies**: Ultra-lightweight footprint built entirely on native Web APIs and language standards.
- 🛡️ **Prototype Pollution Defenses**: Immune to `__proto__`, `constructor`, and `prototype` injection attacks using null-prototype dictionaries.
- 📦 **Dual ESM & CommonJS**: Ships dual `.mjs` and `.cjs` bundles with full `.d.ts` and `.d.cts` TypeScript declarations.
- 🌲 **Tree-Shakable Subpath Exports**: Granular imports (`@kjangid/url-encode-tools/url-parser`) with `"sideEffects": false` for minimal consumer bundle size.
- 💻 **Unified CLI & Fast Aliases**: Complete command-line toolkit (`url-tools`) with direct shortcuts (`url-parse`, `url-extract`, `b64`, etc.) and stdin piping.
- 🌐 **Cross-Runtime**: Runs reliably across Node.js, Browsers, Deno, Bun, and Edge environments.

---

## Installation

```bash
# npm
npm install @kjangid/url-encode-tools

# pnpm
pnpm add @kjangid/url-encode-tools

# yarn
yarn add @kjangid/url-encode-tools

# bun
bun add @kjangid/url-encode-tools
```

For global CLI usage:

```bash
npm install -g @kjangid/url-encode-tools
```

---

## Hero Quick Start

```ts
import { parseUrl } from "@kjangid/url-encode-tools/url-parser";
import { parse as parseQuery, stringify as stringifyQuery } from "@kjangid/url-encode-tools/query-string";
import { extractUrls } from "@kjangid/url-encode-tools/url-extract";
import { validateUrl } from "@kjangid/url-encode-tools/url-validator";

// 1. WHATWG-compliant URL parsing
const url = parseUrl("https://example.com/api?user=alice&role=admin");
console.log(url.hostname); // 'example.com'
console.log(url.query);    // [Object: null prototype] { user: 'alice', role: 'admin' }

// 2. Prototype-pollution safe query string handling
const qs = stringifyQuery(
  { filter: { status: "active", tags: ["node", "ts"] } },
  { arrayFormat: "bracket" }
);
console.log(qs); // 'filter%5Bstatus%5D=active&filter%5Btags%5D%5B%5D=node&filter%5Btags%5D%5B%5D=ts'

// 3. Extract URLs from arbitrary text, markdown, or logs
const links = extractUrls("Review docs at https://docs.example.com and www.example.com.");
console.log(links); // ['https://docs.example.com', 'https://www.example.com']

// 4. Strict URL validation
const check = validateUrl("https://production.internal", { rejectLocalhost: true });
console.log(check.valid); // true
```

> **Tip:** You can also import everything from the root bundle:
> `import { parseUrl, extractUrls, queryString, base64 } from "@kjangid/url-encode-tools";`

---

## Core Utilities Matrix

| Tool | Subpath Import | CLI Command / Alias | Description |
| :--- | :--- | :--- | :--- |
| **`url-parser`** | `@kjangid/url-encode-tools/url-parser` | `url-tools url-parser` / `url-parse` | WHATWG-compliant structured URL decomposition. |
| **`query-string`** | `@kjangid/url-encode-tools/query-string` | `url-tools query-string` / `query-string` | Safe nested query string parser & builder with array format options. |
| **`url-validator`** | `@kjangid/url-encode-tools/url-validator` | `url-tools url-validator` / `url-validate` | Strict URL validation with protocol allowlists and RFC host compliance. |
| **`url-extract`** | `@kjangid/url-encode-tools/url-extract` | `url-tools url-extract` / `url-extract` | Extract URLs from arbitrary text with trailing punctuation trimming. |
| **`utm-builder`** | `@kjangid/url-encode-tools/utm-builder` | `url-tools utm-builder` / `utm-build` | Append, sanitize, and extract marketing campaign parameters. |
| **`base64`** | `@kjangid/url-encode-tools/base64` | `url-tools base64` / `b64` | UTF-8 safe Base64 and URL-safe Base64URL string/byte conversions. |
| **`url-encoder`** | `@kjangid/url-encode-tools/url-encoder` | `url-tools url-encoder` / `url-encode` | RFC 3986 URI component, path, and full URL encoding with custom keep-sets. |
| **`html-encoder`** | `@kjangid/url-encode-tools/html-encoder` | `url-tools html-encoder` / `html-encode` | Escape/unescape HTML text and attribute values, named/numeric entities, and strip tags. |
| **`hex`** | `@kjangid/url-encode-tools/hex` | `url-tools hex` / `hex-convert` | Text and byte array to hexadecimal conversion, formatting, and validation. |

---

## CLI Usage

Every tool is accessible through the unified `url-tools` (or `url-encode-tools`) command, or via direct binary shortcuts:

```bash
# Extract URLs from logs or files
url-extract "Check out https://github.com and www.google.com"
cat server.log | url-tools url-extract --json

# Parse URL into JSON fields
url-parse "https://user:pass@example.com:8080/path?a=1#section"
url-parse "https://example.com:8080" --field hostname # example.com

# Query string serialization & parsing
query-string parse "user=alice&roles[]=admin&roles[]=dev"
query-string stringify '{"filter":{"status":"active"}}' --array-format bracket

# Validate URLs with exit codes (0 = valid, 1 = invalid)
url-validate "https://example.com"
url-validate "http://localhost:3000" --reject-localhost

# URL-Safe Base64
b64 encode "subjects/?+" --url
echo "hello" | b64 encode

# HTML escaping & entity decoding
html-encode escape '<script>alert("xss")</script>'
html-encode strip "<p>Hello <b>World</b></p>"
```

---

## Limitations

- **Arbitrary Text Extraction**: `url-extract` operates on plain text, markdown, and logs via native regex and WHATWG URL validation. It does not perform HTML DOM AST parsing (e.g. URLs inside inline `<style>` or `<script>` tags in raw HTML are matched as plain text).
- **Maximum URL Length**: `url-validator` enforces a default maximum URL length of 2,048 characters (configurable via options).
- **Query Depth Limits**: Query parsing restricts object nesting to 5 levels by default to prevent stack overflows and algorithmic complexity attacks.

See [docs/LIMITATIONS.md](https://github.com/kajangid/URLAndEncodingTools/blob/master/docs/LIMITATIONS.md) for complete technical boundaries.

---

## Documentation

For full API references, options, type definitions, and architectural guides, see:

- [Features & API Reference](https://github.com/kajangid/URLAndEncodingTools/blob/master/docs/FEATURES.md)
- [Architecture & Design](https://github.com/kajangid/URLAndEncodingTools/blob/master/docs/ARCHITECTURE.md)
- [Limitations & Boundaries](https://github.com/kajangid/URLAndEncodingTools/blob/master/docs/LIMITATIONS.md)
- [Testing Strategy & Coverage](https://github.com/kajangid/URLAndEncodingTools/blob/master/docs/TESTING.md)
- [Deployment & Publishing](https://github.com/kajangid/URLAndEncodingTools/blob/master/docs/DEPLOYMENT.md)
- [Contributing Guide](https://github.com/kajangid/URLAndEncodingTools/blob/master/CONTRIBUTING.md)

---

## License

[MIT](https://github.com/kajangid/URLAndEncodingTools/blob/master/LICENSE) © 2026 Karan Jangid
