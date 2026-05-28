import { readFile, writeFile } from "fs/promises"
import { defineConfig } from "tsdown"

export async function distHook() {
  // Copy package.json to dist folder
  const data = JSON.parse(await readFile("./package.json", "utf8"))

  function replace(item: any) {
    for (const key in item) {
      const value = item[key]

      if (typeof value == "string") {
        item[key] = value.replace(/^\.\/dist/, ".")
      } else {
        replace(value)
      }
    }
  }

  data.types = data.types.replace(/^\.\/dist/, ".")
  data.main = data.main.replace(/^\.\/dist/, ".")
  data.module = data.module.replace(/^\.\/dist/, ".")
  replace(data.exports)
  await writeFile("dist/package.json", JSON.stringify(data, null, 2))
}

export default defineConfig({
  platform: "neutral",
  format: ["esm", "cjs"],
  entry: {
    index: "./lib/index.ts",
    "builder/index": "./lib/builder/index.ts",
    "html/index": "./lib/html/index.ts",
    "ooxml/index": "./lib/ooxml/index.tsx",
    "rtf/index": "./lib/rtf/index.ts",
    "validation/index": "./lib/validation/index.ts",
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
