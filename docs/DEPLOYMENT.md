# Deployment & Publishing Guide

Step-by-step release process, version bumping protocol, and CI/CD workflow for `@kjangid/url-encode-tools`.

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

## 3. Automated CD / Release Workflow (npm OIDC Trusted Publishing)

Releases are completely automated via GitHub Actions using **OpenID Connect (OIDC) Trusted Publishing**. No static `NPM_TOKEN` is stored or required.

### Release Execution Steps

```bash
# 1. Bump version and create Git tag automatically (v1.0.1)
npm version patch # or minor | major

# 2. Push commit and tag to GitHub
git push --follow-tags
```

When a tag matching `v*` is pushed:
1. GitHub Actions triggers [`.github/workflows/release.yml`](file:///D:/Projects/Utility%20Tool%20Package/URLAndEncodingTools/.github/workflows/release.yml).
2. The workflow checks out the tagged commit.
3. Node.js environment is configured (`registry-url: https://registry.npmjs.org`).
4. Verifies that the Git tag (e.g. `v1.0.1`) strictly matches the version in `package.json` (`1.0.1`).
5. Runs `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
6. Publishes to npmjs.com via `npm publish --access public --provenance` using short-lived OIDC tokens.
7. Automatically generates a GitHub Release with changelog notes.

---

## 4. Continuous Integration (CI) Workflow

The GitHub Actions validation workflow is located at [`.github/workflows/ci.yml`](file:///D:/Projects/Utility%20Tool%20Package/URLAndEncodingTools/.github/workflows/ci.yml). It runs on all pushes and pull requests targeting `main` and `master`:

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  validate:
    name: Lint, Test & Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## 5. One-Time Setup: npm Trusted Publishing

1. Log in to [npmjs.com](https://www.npmjs.com/).
2. Navigate to your package settings (or Profile Settings $\rightarrow$ Publishing if creating initial package).
3. Under **Trusted Publishers**, click **Add GitHub Publisher**.
4. Enter:
   - **Owner**: `kajangid`
   - **Repository**: `URLAndEncodingTools`
   - **Workflow filename**: `release.yml`
   - **Environment**: *(leave blank)*
5. Save the configuration.
