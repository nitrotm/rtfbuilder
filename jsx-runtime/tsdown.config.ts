import { defineConfig } from "tsdown"
import { distHook } from "../tsdown.config.ts"

export default defineConfig({
  platform: "neutral",
  format: ["esm", "cjs"],
  entry: {
    index: "./jsx-runtime.ts",
    "jsx-runtime": "./jsx-runtime.ts",
  },
  copy: ["README.md", "LICENSE.txt", "yarn.lock"],
  dts: true,
  exports: true,
  minify: true,
  sourcemap: true,
  hooks(hooks) {
    hooks.hook("build:done", distHook)
  },
})
