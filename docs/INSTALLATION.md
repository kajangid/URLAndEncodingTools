# Installation Guide

`@omnidev-tools/url-and-encoding` can be installed in any Node.js, browser, or edge runtime project, or used directly via its CLI toolkit.

---

## 1. Package Managers

### npm
```bash
npm install @omnidev-tools/url-and-encoding
```

### pnpm
```bash
pnpm add @omnidev-tools/url-and-encoding
```

### yarn
```bash
yarn add @omnidev-tools/url-and-encoding
```

### Bun
```bash
bun add @omnidev-tools/url-and-encoding
```

---

## 2. Standalone Global CLI Installation

To access the CLI binaries (`url-tools`, `omnidev`, `b64`, `hex-convert`, etc.) globally across your system:

```bash
npm install -g @omnidev-tools/url-and-encoding
```

Or execute instantly via `npx` or `bunx` without installing:

```bash
npx @omnidev-tools/url-and-encoding base64 encode "hello world"
npx @omnidev-tools/url-and-encoding url-parser "https://example.com"
```

---

## 3. TypeScript Configuration

For optimal type checking and autocompletion, configure your `tsconfig.json` with modern module resolution:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true
  }
}
```

If using Vite, Next.js, or Bun, `"moduleResolution": "Bundler"` is also fully supported.

---

## 4. Deno & CDN Usage

Because the package is written with standard ESM, you can import it directly in Deno or browser environments via modern CDNs:

```ts
import { parseUrl } from 'https://esm.sh/@omnidev-tools/url-and-encoding@0.1.0/url-parser';

const parsed = parseUrl('https://example.com/api?id=100');
console.log(parsed.hostname);
```
