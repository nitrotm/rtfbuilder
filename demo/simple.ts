import * as fs from "fs"
import { DocumentBuilder, pt } from "../lib"
import { RTFDocument } from "../lib/rtf"
import { RTF_DOCUMENT_VALIDATOR } from "../lib/validation"

// Parse command line arguments
const args = process.argv.slice(2)

// Check for help flag or missing argument
if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log("Usage: simple.ts <output.rtf> [--validate]")
  console.log("  output.rtf: Path to output RTF file (required)")
  process.exit(args.length === 0 ? 1 : 0)
}

const outputFile = args[0]
const validator = args.includes("--validate") ? RTF_DOCUMENT_VALIDATOR : undefined

// Create content using the new builder pattern
const builder = new DocumentBuilder()

// Add some colors
builder.withColor("red", { red: 255, green: 0, blue: 0 })
builder.withColor("blue", { red: 0, green: 0, blue: 255 })

// Add some fonts
builder.withFont("arial", { name: "Arial", family: "swiss" })

// Create a new section
builder.withSection((section) => {
  // Create a centered title
  section.body.withTitle("demo")

  // Create a description paragraph
  section.body.withText("This is a simple RTF document created with the new builder pattern API.").closeParagraph()

  // Create a paragraph with mixed formatting
  section.body.withText(
    "Here is some ",
    { bold: true, colorAlias: "red" },
    "bold red text",
    {},
    " and some ",
    { italic: true, colorAlias: "blue" },
    "italic blue text",
    {},
    "."
  )

  // Create a simple table using the builder pattern
  section.body.withSimpleTable(["Table row", "with two columns"], [["Second row", "and the second column"]])

  // Create a paragraph with borders
  section.body.withParagraph((p) => {
    p.border("all", { width: pt(2), colorAlias: "red" }).withText("This paragraph has a red border.")
  })

  // Create a table with borders
  section.body.withTable((table) => {
    table.cellBorder("all", { width: pt(1) })
    table.cellPadding({ top: pt(5), right: pt(5), bottom: pt(5), left: pt(5) })

    table.withHeaderRow((row) => {
      row.withCell((cell) => cell.withText({ bold: true }, "Header 1"))
      row.withCell((cell) => cell.withText({ bold: true }, "Header 2"))
    })

    table.withRow((row) => {
      row.withCell((cell) => {
        cell.border("all", { width: pt(1), colorAlias: "blue", style: "dotted" })
        cell.withText("Dotted blue border")
      })
      row.withCell((cell) => {
        cell.shading(0.5)
        cell.withText("Shaded cell")
      })
    })
  })
})

// Generate RTF content
const content = builder.buildInto(new RTFDocument({ validator })).render()

fs.writeFile(outputFile, content, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.log(`Created ${outputFile}`)
  }
})
