import * as fs from "fs"
import { DocumentBuilder, pt, mm, inch } from "../lib"
import { RTFDocument } from "../lib/rtf"
import { RTF_DOCUMENT_VALIDATOR } from "../lib/validation"

// Parse command line arguments
const args = process.argv.slice(2)

// Check for help flag or missing argument
if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log("Usage: text-formatting.ts <output.rtf> [--validate]")
  console.log("  output.rtf: Path to output RTF file (required)")
  process.exit(args.length === 0 ? 1 : 0)
}

const outputFile = args[0]
const validator = args.includes("--validate") ? RTF_DOCUMENT_VALIDATOR : undefined

// Create content using the new builder pattern
const builder = new DocumentBuilder()

// Setup colors for the demo
builder.withColor("red", { red: 255, green: 0, blue: 0 })
builder.withColor("blue", { red: 0, green: 0, blue: 255 })
builder.withColor("green", { red: 0, green: 128, blue: 0 })
builder.withColor("orange", { red: 255, green: 165, blue: 0 })
builder.withColor("purple", { red: 128, green: 0, blue: 128 })
builder.withColor("darkGray", { red: 64, green: 64, blue: 64 })
builder.withColor("lightBlue", { red: 173, green: 216, blue: 230 })
builder.withColor("yellow", { red: 255, green: 255, blue: 0 })

// Add fonts for the demo
builder.withFont("arial", { name: "Arial", family: "swiss" })
builder.withFont("times", { name: "Times New Roman", family: "roman" })
builder.withFont("courier", { name: "Courier New", family: "modern" })
builder.withFont("verdana", { name: "Verdana", family: "swiss" })

// Create a new section
builder.withSection((section) => {
  // Document title
  section.body.withTitle("RTF Text & Paragraph Formatting Demo")

  // Section 1: Basic Text Formatting
  section.body.withHeading("1. Basic Text Formatting", 1)
  section.body.withText("This section demonstrates basic character-level formatting options:").closeParagraph()
  section.body
    .withText(
      "Basic styles: ",
      { bold: true },
      "Bold",
      {},
      ", ",
      { italic: true },
      "Italic",
      {},
      ", ",
      { underline: true },
      "Underlined",
      {},
      ", ",
      { bold: true, italic: true },
      "Bold Italic",
      {},
      ", and ",
      { bold: true, italic: true, underline: true },
      "All Three",
      {},
      "."
    )
    .closeParagraph()
  section.body
    .withText(
      "Underline variations: ",
      { underline: true },
      "Single",
      {},
      ", ",
      { underline: "double" },
      "Double",
      {},
      ", ",
      { underline: "dotted" },
      "Dotted",
      {},
      ", ",
      { underline: "dash" },
      "Dashed",
      {},
      ", and ",
      { underline: "wave" },
      "Wavy",
      {},
      "."
    )
    .closeParagraph()
  section.body
    .withText(
      "Text effects: ",
      { strikethrough: true },
      "Strikethrough",
      {},
      ", ",
      { strikethrough: "double" },
      "Double Strikethrough",
      {},
      ", ",
      { flags: ["superscript"] },
      "Superscript",
      {},
      ", ",
      { flags: ["subscript"] },
      "Subscript",
      {},
      ", ",
      { flags: ["smallCaps"] },
      "Small Caps",
      {},
      ", and ",
      { flags: ["allCaps"] },
      "All Caps",
      {},
      "."
    )
    .closeParagraph()

  section.body.withHeading("2. Colors and Fonts", 1)
  section.body.withText("Demonstrating text colors and different font families:").closeParagraph()
  section.body
    .withText(
      "Colors: ",
      { colorAlias: "red" },
      "Red",
      {},
      ", ",
      { colorAlias: "blue" },
      "Blue",
      {},
      ", ",
      { colorAlias: "green" },
      "Green",
      {},
      ", ",
      { colorAlias: "orange" },
      "Orange",
      {},
      ", and ",
      { colorAlias: "purple" },
      "Purple",
      {},
      "."
    )
    .closeParagraph()
  section.body
    .withText(
      "Background colors: ",
      { highlightColorAlias: "yellow" },
      "Yellow highlight",
      {},
      ", ",
      { highlightColorAlias: "lightBlue" },
      "Light blue highlight",
      {},
      ", and ",
      { colorAlias: "red", highlightColorAlias: "yellow" },
      "Red on yellow",
      {},
      "."
    )
    .closeParagraph()
  section.body
    .withText(
      "Font families: ",
      { fontAlias: "arial" },
      "Arial (Swiss)",
      {},
      ", ",
      { fontAlias: "times" },
      "Times New Roman (Roman)",
      {},
      ", ",
      { fontAlias: "courier" },
      "Courier New (Modern)",
      {},
      ", and ",
      { fontAlias: "verdana" },
      "Verdana (Swiss)",
      {},
      "."
    )
    .closeParagraph()

  // Section 3: Font Sizes
  section.body.withHeading("3. Font Sizes", 1)
  section.body.withText("Various font sizes available:").closeParagraph()
  section.body
    .withText(
      { fontSize: pt(8) },
      "8pt",
      {},
      " • ",
      { fontSize: pt(10) },
      "10pt",
      {},
      " • ",
      { fontSize: pt(12) },
      "12pt",
      {},
      " • ",
      { fontSize: pt(14) },
      "14pt",
      {},
      " • ",
      { fontSize: pt(16) },
      "16pt",
      {},
      " • ",
      { fontSize: pt(18) },
      "18pt",
      {},
      " • ",
      { fontSize: pt(24) },
      "24pt",
      {},
      " • ",
      { fontSize: pt(36) },
      "36pt"
    )
    .closeParagraph()

  // Section 4: Character Spacing and Scaling
  section.body.withHeading("4. Character Spacing and Scaling", 1)
  section.body.withText("Advanced character formatting:").closeParagraph()
  section.body
    .withText("Character spacing: ", { characterSpacing: pt(-2) }, "Condensed", {}, " | ", {}, "Normal", {}, " | ", { characterSpacing: pt(4) }, "Expanded")
    .closeParagraph()
  section.body
    .withText(
      "Horizontal scaling: ",
      { horizontalScaling: 75 },
      "75%",
      {},
      " | ",
      { horizontalScaling: 100 },
      "100%",
      {},
      " | ",
      { horizontalScaling: 150 },
      "150%"
    )
    .closeParagraph()

  // Section 5: Paragraph Alignment
  section.body.withHeading("5. Paragraph Alignment", 1)
  section.body.withText("Different paragraph alignment options:").closeParagraph()
  section.body.withParagraph((p) => {
    p.left()
    p.withText(
      "This paragraph is left-aligned. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    )
  })
  section.body.withParagraph((p) => {
    p.center()
    p.withText(
      "This paragraph is center-aligned. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    )
  })
  section.body.withParagraph((p) => {
    p.right()
    p.withText(
      "This paragraph is right-aligned. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    )
  })
  section.body.withParagraph((p) => {
    p.justify()
    p.withText(
      "This paragraph is justified. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    )
  })

  // Section 6: Paragraph Spacing
  section.body.withHeading("6. Paragraph Spacing", 1)
  section.body.withText("Controlling spacing before and after paragraphs:").closeParagraph()
  section.body.withParagraph((p) =>
    p
      .spacing(pt(0))
      .border("bottom", { width: pt(0.5), colorAlias: "darkGray" })
      .withText("Paragraph without space after or before.")
  )
  section.body.withParagraph((p) => {
    p.spaceBefore(pt(0)).spaceAfter(pt(5))
    p.withText("Paragraph with 5pt space after.")
  })
  section.body.withParagraph((p) =>
    p
      .spacing(pt(0))
      .border("vertical", { width: pt(0.5), colorAlias: "darkGray" })
      .withText("Paragraph without space after or before.")
  )
  section.body.withParagraph((p) => {
    p.spaceBefore(pt(10)).spaceAfter(pt(5))

    p.withText("Paragraph with 10pt space before and 5pt after.")
  })
  section.body.withParagraph((p) =>
    p
      .spacing(pt(0))
      .border("vertical", { width: pt(0.5), colorAlias: "darkGray" })
      .withText("Paragraph without space after or before.")
  )
  section.body.withParagraph((p) => {
    p.spaceBefore(pt(20)).spaceAfter(pt(10))
    p.withText("Paragraph with 20pt space before and 10pt after.")
  })
  section.body.withParagraph((p) =>
    p
      .spacing(pt(0))
      .border("top", { width: pt(0.5), colorAlias: "darkGray" })
      .withText("Paragraph without space after or before.")
  )

  // Section 7: Line Spacing
  section.body.withHeading("7. Line Spacing", 1)
  section.body.withText("Different line spacing options:").closeParagraph()
  section.body.withParagraph((p) => {
    p.lineSpacing(pt(12))
    p.withText(
      "Single line spacing. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
    )
  })
  section.body.withParagraph((p) => {
    p.lineSpacing(pt(18))
    p.withText(
      "1.5 line spacing. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
    )
  })
  section.body.withParagraph((p) => {
    p.lineSpacing(pt(24))
    p.withText(
      "Double line spacing. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
    )
  })

  // Section 8: Indentation
  section.body.withHeading("8. Paragraph Indentation", 1)
  section.body.withText("Various indentation options:").closeParagraph()
  section.body.withParagraph((p) => {
    p.leftIndent(pt(36))
    p.withText(
      "Left indented paragraph (0.5 inch). Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    )
  })
  section.body.withParagraph((p) => {
    p.rightIndent(pt(36))
    p.withText(
      "Right indented paragraph (0.5 inch). Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    )
  })
  section.body.withParagraph((p) => {
    p.leftIndent(pt(72))
    p.rightIndent(pt(36))
    p.withText(
      "Both left (1 inch) and right (0.5 inch) indented. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    )
  })
  section.body.withParagraph((p) => {
    p.leftIndent(pt(36))
    p.firstLineIndent(pt(18))
    p.withText(
      "First line indented more than the rest. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
    )
  })
  section.body.withParagraph((p) => {
    p.leftIndent(pt(54))
    p.firstLineIndent(pt(-18))
    p.withText(
      "Hanging indent (first line outdented). Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
    )
  })

  // Section 9: Paragraph Borders
  section.body.withHeading("9. Paragraph Borders", 1)
  section.body.withText("Paragraphs can have various border styles:").closeParagraph()
  section.body.withParagraph((p) => {
    p.border("all", { width: pt(1), colorAlias: "blue" })
    p.withText("Paragraph with a blue single border on all sides.")
  })
  section.body.withParagraph((p) => {
    p.border("top", { width: pt(2), colorAlias: "red" })
    p.border("bottom", { width: pt(2), colorAlias: "red" })
    p.withText("Paragraph with red double borders on top and bottom only.")
  })
  section.body.withParagraph((p) => {
    p.border("left", { width: pt(3), colorAlias: "green" })
    p.leftIndent(pt(10))
    p.withText("Paragraph with a thick green dotted left border and left indent.")
  })

  // Section 10: Paragraph Shading
  section.body.withHeading("10. Paragraph Shading", 1)
  section.body.withText("Paragraphs can have background shading:").closeParagraph()
  section.body.withParagraph((p) => {
    p.shading(0.1) // 10% gray
    p.withText("Paragraph with 10% gray shading.")
  })
  section.body.withParagraph((p) => {
    p.shading(0.25) // 25% gray
    p.withText("Paragraph with 25% gray shading.")
  })
  section.body.withParagraph((p) => {
    p.shading(0.5, undefined, "lightBlue") // 50% with light blue background
    p.withText("Paragraph with 50% shading and light blue background.")
  })

  // Section 11: Keep Together Options
  section.body.withHeading("11. Paragraph Keep Options", 1)
  section.body.withText("Control how paragraphs break across pages:").closeParagraph()
  section.body.withParagraph((p) => {
    p.flags("keepNext")
    p.withText("This paragraph is kept together with the next one (keepNext).")
  })
  section.body.withText("This paragraph follows the previous one and they should stay together.").closeParagraph()
  section.body.withParagraph((p) => {
    p.flags("keepLines")
    p.withText(
      "This paragraph's lines are kept together on the same page (keepLines). Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    )
  })

  // Section 12: Page Breaks
  section.body.withHeading("12. Page Break Control", 1)
  section.body.withText("The next paragraph forces a page break before it:").closeParagraph()
  section.body.withParagraph((p) => {
    p.flags("pageBreakBefore")
    p.center()
    p.withText({ bold: true, fontSize: pt(24) }, "NEW PAGE")
  })

  section.body.withText("This content appears on the new page after the page break.")

  // Section 13: Complex Mixed Formatting
  section.body.withHeading("13. Complex Mixed Formatting", 1)
  section.body.withText("Combining multiple formatting options in a single paragraph:").closeParagraph()
  section.body.withParagraph((p) => {
    p.justify()
    p.leftIndent(pt(36))
    p.rightIndent(pt(18))
    p.spaceBefore(pt(12)).spaceAfter(pt(6))
    p.lineSpacing(pt(18))
    p.border("all", { width: pt(1), colorAlias: "darkGray" })
    p.shading(0.05)
    p.withText(
      "This paragraph demonstrates ",
      { bold: true, colorAlias: "blue" },
      "complex formatting",
      {},
      " with justified alignment, indentation, spacing, borders, and shading. ",
      {},
      "It contains ",
      { italic: true, colorAlias: "red" },
      "mixed character formatting",
      {},
      " including different ",
      { fontAlias: "courier" },
      "fonts",
      {},
      ", ",
      { fontSize: pt(14) },
      "sizes",
      {},
      ", and ",
      { underline: true, colorAlias: "green" },
      "effects",
      {},
      " all within the same paragraph structure."
    )
  })

  // Section 14: Special Characters and Symbols
  section.body.withHeading("14. Special Characters", 1)
  section.body.withText("RTF supports various special characters and symbols:").closeParagraph()
  section.body.withText("Common symbols: © ® ™ § ¶ • – — \" \" ' ' … ± × ÷ ≤ ≥ ≠ ∞ ∑ ∏ ∆ Ω").closeParagraph()
  section.body.withText("Currency symbols: $ ¢ £ ¥ € ₹ ₽ ₩ ₨ ₡ ₪ ₫ ₱").closeParagraph()
  section.body.withText("Arrows: ← ↑ → ↓ ↔ ↕ ⇐ ⇑ ⇒ ⇓ ⇔ ⇕").closeParagraph()
  section.body.withText("Mathematical symbols: ∫ ∂ ∇ √ ∛ ∜ ∝ ∞ ∅ ∈ ∉ ∩ ∪ ⊂ ⊃ ⊆ ⊇").closeParagraph()

  // Footer
  section.body.withParagraph((p) => {
    p.spaceBefore(pt(24)).spaceAfter(pt(12))
    p.center()
    p.border("top", { width: pt(1), colorAlias: "darkGray" })
    p.withText({ italic: true, colorAlias: "darkGray" }, "RTF Text & Paragraph Formatting Demo")
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
