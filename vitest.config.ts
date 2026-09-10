import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

export default defineConfig({
  define: {
    __PACKAGE_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.test.ts",
        "src/bin/**",
        "src/index.ts",
        "src/shared/types.ts",
        "tsup.config.ts",
        "vitest.config.ts",
      ],
    },
  },
});
