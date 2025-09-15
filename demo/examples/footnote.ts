import { RichTextDocumentBuilder } from "../../lib"

const builder = new RichTextDocumentBuilder()

// Add colors for emphasis
builder.withColor("blue", { red: 0, green: 0, blue: 139 })
builder.withColor("red", { red: 139, green: 0, blue: 0 })
builder.withColor("gray", { red: 100, green: 100, blue: 100 })
builder.withColor("black", { red: 0, green: 0, blue: 0 })

// Add fonts
builder.withFont("arial", { name: "Arial", family: "swiss" })
builder.withFont("times", { name: "Times New Roman", family: "roman" })
builder.withFont("courier", { name: "Courier New", family: "modern" })

// Configure footnote settings at the document level
builder.pageSetup({
  footnotePosition: "bottom", // Place footnotes at bottom of page
  footnoteNumbering: "lowercase", // Use lowercase letters (a, b, c) for footnotes
  endnoteNumbering: "upperRoman", // Use uppercase Roman numerals (I, II, III) for endnotes
  footnoteRestart: "continuous", // Continuous numbering throughout document
  footnoteStartNumber: 1,
})

// Create main section
builder.withSection((section) => {
  section.body.withTitle("RTF Footnotes & Endnotes Demo")
  section.body.withText("This document demonstrates the comprehensive footnote and endnote functionality in RTF documents.").closeParagraph()

  section.body.withHeading("1. Basic Footnotes", 1)
  section.body
    .withText("Footnotes are essential for academic and professional documents.")
    .withFootnote("They allow you to add references", "This is a simple auto-numbered footnote with Arabic numerals.")
    .withText(" and clarifications without interrupting the main text flow.")
    .closeParagraph()
  section.body
    .withFootnote("You can add multiple footnotes", "First footnote in this paragraph.")
    .withFootnote(" in a single paragraph", "Second footnote in this paragraph.")
    .withText(" to provide detailed annotations.")
    .closeParagraph()

  section.body.withHeading("2. Custom Footnote Marks", 1)
  section.body
    .newParagraph()
    .newChunk()
    .text("Sometimes you need custom marks instead of numbers")
    .withFootnote((f) => f.withText("This footnote uses a custom dagger symbol.").customMark("†"))
    .text(" for special purposes.")

  section.body.withHeading("3. Formatted Footnote Content", 1)
  section.body
    .withText("Footnotes can contain formatted text. ")
    .withFootnote(
      "This footnote contains",
      { bold: true },
      "bold text",
      {},
      ", ",
      { italic: true },
      "italic text",
      {},
      ", and ",
      { underline: true },
      "underlined text",
      {},
      "."
    )
    .withText(" various styles.")
    .closeParagraph()
  section.body
    .withFootnote(
      "They can also use different colors",
      { colorAlias: "red" },
      "This text is red",
      {},
      ", this is ",
      { colorAlias: "blue" },
      "blue",
      {},
      ", and this is normal."
    )
    .withFootnote(", and fonts", "This uses ", { fontAlias: "courier" }, "Courier font", {}, " mixed with ", { fontAlias: "times" }, "Times Roman", {}, ".")
    .withText(" for emphasis.")
    .closeParagraph()

  section.body.withHeading("4. Endnotes", 1)
  section.body
    .withEndnote("Endnotes appear at the end of the document", "This is an endnote that will appear at the document's end.")
    .withText(" rather than at the bottom of the page.")
    .closeParagraph()

  section.body.withHeading("5. Complex Footnote Content", 1)
  section.body
    .newParagraph()
    .newChunk()
    .text("Footnotes can contain complex content including line breaks")
    .withFootnote((f) =>
      f.withText(
        "First line of the footnote.",
        { special: "lineBreak" },
        { special: "tab" },
        "Second line of the footnote.",
        { special: "lineBreak" },
        { special: "tab" },
        "Third line with ",
        { bold: true },
        "formatting",
        {},
        "."
      )
    )
    .text(" and multiple paragraphs.")
})

export default builder
