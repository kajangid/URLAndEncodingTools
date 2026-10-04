# Contributing & Developer Guide

## Development Setup

```bash
git clone https://github.com/kajangid/URLAndEncodingTools.git
cd URLAndEncodingTools
npm install
```

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run build` | `tsup` | Bundle dual ESM (`.mjs`), CJS (`.cjs`), sourcemaps, and TypeScript declarations (`.d.ts`). |
| `npm test` | `vitest run` | Execute unit and integration tests. |
| `npm run test:watch` | `vitest` | Run Vitest in interactive watch mode. |
| `npm run test:coverage` | `vitest run --coverage` | Generate V8 code coverage reports. |
| `npm run lint` | `tsc --noEmit` | Strict TypeScript compiler validation. |
| `npm run bump:patch` | `npm version patch` | Increment patch version (e.g. 1.0.0 -> 1.0.1). |
| `npm run bump:minor` | `npm version minor` | Increment minor version (e.g. 1.0.0 -> 1.1.0). |
| `npm run bump:major` | `npm version major` | Increment major version (e.g. 1.0.0 -> 2.0.0). |
| `npm run prepublishOnly` | `npm run lint && npm test && npm run build` | Release gate verification. |
| `npm run publish:dry` | `npm publish --dry-run` | Test npm packaging and review tarball output. |

## Release & Deployment

Refer to [docs/DEPLOYMENT.md](https://github.com/kajangid/URLAndEncodingTools/blob/master/docs/DEPLOYMENT.md) for details on GitHub Actions OIDC Trusted Publishing and release workflows.
