import { defineConfig } from "tsdown"

export default defineConfig({
  platform: "neutral",
  format: ["esm", "cjs"],
  entry: {
    "jsx-runtime": "./jsx-runtime.ts",
  },
  dts: true,
  exports: true,
  minify: true,
  sourcemap: true,
})
