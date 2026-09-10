import { defineConfig } from 'tsup';

const entries = [
  'src/index.ts',
  'src/url-parser/index.ts',
  'src/query-string/index.ts',
  'src/url-validator/index.ts',
  'src/utm-builder/index.ts',
  'src/base64/index.ts',
  'src/url-encoder/index.ts',
  'src/html-encoder/index.ts',
  'src/hex/index.ts',
  'src/cli/index.ts',
];

export default defineConfig({
  entry: entries,
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  shims: true,
  splitting: false,
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  },
});
