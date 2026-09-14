# Installation Guide

`@kjangid/url-encode-tools` can be installed in any Node.js, browser, or edge runtime project, or used directly via its CLI toolkit.

---

## 1. Package Managers

### npm

```bash
npm install @kjangid/url-encode-tools
```

### pnpm

```bash
pnpm add @kjangid/url-encode-tools
```

### yarn

```bash
yarn add @kjangid/url-encode-tools
```

### Bun

```bash
bun add @kjangid/url-encode-tools
```

---

## 2. Standalone Global CLI Installation

To access the CLI binaries (`url-tools`, `url-encode-tools`, `b64`, `hex-convert`, etc.) globally across your system:

```bash
npm install -g @kjangid/url-encode-tools
```

Or execute instantly via `npx` or `bunx` without installing:

```bash
npx @kjangid/url-encode-tools base64 encode "hello world"
npx @kjangid/url-encode-tools url-parser "https://example.com"
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
import { parseUrl } from "https://esm.sh/@kjangid/url-encode-tools@0.1.0/url-parser";

const parsed = parseUrl("https://example.com/api?id=100");
console.log(parsed.hostname);
```
