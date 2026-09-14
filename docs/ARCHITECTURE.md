# Architecture & Design

`@kjangid/url-encode-tools` is designed as a zero-runtime-dependency, tree-shakable TypeScript toolkit providing URL manipulation, validation, and encoding utilities for modern JavaScript runtimes.

---

## 1. High-Level Design Principles

1. **Zero Runtime Dependencies**:
   - Every algorithm (URL parsing, query parameter serialization, HTML entity escaping, Base64/Base64URL encoding, hexadecimal conversion) is implemented from first principles.
   - Relies exclusively on standard web APIs (`URL`, `URLSearchParams`, `TextEncoder`, `TextDecoder`) and Node.js standard libraries (`node:fs`, `node:path`) where applicable.

2. **Security by Default**:
   - Built-in defenses against **Prototype Pollution**.
   - Safe null-prototype dictionary creation (`Object.create(null)`).
   - Strict input validation, bounds checks, and depth limit safeguards on nested parsing.

3. **Dual-Module Architecture**:
   - Ships dual ESM (`.mjs`) and CommonJS (`.cjs`) outputs.
   - Emits TypeScript declaration files (`.d.ts` and `.d.cts`) for complete IDE type inference.

4. **Multi-Runtime Compatibility**:
   - Node.js (>= 18.0.0)
   - Modern Browsers (Chrome, Firefox, Safari, Edge)
   - Deno (>= 1.30)
   - Bun (>= 1.0)
   - Cloudflare Workers & Vercel Edge Runtime

---

## 2. Module Boundaries & Directory Structure

```
src/
├── shared/
│   ├── types.ts              # Universal primitives and generic types
│   ├── security.ts           # Prototype pollution defense, safe object creation
│   └── security.test.ts      # Unit & penetration tests for security guards
├── url-parser/               # WHATWG-compliant URL component breakdown
│   ├── index.ts
│   └── index.test.ts
├── query-string/             # Nested and array query string builder/parser
│   ├── index.ts
│   └── index.test.ts
├── url-validator/            # Strict URL validation & RFC host compliance
│   ├── index.ts
│   └── index.test.ts
├── utm-builder/              # Marketing campaign parameter injection & extraction
│   ├── index.ts
│   └── index.test.ts
├── base64/                   # Base64 and Base64URL encoding/decoding
│   ├── index.ts
│   └── index.test.ts
├── url-encoder/              # URI encoding, decoding, and custom keep sets
│   ├── index.ts
│   └── index.test.ts
├── html-encoder/             # HTML entity escaping/unescaping and tag stripping
│   ├── index.ts
│   └── index.test.ts
├── hex/                      # Hexadecimal byte & string manipulation
│   ├── index.ts
│   └── index.test.ts
├── bin/                      # Standalone CLI binary and integration test suite
│   ├── cli.ts                # Executable command runner & argument parser
│   └── cli.test.ts           # CLI integration test suite
├── version.ts                # Build-time package version resolver (__PACKAGE_VERSION__)
├── version.test.ts           # Version resolution & SemVer integrity tests
├── index.ts                  # Root library entrypoint (namespaces + named exports)
└── index.test.ts             # Root export integrity tests
```

---

## 3. Data Flow & Execution Pipeline

### Library Pipeline

```
[User Application]
       │
       ▼
[Subpath or Root Import]
       │
       ├──> url-parser / query-string
       │         │
       │         ▼
       │    [shared/security.ts] (Filters __proto__, constructor, prototype)
       │         │
       │         ▼
       │    [createSafeObject()] (Null-prototype dictionary)
       │
       └──> base64 / hex / url-encoder / html-encoder
                 │
                 ▼
            [TextEncoder / TextDecoder / Native APIs]
```

### CLI Execution Pipeline

```
[User Terminal / Shell]
       │
       ▼
[dist/bin/cli.cjs]
       │
       ├── Detect Binary Alias (`process.argv[1]`: url-parse, b64, hex-convert, etc.)
       ├── Parse Flags & Positional Arguments
       ├── Resolve Input (Stdin pipe, file path, or direct argument)
       │
       ▼
[src/bin/cli.ts Execution Engine]
       │
       ├── Success: stdout output + exit code 0
       ├── Operation / Validation Failure: stderr message + exit code 1
       └── CLI Usage / Syntax Error: stderr message + exit code 2
```

---

## 4. Bundling & Distribution Design

We configure `tsup` to emit optimized, tree-shakable bundles:

- **Target**: `ES2022`
- **Output Extensions**:
  - ESM: `.mjs`
  - CJS: `.cjs`
- **Sourcemaps**: Enabled for fast debugging and stack traces.
- **Shims**: Enabled for cross-runtime CommonJS/ESM polyfilling (`import.meta.url`, `__dirname`).
- **Subpath Exports**: Configured in `package.json` `"exports"` field, allowing consumers to import only what they need without loading unneeded tools.

---

## 5. Compile-Time Version Injection (Single Source of Truth)

To ensure zero runtime file-system I/O when resolving the version string across both library exports and the CLI, the package employs compile-time definition injection:

1. **Source of Truth**: `package.json`'s `"version"` field is the sole authoritative version string.
2. **Bundler & Test Runner Injection**: Both `tsup.config.ts` and `vitest.config.ts` read `package.json` and declare `__PACKAGE_VERSION__`:
   ```ts
   define: {
     __PACKAGE_VERSION__: JSON.stringify(pkg.version),
   }
   ```
3. **Zero-Overhead Resolution**: [`src/version.ts`](file:///D:/Projects/Utility%20Tool%20Package/URLAndEncodingTools/src/version.ts) exports `VERSION`, resolved from `__PACKAGE_VERSION__` (with an untranspiled fallback). In compiled bundles, `tsup` inlines this directly as a literal string constant, eliminating runtime `fs` operations and JSON parsing in downstream applications.
