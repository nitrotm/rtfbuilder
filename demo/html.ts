import * as fs from "fs"
import { DOMParser } from "@xmldom/xmldom"

import { RichTextDocument, RichTextDocumentValidator } from "../lib"
import { createBuilderFromSimpleHtml } from "../lib/html"
import { RTFDocument } from "../lib/rtf"
import { OOXMLDocument } from "../lib/ooxml"
import { RTF_DOCUMENT_VALIDATOR } from "../lib/validation"

function usage(code: number): never {
  console.log("Usage: html.ts [--validate] <input.html> <output.ext>")
  console.log("  --validate: Validate the document structure before saving (optional)")
  console.log("  input.html: Path to input HTML file")
  console.log("  output.ext: Path to output file (either .rtf or .docx)")
  process.exit(code)
}

// Parse command line arguments
const args = process.argv.slice(2)
let validator: RichTextDocumentValidator | undefined = undefined
let input: string | undefined = undefined
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
      if (input === undefined) {
        input = arg
        break
      }
      if (output === undefined) {
        output = arg
        break
      }
      usage(1)
  }
}
if (input === undefined || output === undefined) {
  usage(1)
}
if (!fs.existsSync(input)) {
  console.error(`${input} does not exist`)
  process.exit(1)
}

// Parse input file
const parser = new DOMParser()
const html = parser.parseFromString(fs.readFileSync(input, "utf-8"), "text/html")
const builder = await createBuilderFromSimpleHtml(html)

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
