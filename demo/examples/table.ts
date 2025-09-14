import { RichTextDocumentBuilder, pt, mm, inch } from "../../lib"

const builder = new RichTextDocumentBuilder()

// Setup colors for the demo
builder.withColor("darkBlue", { red: 0, green: 0, blue: 139 })
builder.withColor("lightGray", { red: 220, green: 220, blue: 220 })
builder.withColor("darkGray", { red: 128, green: 128, blue: 128 })
builder.withColor("green", { red: 0, green: 128, blue: 0 })
builder.withColor("red", { red: 255, green: 0, blue: 0 })
builder.withColor("yellow", { red: 255, green: 255, blue: 0 })

// Add fonts
builder.withFont("arial", { name: "Arial", family: "swiss" })
builder.withFont("courier", { name: "Courier New", family: "modern" })

// Create a new section
builder.withSection((section) => {
  // Title
  section.body.withTitle("RTF Table Features Demo")

  // Section 1: Basic Table
  section.body.withHeading("1. Basic Table", 1)
  section.body.withText("A simple table with headers and data:").closeParagraph()
  section.body.withTable((table) => {
    table.withHeaderRow((row) => {
      row.withCell((cell) => cell.withText({ bold: true }, "Name"))
      row.withCell((cell) => cell.withText({ bold: true }, "Age"))
      row.withCell((cell) => cell.withText({ bold: true }, "City"))
    })

    table.withRow((row) => {
      row.withCell((cell) => cell.withText("Alice"))
      row.withCell((cell) => cell.withText("30"))
      row.withCell((cell) => cell.withText("New York"))
    })

    table.withRow((row) => {
      row.withCell((cell) => cell.withText("Bob"))
      row.withCell((cell) => cell.withText("25"))
      row.withCell((cell) => cell.withText("Los Angeles"))
    })
  })

  // Section 2: Table with Borders
  section.body.withHeading("2. Table with Borders", 1)
  section.body.withText("Tables can have various border styles:").closeParagraph()
  section.body.withTable((table) => {
    table.cellBorder("all", { width: pt(1) })
    table.cellPadding({ top: pt(5), right: pt(5), bottom: pt(5), left: pt(5) })
    table.column(2, undefined, 2)

    table.withHeaderRow((row) => {
      row.cellBorder("bottom", { width: pt(2), colorAlias: "darkBlue" })
      row.withCell((cell) => cell.withText({ bold: true }, "Product"))
      row.withCell((cell) => cell.withText({ bold: true }, "Price"))
      row.withCell((cell) => cell.withText({ bold: true }, "Stock"))
    })

    table.withRow((row) => {
      row.withCell((cell) => cell.withText("Laptop"))
      row.withCell((cell) => cell.withText("$999"))
      row.withCell((cell) => cell.withText("15"))
    })

    table.withRow((row) => {
      row.withCell((cell) => cell.withText("Mouse"))
      row.withCell((cell) => cell.withText("$29"))
      row.withCell((cell) => cell.withText("50"))
    })
  })

  // Section 3: Cell Borders and Shading
  section.body.withHeading("3. Cell Borders and Shading", 1)
  section.body.withText("Individual cells can have custom borders and shading:").closeParagraph()
  section.body.withTable((table) => {
    table.cellPadding({ top: pt(8), right: pt(8), bottom: pt(8), left: pt(8) })

    table.withRow((row) => {
      row.withCell((cell) => {
        cell.border("all", { width: pt(2), colorAlias: "red" })
        cell.withText("Dotted Red Border")
      })

      row.withCell((cell) => {
        cell.border("all", { width: pt(1), colorAlias: "green", style: "dashed" })
        cell.shading(0.2) // 20% gray shading
        cell.withText("Dashed Green + Shading")
      })

      row.withCell((cell) => {
        cell.border("all", { width: pt(3), colorAlias: "darkBlue" })
        cell.withText("Double Blue Border")
      })
    })

    table.withRow((row) => {
      row.withCell((cell) => {
        cell.shading(0.5) // 50% gray shading
        cell.withText("50% Gray Shading")
      })

      row.withCell((cell) => {
        cell.shading(0.75) // 75% gray shading
        cell.withText("75% Gray Shading")
      })

      row.withCell((cell) => {
        cell.shading(1.0, "yellow") // Yellow background
        cell.withText("Yellow Background")
      })
    })
  })

  // Section 4: Cell Alignment
  section.body.withHeading("4. Cell Alignment", 1)
  section.body.withText("Cells can have different horizontal alignments:").closeParagraph()
  section.body.withTable((table) => {
    table.cellBorder("all", { width: pt(1) })
    table.cellPadding({ top: pt(10), right: pt(10), bottom: pt(10), left: pt(10) })

    table.withRow((row) => {
      row.withCell((cell) => {
        cell.newParagraph().left().withText("Left Aligned")
      })

      row.withCell((cell) => {
        cell.newParagraph().center().withText("Center Aligned")
      })

      row.withCell((cell) => {
        cell.newParagraph().right().withText("Right Aligned")
      })
    })
  })
  section.body.withText("Cells can have different vertical alignments:").closeParagraph()
  section.body.withTable((table) => {
    table.cellBorder("all", { width: pt(1) })
    table.cellPadding({ top: pt(10), right: pt(10), bottom: pt(10), left: pt(10) })

    table.withRow((row) => {
      row.height(mm(20)) // Set row height to 20mm

      row.withCell((cell) => {
        cell.valign("top")
        cell.withText("Top Aligned")
      })

      row.withCell((cell) => {
        cell.valign("center")
        cell.withText("Center Aligned")
      })

      row.withCell((cell) => {
        cell.valign("bottom")
        cell.withText("Bottom Aligned")
      })
    })
  })

  // Section 5: Cell Merging
  section.body.withHeading("5. Cell Merging", 1)
  section.body.withText("Cells can be merged horizontally and vertically:").closeParagraph()
  section.body.withTable((table) => {
    table.cellBorder("all", { width: pt(1) })
    table.cellPadding({ top: pt(5), right: pt(5), bottom: pt(5), left: pt(5) })

    // Row 1: Horizontal merge
    table.withRow((row) => {
      row.withCell((cell) => {
        cell.hspan("first")
        cell.withText({ bold: true }, "Merged Horizontally")
      })
      row.withCell((cell) => {
        cell.hspan("next")
      })
      row.withCell((cell) => {
        cell.withText("Regular Cell")
      })
    })

    // Row 2: Start vertical merge
    table.withRow((row) => {
      row.withCell((cell) => {
        cell.vspan("first")
        cell.withText("Merged Vertically")
      })
      row.withCell((cell) => {
        cell.withText("Cell 2-2")
      })
      row.withCell((cell) => {
        cell.withText("Cell 2-3")
      })
    })

    // Row 3: Continue vertical merge
    table.withRow((row) => {
      row.withCell((cell) => {
        cell.vspan("next")
      })
      row.withCell((cell) => {
        cell.withText("Cell 3-2")
      })
      row.withCell((cell) => {
        cell.withText("Cell 3-3")
      })
    })
  })

  // Section 6: Complex Table Layout
  section.body.withHeading("6. Complex Table Layout", 1)
  section.body.withText("A complex table combining multiple features:").closeParagraph()
  section.body.withTable((table) => {
    table.cellBorder("all", { width: pt(1), colorAlias: "darkGray" })
    table.cellPadding({ top: pt(8), right: pt(8), bottom: pt(8), left: pt(8) })

    // Header row with merged cells
    table.withHeaderRow((row) => {
      row.cellBorder("bottom", { width: pt(2), colorAlias: "darkBlue" })
      row.height(pt(30))

      row.withCell((cell) => {
        cell.hspan("first")
        cell.valign("center")
        cell.shading(0.9, undefined, "lightGray")
        cell.withText({ bold: true, fontSize: pt(14) }, "Sales Report Q4 2024")
      })
      row.withCell((cell) => {
        cell.hspan("next")
      })
      row.withCell((cell) => {
        cell.hspan("next")
      })
      row.withCell((cell) => {
        cell.hspan("next")
      })
    })

    // Sub-header row
    table.withRow((row) => {
      row.cellBorder("bottom", { width: pt(1) })

      row.withCell((cell) => {
        cell.withText({ bold: true }, "Region")
      })
      row.withCell((cell) => {
        cell.withText({ bold: true }, "Product")
      })
      row.withCell((cell) => {
        cell.withText({ bold: true }, "Units Sold")
      })
      row.withCell((cell) => {
        cell.withText({ bold: true }, "Revenue")
      })
    })

    // Data rows with alternating shading
    table.withRow((row) => {
      row.cellShading(0.1) // Light row shading

      row.withCell((cell) => {
        cell.vspan("first")
        cell.withText({ bold: true }, "North America")
      })
      row.withCell((cell) => {
        cell.withText("Laptops")
      })
      row.withCell((cell) => {
        cell.withText("1,250")
      })
      row.withCell((cell) => {
        cell.withText({ colorAlias: "green" }, "$1,248,750")
      })
    })

    table.withRow((row) => {
      row.withCell((cell) => {
        cell.vspan("next")
      })
      row.withCell((cell) => {
        cell.withText("Tablets")
      })
      row.withCell((cell) => {
        cell.withText("850")
      })
      row.withCell((cell) => {
        cell.withText({ colorAlias: "green" }, "$425,000")
      })
    })

    table.withRow((row) => {
      row.cellShading(0.1) // Light row shading

      row.withCell((cell) => {
        cell.vspan("first")
        cell.withText({ bold: true }, "Europe")
      })
      row.withCell((cell) => {
        cell.withText("Laptops")
      })
      row.withCell((cell) => {
        cell.withText("980")
      })
      row.withCell((cell) => {
        cell.withText({ colorAlias: "green" }, "$979,020")
      })
    })

    table.withRow((row) => {
      row.withCell((cell) => {
        cell.vspan("next")
      })
      row.withCell((cell) => {
        cell.withText("Tablets")
      })
      row.withCell((cell) => {
        cell.withText("650")
      })
      row.withCell((cell) => {
        cell.withText({ colorAlias: "green" }, "$325,000")
      })
    })

    // Total row
    table.withRow((row) => {
      row.cellBorder("top", { width: pt(2) })
      row.cellShading(0.5, undefined, "lightGray")

      row.withCell((cell) => {
        cell.hspan("first")
        cell.withText({ bold: true }, "Total")
      })
      row.withCell((cell) => {
        cell.hspan("next")
      })
      row.withCell((cell) => {
        cell.withText({ bold: true }, "3,730")
      })
      row.withCell((cell) => {
        cell.withText({ bold: true, colorAlias: "darkBlue" }, "$2,977,770")
      })
    })
  })

  // Section 7: Table Width and Alignment
  section.body.withHeading("7. Table Width and Alignment", 1)
  section.body.withText("Left-aligned table:").closeParagraph()
  section.body.withTable((table) => {
    table.align("left")
    table.cellBorder("all", { width: pt(1) })
    table.width(inch(3))

    table.withRow((row) => {
      row.withCell((cell) => cell.withText("Left 1"))
      row.withCell((cell) => cell.withText("Left 2"))
    })
  })
  section.body.withText("Center-aligned table:").closeParagraph()
  section.body.withTable((table) => {
    table.align("center")
    table.cellBorder("all", { width: pt(1) })
    table.width(inch(3))

    table.withRow((row) => {
      row.withCell((cell) => cell.withText("Center 1"))
      row.withCell((cell) => cell.withText("Center 2"))
    })
  })
  section.body.withText("Right-aligned table:").closeParagraph()
  section.body.withTable((table) => {
    table.align("right")
    table.cellBorder("all", { width: pt(1) })
    table.width(inch(3))

    table.withRow((row) => {
      row.withCell((cell) => cell.withText("Right 1"))
      row.withCell((cell) => cell.withText("Right 2"))
    })
  })

  // Section 8: Row Properties
  section.body.withHeading("8. Row Properties", 1)
  section.body.withText("Rows can have special properties:").closeParagraph()
  section.body.withTable((table) => {
    table.cellBorder("all", { width: pt(1) })

    // Header row that repeats on new pages
    table.withHeaderRow((row) => {
      row.flags("keepTogether") // Keep row together on one page
      row.withCell((cell) => cell.withText({ bold: true }, "This header repeats"))
      row.withCell((cell) => cell.withText({ bold: true }, "on each page"))
    })

    // Regular rows
    for (let i = 1; i <= 5; i++) {
      table.withRow((row) => {
        // Note: pageBreakBefore might not be available in row context
        row.withCell((cell) => cell.withText(`Row ${i}`))
        row.withCell((cell) => cell.withText(`Data ${i}`))
      })
    }
  })
})

export default builder
