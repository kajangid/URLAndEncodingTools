# Deployment & Publishing Guide

Step-by-step release process, version bumping protocol, and CI/CD workflow for `@omnidev-tools/url-and-encoding`.

---

## 1. Version Bumping Protocol

Semantic Versioning (SemVer) is strictly enforced:

```bash
# Bug fixes and security patches (1.0.0 -> 1.0.1)
npm run bump:patch

# Backwards-compatible features and new utilities (1.0.0 -> 1.1.0)
npm run bump:minor

# Breaking changes (1.0.0 -> 2.0.0)
npm run bump:major
```

Each script runs `npm version` and automatically tags the git commit. Because [`tsup.config.ts`](file:///D:/Projects/Utility%20Tool%20Package/URLAndEncodingTools/tsup.config.ts) and [`vitest.config.ts`](file:///D:/Projects/Utility%20Tool%20Package/URLAndEncodingTools/vitest.config.ts) inject `__PACKAGE_VERSION__` directly from [`package.json`](file:///D:/Projects/Utility%20Tool%20Package/URLAndEncodingTools/package.json), the version is automatically synchronized throughout [`src/version.ts`](file:///D:/Projects/Utility%20Tool%20Package/URLAndEncodingTools/src/version.ts), the library root exports, and the CLI executable—requiring zero manual code edits.

---

## 2. Pre-Publish Verification

Before any release is pushed to npm, the `prepublishOnly` lifecycle hook automatically runs:
1. `npm run typecheck` (Ensures zero TypeScript compiler errors)
2. `npm test` (Ensures 100% test pass rate)
3. `npm run build` (Emits fresh `.mjs`, `.cjs`, `.d.ts`, and CLI executables)

You can preview the exact payload tarball without publishing using:
```bash
npm run publish:dry
```

---

## 3. Publishing to NPM

### Initial Public Release
When publishing a scoped package for the first time:
```bash
npm publish --access public
```

### Subsequent Releases
```bash
npm publish
```

---

## 4. Continuous Integration (CI) Workflow

The GitHub Actions workflow is located at `.github/workflows/ci.yml`. It runs on every push and pull request to the `main` branch across Node.js versions 18, 20, and 22:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```
