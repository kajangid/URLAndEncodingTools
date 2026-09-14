# @kjangid/url-encode-tools

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](tsconfig.json)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)
[![Module](https://img.shields.io/badge/Module-ESM%20%7C%20CJS-orange.svg)]()
[![CI](https://github.com/kajangid/URLAndEncodingTools/actions/workflows/ci.yml/badge.svg)](https://github.com/kajangid/URLAndEncodingTools/actions/workflows/ci.yml)
[![Release](https://github.com/kajangid/URLAndEncodingTools/actions/workflows/release.yml/badge.svg)](https://github.com/kajangid/URLAndEncodingTools/actions/workflows/release.yml)
[![NPM Version](https://img.shields.io/npm/v/@kjangid/url-encode-tools.svg)]()
[![Tests](https://img.shields.io/badge/Tests-101%20passed-success.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](package.json)
[![Coverage](https://img.shields.io/badge/coverage-96.3%25-brightgreen.svg)](docs/TESTING.md)

A high-performance, **zero-runtime-dependency** TypeScript utility toolkit and standalone CLI for URL manipulation, query string parsing, validation, and encoding across all modern JavaScript environments.

Works out of the box in **Node.js (>= 18.0.0)**, **Modern Browsers**, **Deno**, **Bun**, and **Cloudflare Workers**.

---

## Key Features

- **Zero Runtime Dependencies**: Ultra-lightweight footprint implemented purely with native web and language standard APIs.
- **Prototype Pollution Defenses**: Built-in immunity to `__proto__`, `constructor`, and `prototype` tampering using null-prototype safe dictionaries.
- **Dual ESM & CommonJS Support**: First-class exports for ECMAScript Modules (`.mjs`) and CommonJS (`.cjs`), complete with `.d.ts` and `.d.cts` TypeScript declarations.
- **Tree-Shakable Subpath Exports**: Granular subpaths (e.g., `@kjangid/url-encode-tools/url-parser`) with `"sideEffects": false` for minimal bundle impact.
- **Standalone CLI Toolkit & Aliases**: Full command-line interface (`url-tools`, `url-encode-tools`) plus direct shortcuts (`url-parse`, `b64`, `hex-convert`, etc.) with stdin piping support.
- **Cross-Runtime Compatibility**: Runs reliably across Node.js (>= 18.0.0), modern browsers, Deno, Bun, and Edge runtimes (Cloudflare Workers, Vercel Edge).
- **Compile-Time Version Synchronization**: Automated build-time injection (`__PACKAGE_VERSION__`) ensuring a single source of truth from `package.json` with zero runtime I/O overhead.

---

## Tools Overview

| Tool                | Module Path                               | CLI Command / Alias                        | Description                                                                              |
| :------------------ | :---------------------------------------- | :----------------------------------------- | :--------------------------------------------------------------------------------------- |
| **`url-parser`**    | `@kjangid/url-encode-tools/url-parser`    | `url-tools url-parser` / `url-parse`       | Structured URL parsing conforming to WHATWG URL specifications.                          |
| **`query-string`**  | `@kjangid/url-encode-tools/query-string`  | `url-tools query-string` / `query-string`  | Build & parse query strings with nested objects, arrays, and prototype pollution guards. |
| **`url-validator`** | `@kjangid/url-encode-tools/url-validator` | `url-tools url-validator` / `url-validate` | Validate URLs with protocol allowlists, RFC host validation, and loopback detection.     |
| **`utm-builder`**   | `@kjangid/url-encode-tools/utm-builder`   | `url-tools utm-builder` / `utm-build`      | Append and extract campaign tracking parameters (`utm_source`, `utm_campaign`, etc.).    |
| **`base64`**        | `@kjangid/url-encode-tools/base64`        | `url-tools base64` / `b64`                 | UTF-8 safe Base64 and URL-safe Base64URL string and byte array conversions.              |
| **`url-encoder`**   | `@kjangid/url-encode-tools/url-encoder`   | `url-tools url-encoder` / `url-encode`     | RFC 3986 URI component, path, and full URL encoding with custom reserved keep-sets.      |
| **`html-encoder`**  | `@kjangid/url-encode-tools/html-encoder`  | `url-tools html-encoder` / `html-encode`   | Escape/unescape HTML text and attribute values, named/numeric entities, and strip tags.  |
| **`hex`**           | `@kjangid/url-encode-tools/hex`           | `url-tools hex` / `hex-convert`            | Text and byte array to hexadecimal conversion, formatting, and validation.               |

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

Global CLI installation:

```bash
npm install -g @kjangid/url-encode-tools
```

---

## Quick Start

### Subpath Imports (Recommended for Minimal Bundle Size)

```ts
import { parseUrl } from "@kjangid/url-encode-tools/url-parser";
import { parse as parseQuery, stringify } from "@kjangid/url-encode-tools/query-string";
import { buildUtm } from "@kjangid/url-encode-tools/utm-builder";
import { encode as b64Encode } from "@kjangid/url-encode-tools/base64";

const url = parseUrl("https://example.com/api?user=alice");
console.log(url.hostname); // 'example.com'

const campaign = buildUtm("https://example.com/shop", {
  source: "twitter",
  medium: "social",
  campaign: "spring_launch",
});
```

### Root Import (Namespaced or Direct Named Exports)

```ts
// Namespaces
import { base64, hex, queryString } from "@kjangid/url-encode-tools";

const encoded = base64.encode("Hello World");
const hexStr = hex.encode("Hello World");
const query = queryString.parse("filter=shoes&page=2");

// Direct named imports
import { parseUrl, validateUrl, escapeHtml, VERSION } from "@kjangid/url-encode-tools";
console.log(VERSION); // '1.0.0'
```

---

## Standalone CLI Toolkit

The package includes both a unified CLI (`url-tools` / `url-encode-tools`) and dedicated binary aliases for every tool.

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

| Script                   | Command                                              | Purpose                                                                                    |
| :----------------------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `npm run build`          | `tsup`                                               | Bundle dual ESM (`.mjs`), CJS (`.cjs`), sourcemaps, and TypeScript declarations (`.d.ts`). |
| `npm test`               | `vitest run`                                         | Execute unit and integration tests.                                                        |
| `npm run test:watch`     | `vitest`                                             | Run Vitest in interactive watch mode.                                                      |
| `npm run test:coverage`  | `vitest run --coverage`                              | Generate V8 code coverage reports.                                                         |
| `npm run typecheck`      | `tsc --noEmit`                                       | Strict TypeScript compiler validation.                                                     |
| `npm run bump:patch`     | `npm version patch`                                  | Increment patch version (e.g. 1.0.0 -> 1.0.1).                                             |
| `npm run bump:minor`     | `npm version minor`                                  | Increment minor version (e.g. 1.0.0 -> 1.1.0).                                             |
| `npm run bump:major`     | `npm version major`                                  | Increment major version (e.g. 1.0.0 -> 2.0.0).                                             |
| `npm run prepublishOnly` | `npm run typecheck && npm run test && npm run build` | Release gate verification.                                                                 |
| `npm run publish:dry`    | `npm publish --dry-run`                              | Test npm packaging and review tarball output.                                              |

---

## Release & Publishing

This repository uses a production-ready, automated CI/CD release pipeline powered by **GitHub Actions**, **Git tags**, and **npm Trusted Publishing (OIDC)**. No long-lived secret tokens (`NPM_TOKEN`) are required.

### Release Flow

Never manually edit `"version"` in `package.json`. Instead, use standard Semantic Versioning commands:

```bash
# 1. Bump version and create Git tag automatically (e.g. v1.0.1)
npm version patch   # or minor | major

# 2. Push commit and tag to GitHub
git push --follow-tags
```

Once pushed, GitHub Actions automatically executes the release pipeline:

```text
npm version [patch|minor|major]
       ↓
git push --follow-tags
       ↓
GitHub tag v1.x.x
       ↓
GitHub Actions (.github/workflows/release.yml)
       ↓
npm ci → lint → test → build → verify tag version
       ↓
npm publish via OIDC (--provenance --access public)
       ↓
GitHub Release created automatically
```

### One-Time Setup: npm Trusted Publishing (OIDC)

To allow GitHub Actions to publish to npmjs.com without managing an `NPM_TOKEN`:

1. **Log in to [npmjs.com](https://www.npmjs.com/)**.
2. **Configure Trusted Publishing**:
   - **If the package already exists on npm**: Go to your package page $\rightarrow$ **Settings** $\rightarrow$ **Publishing Access** $\rightarrow$ **Add GitHub Actions Publisher**.
   - **If publishing for the first time**: Go to **Profile Settings** $\rightarrow$ **Publishing** $\rightarrow$ **Add GitHub Publisher** (pending publisher for `@kjangid/url-encode-tools`).
3. **Fill in Publisher Details**:
   - **GitHub Organization or User**: `kajangid`
   - **Repository**: `URLAndEncodingTools`
   - **Workflow filename**: `release.yml`
   - **Environment**: _(leave empty)_
4. **Save**: Subsequent tag pushes matching `v*` will authenticate via short-lived cryptographic OIDC tokens minted by GitHub Actions and validated by npmjs.com.

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

[MIT](LICENSE) © Karan Jangid Tools Team
