import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "url-parser/index": "src/url-parser/index.ts",
    "query-string/index": "src/query-string/index.ts",
    "url-validator/index": "src/url-validator/index.ts",
    "utm-builder/index": "src/utm-builder/index.ts",
    "base64/index": "src/base64/index.ts",
    "url-encoder/index": "src/url-encoder/index.ts",
    "html-encoder/index": "src/html-encoder/index.ts",
    "hex/index": "src/hex/index.ts",
    "bin/cli": "src/bin/cli.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  banner: {
    js: "/* @omnidev-tools/url-and-encoding */",
  },
  define: {
    __PACKAGE_VERSION__: JSON.stringify(pkg.version),
  },
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".cjs",
    };
  },
});
