import { RichTextDocumentBuilder, pt, mm, inch } from "../../lib"

const builder = new RichTextDocumentBuilder()

// Setup colors for the demo
builder.withColor("blue", { red: 0, green: 0, blue: 139 })
builder.withColor("gray", { red: 128, green: 128, blue: 128 })
builder.withColor("lightGray", { red: 200, green: 200, blue: 200 })
builder.withColor("red", { red: 255, green: 0, blue: 0 })
builder.withColor("green", { red: 0, green: 128, blue: 0 })

// Add fonts
builder.withFont("arial", { name: "Arial", family: "swiss" })
builder.withFont("times", { name: "Times New Roman", family: "roman" })

// Set page setup before creating sections
builder.pageSetup({
  paperWidth: mm(210), // A4 width
  paperHeight: mm(297), // A4 height
  margin: {
    top: inch(1),
    right: inch(1),
    bottom: inch(1),
    left: inch(1),
  },
  facingPages: true,
})

// ==============================
// Section 1: Basic Section with Headers and Footers
// ==============================
builder.withSection((section) => {
  section.titlePage().columns(1).columnSpacing(pt(0))

  // First page header
  section.firstHeader.withParagraph((p) => {
    p.center()
    p.border("bottom", { width: pt(1), colorAlias: "blue" })
    p.spaceAfter(pt(12))
    p.withText({ bold: true, fontSize: pt(14) }, "RTF Sections Demo", { special: "lineBreak" }, { italic: true, fontSize: pt(10) }, "First Page Header")
  })

  // First page footer
  section.firstFooter.withParagraph((p) => {
    p.center()
    p.border("top", { width: pt(1), colorAlias: "blue" })
    p.spaceBefore(pt(12))
    p.withText({ fontSize: pt(10) }, "Document Created: ", { special: "date" }, " at ", { special: "time" })
  })

  // Header and Footer for other pages in section 1
  section.header.withText({ italic: true }, "Section 1 Header - Page ", { special: "pageNumber" })
  section.footer.withText("Section 1 Footer - Page ", { special: "pageNumber" }, " of ", { special: "totalPages" })

  section.body.withTitle("Section 1: Basic Section with first page Headers and Footers").closeParagraph()

  for (let i = 1; i <= 3; i++) {
    section.body.withHeading(`Subsection 1.${i}`, 2, undefined, (p) => {
      if (i > 1) p.flags("pageBreakBefore")
    })
    section.body
      .withText(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
      )
      .closeParagraph()
  }
})

// ==============================
// Section 2: Two-Column Layout
// ==============================
builder.withSection((section) => {
  // Configure section for two columns
  section.columns(2).columnSpacing(pt(24)).with({ lineBetweenColumns: true })

  // Header for section 2
  section.header.withParagraph((p) => {
    p.center()
    p.border("bottom", { width: pt(2), colorAlias: "green" })
    p.spaceAfter(pt(12))
    p.withText({ bold: true }, "Section 2: Multi-Column Layout")
  })

  // Footer for section 2
  section.footer.withParagraph((p) => {
    p.center()
    p.border("top", { width: pt(1), colorAlias: "green" })
    p.spaceBefore(pt(12)).spaceAfter(pt(0))
    p.withText("Page ", { special: "pageNumber" }, " - Two Column Layout")
  })

  // Content for Section 2
  section.body.withTitle("Section 2: Two-Column Layout")
  section.body
    .withText(
      "This section demonstrates a two-column layout. ",
      "The text flows from the left column to the right column automatically. ",
      "A vertical line separates the columns for clarity."
    )
    .closeParagraph()

  section.body.withHeading("Benefits of Multi-Column Layouts", 2)
  section.body.withText("Multi-column layouts are useful for:").closeParagraph()
  section.body.withList((list) => {
    list.newItem().withText("Newsletters and magazines")
    list.newItem().withText("Academic papers")
    list.newItem().withText("Brochures and flyers")
    list.newItem().withText("Maximizing space usage")
    list.newItem().withText("Improving readability for narrow columns")
  })
  section.body
    .withText(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
    )
    .closeParagraph()

  section.body.columnBreak()

  section.body.withHeading("Column Breaks", 2)
  section.body
    .withText(
      "You can force content to move to the next column using column breaks. ",
      "This text appears in the right column because we inserted a column break."
    )
    .closeParagraph()
  section.body
    .withText(
      "Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor dignissim convallis aenean et tortor at. At urna condimentum mattis pellentesque id nibh. Laoreet id donec ultrices tincidunt arcu non sodales neque."
    )
    .closeParagraph()
})

// ==============================
// Section 3: Landscape Orientation
// ==============================
builder.withSection((section) => {
  // Configure section for landscape orientation
  section.landscape().margin({
    top: inch(0.75),
    right: inch(0.75),
    bottom: inch(0.75),
    left: inch(0.75),
  })

  // Header for landscape section
  section.header.withParagraph((p) => {
    p.right()
    p.withText({ italic: true }, "Section 3: Landscape Orientation", {}, " - Page ", { special: "pageNumber" })
  })

  // Footer for landscape section
  section.footer.withParagraph((p) => {
    p.center()
    p.border("top", { width: pt(1) })
    p.spaceBefore(pt(12))
    p.withText("Landscape Layout Demo")
  })

  // Content for Section 3
  section.body.withTitle("Section 3: Landscape Orientation")
  section.body.withText("This section is in landscape orientation, which is useful for wide tables, charts, or diagrams.").closeParagraph()

  section.body.withHeading("Wide Table Example", 2)
  section.body.withTable((table) => {
    table.border("all", { width: pt(1) })
    table.cellPadding({ top: pt(5), right: pt(8), bottom: pt(5), left: pt(8) })

    // Header row
    table.withHeaderRow((row) => {
      for (let i = 1; i <= 8; i++) {
        row.withCell((cell) => cell.withText({ bold: true }, `Column ${i}`))
      }
    })

    // Data rows
    for (let r = 1; r <= 5; r++) {
      table.withRow((row) => {
        for (let c = 1; c <= 8; c++) {
          row.withCell((cell) => cell.withText(`Data ${r}-${c}`))
        }
      })
    }
  })
  section.body.withText("Landscape orientation provides more horizontal space for content that requires it.").closeParagraph()
})

// ==============================
// Section 4: Different Odd/Even Headers and Footers
// ==============================
builder.withSection((section) => {
  // Configure section with different odd/even pages
  // Note: differentOddEven is determined by whether even headers/footers are defined

  // Odd page header (right pages in book layout)
  section.header.withParagraph((p) => {
    p.right()
    p.border("bottom", { width: pt(1), colorAlias: "blue" })
    p.spaceAfter(pt(12))
    p.withText({ bold: true }, "Chapter 4: Mirror Margins", {}, " - ", { special: "pageNumber" })
  })

  // Even page header (left pages in book layout)
  section.evenHeader.withParagraph((p) => {
    p.left()
    p.border("bottom", { width: pt(1), colorAlias: "blue" })
    p.spaceAfter(pt(12))
    p.withText({ special: "pageNumber" }, " - ", { bold: true }, "RTF Section Demo")
  })

  // Odd page footer
  section.footer.withParagraph((p) => {
    p.right()
    p.border("top", { width: pt(1), colorAlias: "lightGray" })
    p.spaceBefore(pt(12))
    p.withText({ italic: true, fontSize: pt(9) }, "Odd Page Footer")
  })

  // Even page footer
  section.evenFooter.withParagraph((p) => {
    p.left()
    p.border("top", { width: pt(1), colorAlias: "lightGray" })
    p.spaceBefore(pt(12))
    p.withText({ italic: true, fontSize: pt(9) }, "Even Page Footer")
  })

  // Content for Section 4
  section.body.withTitle("Section 4: Different Odd/Even Pages")
  section.body
    .withText(
      "This section demonstrates different headers and footers for odd and even pages. ",
      "This is commonly used in book layouts where left and right pages have mirrored layouts."
    )
    .closeParagraph()

  section.body.withHeading("Mirror Margins", 2)
  section.body
    .withText(
      "In professional publishing, odd pages (right-hand pages) and even pages (left-hand pages) often have different layouts. The headers and footers are positioned differently to create a balanced appearance when the book is open."
    )
    .closeParagraph()

  // Add content to show multiple pages
  for (let i = 1; i <= 4; i++) {
    section.body.withHeading(`Page ${i} Content`, 2, undefined, (p) => {
      if (i > 1) p.flags("pageBreakBefore")
    })
    section.body
      .withText(
        `This is page ${i}. Notice how the header and footer change between odd and even pages. `,
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      )
      .closeParagraph()
  }
})

export default builder
