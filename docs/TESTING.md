# Testing Strategy & Verification

`@kjangid/url-encode-tools` maintains rigorous test-driven validation covering unit tests, security vector attacks, and CLI integration.

---

## 1. Test Architecture & Framework

- **Runner**: [Vitest](https://vitest.dev/) with native ESM and TypeScript support.
- **Coverage Engine**: V8 code coverage via `@vitest/coverage-v8`.
- **Target Coverage**: Comprehensive coverage (>95% lines/statements).

---

## 2. Test Matrix

The test suite is partitioned across:

1. **Collocated Tool Unit Tests**:
   - `src/url-parser/index.test.ts`
   - `src/query-string/index.test.ts`
   - `src/url-validator/index.test.ts`
   - `src/utm-builder/index.test.ts`
   - `src/base64/index.test.ts`
   - `src/url-encoder/index.test.ts`
   - `src/html-encoder/index.test.ts`
   - `src/hex/index.test.ts`
   - `src/shared/security.test.ts`
   - `src/index.test.ts`

2. **Security Attack Tests**:
   - `tests/security-prototype-pollution.test.ts`
   - Validates resistance against direct `__proto__`, bracketed `__proto__[isAdmin]=true`, `constructor[prototype]` pollution, and nested object traversal attacks.

3. **CLI Integration Tests**:
   - `tests/cli.test.ts`
   - Validates argument parsing, flags (`--help`, `--version`, `--json`, `--field`), exit codes (`0` success, `1` validation failure, `2` syntax error), and dedicated binary aliases.

---

## 3. Running Tests

```bash
# Execute full test suite
npm test

# Run tests in watch mode
npm run test:watch

# Generate V8 coverage report
npm run test:coverage

# Perform strict TypeScript type checking
npm run typecheck
```
