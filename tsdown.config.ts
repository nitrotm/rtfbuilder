import { defineConfig } from "tsdown"

export default defineConfig({
  platform: "neutral",
  format: ["esm", "cjs"],
  entry: {
    index: "./lib/index.ts",
    builder: "./lib/builder/index.ts",
    html: "./lib/html/index.ts",
    ooxml: "./lib/ooxml/index.tsx",
    rtf: "./lib/rtf/index.ts",
    validation: "./lib/validation/index.ts",
  },
  dts: true,
  exports: true,
  minify: true,
  sourcemap: true,
})
