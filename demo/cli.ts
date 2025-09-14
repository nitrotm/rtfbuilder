import * as fs from "fs"
import { dirname } from "path"
import { fileURLToPath } from "url"

import { RichTextDocument, RichTextDocumentBuilder, RichTextDocumentValidator } from "../lib"
import { RTFDocument } from "../lib/rtf"
import { OOXMLDocument } from "../lib/ooxml"
import { RTF_DOCUMENT_VALIDATOR } from "../lib/validation"

function usage(code: number): never {
  console.log("Usage: footnote.ts [--validate] <example> <output.ext>")
  console.log("  --validate: Validate the document structure before saving (optional)")
  console.log("  example: Name of the example to run (e.g., footnote, table, image)")
  console.log("  output.ext: Path to output file (either .rtf or .docx)")
  process.exit(code)
}

// Parse command line arguments
const args = process.argv.slice(2)
let validator: RichTextDocumentValidator | undefined = undefined
let example: string | undefined = undefined
let output: string | undefined = undefined

for (const arg of args) {
  switch (arg) {
    case "--help":
    case "-h":
      usage(0)
    case "--validate":
    case "-v":
      validator = RTF_DOCUMENT_VALIDATOR
      break
    default:
      if (example === undefined) {
        example = `${dirname(fileURLToPath(import.meta.url))}/examples/${arg}.ts`
        break
      }
      if (output === undefined) {
        output = arg
        break
      }
      usage(1)
  }
}
if (example === undefined || output === undefined) {
  usage(1)
}
if (!fs.existsSync(example)) {
  console.error(`${example} does not exist`)
  process.exit(1)
}

// Load example
const builder: RichTextDocumentBuilder = (await import(example)).default

// Create document
let doc: RichTextDocument<string | Uint8Array>

if (output.endsWith(".docx")) {
  doc = new OOXMLDocument({ validator })
} else if (output.endsWith(".rtf")) {
  doc = new RTFDocument({ validator })
} else {
  console.error("Output file must have either .rtf or .docx extension")
  process.exit(1)
}

// Generate RTF content
const content = builder.buildInto(doc).render()

fs.writeFile(output, content, (error) => {
  if (error) {
    console.error(`Failed to create ${output}: ${error}`)
    process.exit(1)
  }
  console.log(`Created ${output}`)
})
