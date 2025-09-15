import { RichTextDocumentBuilder, pt, inch } from "../../lib"

const builder = new RichTextDocumentBuilder()

// Setup colors for the demo
builder.withColor("red", { red: 255, green: 0, blue: 0 })
builder.withColor("blue", { red: 0, green: 0, blue: 255 })
builder.withColor("green", { red: 0, green: 128, blue: 0 })
builder.withColor("darkBlue", { red: 0, green: 0, blue: 139 })
builder.withColor("darkGray", { red: 64, green: 64, blue: 64 })
builder.withColor("lightGray", { red: 192, green: 192, blue: 192 })
builder.withColor("purple", { red: 128, green: 0, blue: 128 })
builder.withColor("orange", { red: 255, green: 165, blue: 0 })

// Add fonts for the demo
builder.withFont("arial", { name: "Arial", family: "swiss", pitch: "variable" })
builder.withFont("times", { name: "Times New Roman", family: "roman", pitch: "variable" })
builder.withFont("courier", { name: "Courier New", family: "modern", pitch: "fixed" })

// Define styles
builder.withStyle("normal", {
  type: "paragraph",
  name: "RTF - Default",
  characterFormatting: {
    fontAlias: "arial",
    fontSize: pt(12),
  },
  paragraphFormatting: {
    spaceBefore: pt(5),
    spaceAfter: pt(5),
  },
})

builder.withStyle("heading1", {
  type: "paragraph",
  baseStyleAlias: "normal",
  nextStyleAlias: "normal",
  name: "RTF - Heading 1",
  characterFormatting: {
    fontAlias: "arial",
    fontSize: pt(18),
    bold: true,
    colorAlias: "darkBlue",
  },
  paragraphFormatting: {
    align: "center",
    spaceBefore: pt(12),
    spaceAfter: pt(6),
    borders: {
      bottom: {
        style: "single",
        width: pt(1),
        colorAlias: "darkBlue",
        spacing: pt(1),
      },
    },
  },
})

builder.withStyle("heading2", {
  type: "paragraph",
  baseStyleAlias: "normal",
  nextStyleAlias: "normal",
  name: "RTF - Heading 2",
  characterFormatting: {
    fontAlias: "arial",
    fontSize: pt(14),
    bold: true,
    colorAlias: "darkGray",
  },
  paragraphFormatting: {
    align: "left",
    spaceBefore: pt(12),
    spaceAfter: pt(3),
    leftIndent: pt(0),
    firstLineIndent: pt(0),
  },
})

builder.withStyle("codeBlock", {
  type: "paragraph",
  baseStyleAlias: "normal",
  nextStyleAlias: "normal",
  name: "RTF - Code Block",
  characterFormatting: {
    fontAlias: "courier",
    fontSize: pt(10),
    colorAlias: "green",
  },
  paragraphFormatting: {
    align: "left",
    leftIndent: inch(0.5),
    spaceBefore: pt(6),
    spaceAfter: pt(6),
    borders: {
      left: {
        style: "single",
        width: pt(2),
        colorAlias: "lightGray",
        spacing: pt(3),
      },
    },
    backgroundColorAlias: "lightGray",
  },
})

builder.withStyle("quote", {
  type: "paragraph",
  baseStyleAlias: "normal",
  nextStyleAlias: "normal",
  name: "RTF - Quote",
  characterFormatting: {
    fontAlias: "times",
    fontSize: pt(11),
    italic: true,
    colorAlias: "darkGray",
  },
  paragraphFormatting: {
    align: "justify",
    leftIndent: inch(0.75),
    rightIndent: inch(0.25),
    spaceBefore: pt(6),
    spaceAfter: pt(6),
    borders: {
      left: {
        style: "single",
        width: pt(3),
        colorAlias: "orange",
        spacing: pt(6),
      },
    },
  },
})

builder.withStyle("emphasis", {
  type: "character",
  name: "RTF - Emphasis",
  characterFormatting: {
    italic: true,
    colorAlias: "purple",
    underline: true,
  },
})

builder.withStyle("code", {
  type: "character",
  name: "RTF - Code",
  characterFormatting: {
    fontAlias: "courier",
    fontSize: pt(10),
    colorAlias: "green",
  },
})

// Create the document
builder.withSection((section) => {
  // Title using heading1 style
  section.body.withParagraph((p) => {
    p.style("heading1").withText("RTF Styles Demonstration")
  })

  // Introduction paragraph
  section.body.withParagraph((p) => {
    p.withText("This document demonstrates various RTF styles including paragraph styles, character styles, and formatting options.")
  })

  // Heading 2 example
  section.body.withParagraph((p) => {
    p.style("heading2").withText("Character Styles")
  })

  // Character style examples
  section.body.withParagraph((p) => {
    p.withText("Regular text can be enhanced with ")
      .withChunk((c) => {
        c.style("emphasis").text("emphasized text")
      })
      .withText(" and ")
      .withChunk((c) => {
        c.style("code").text("inline code")
      })
      .withText(" for better readability.")
  })

  // Code block example
  section.body.withParagraph((p) => {
    p.style("heading2").withText("Code Blocks")
  })

  section.body.withParagraph((p) => {
    p.withText("Code blocks are useful for displaying programming examples:")
  })

  section.body.withParagraph((p) => {
    p.style("codeBlock").withText("function generateRTF(document) {\\line  return document.build();\\line}")
  })

  // Quote example
  section.body.withParagraph((p) => {
    p.style("heading2").withText("Block Quotes")
  })

  section.body.withParagraph((p) => {
    p.withText("Quotes can be styled with special formatting:")
  })

  section.body.withParagraph((p) => {
    p.style("quote").withText(
      "The best way to predict the future is to create it. This quote demonstrates how paragraph styles can transform the appearance of text with borders, shading, indentation, and typography changes."
    )
  })

  // Mixed formatting example
  section.body.withParagraph((p) => {
    p.style("heading2").withText("Mixed Formatting")
  })

  section.body.withParagraph((p) => {
    p.withText("Styles can be combined with manual formatting. For example, ")
      .withChunk((c) => {
        c.style("emphasis").bold().text("bold emphasized text")
      })
      .withText(" or ")
      .withChunk((c) => {
        c.style("code").color("red").text("red code text")
      })
      .withText(".")
  })
})

export default builder
