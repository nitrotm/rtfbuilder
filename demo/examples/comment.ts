import { RichTextDocumentBuilder } from "../../lib"

const builder = new RichTextDocumentBuilder()

// Add some colors for styling
builder.withColor("blue", { red: 0, green: 100, blue: 200 })
builder.withColor("green", { red: 0, green: 150, blue: 0 })

builder.withSection((section) => {
  section.body.withTitle("Comments Example")

  section.body.withText("This document demonstrates how to add comments to text in RTF documents.").closeParagraph()

  // Example 1: Basic comment
  section.body.withParagraph((p) => {
    p.withText("Here is some text with a ")
    p.withChunk((chunk) => {
      chunk.with({ bold: true }).text("commented word")
      chunk.comment.author("John Doe").timestamp(new Date("2024-01-15T10:30:00")).withText("This is a simple comment.")
    })
    p.withText(".")
  })

  section.body.withText("").closeParagraph() // Empty paragraph for spacing

  // Example 2: Comment with formatting
  section.body.withParagraph((p) => {
    p.withText("This paragraph has a ")
    p.withChunk((chunk) => {
      chunk.with({ colorAlias: "blue" }).text("formatted comment")
      chunk.comment
        .author("Jane Smith")
        .timestamp(new Date("2024-02-20T14:45:00"))
        .withText({ bold: true }, "Important:", {}, " This comment contains ", { italic: true }, "formatted text", {}, ".")
    })
    p.withText(" attached to it.")
  })

  section.body.withText("").closeParagraph()

  // Example 3: Comment with hyperlink
  section.body.withParagraph((p) => {
    p.withText("Comments can also contain ")
    p.withChunk((chunk) => {
      chunk.with({ bold: true, colorAlias: "green" }).text("hyperlinks")
      chunk.comment
        .author("Bob Wilson")
        .timestamp(new Date("2024-03-10T09:15:00"))
        .withChunk((c) => {
          c.externalLink("https://example.com").with({ underline: true, colorAlias: "blue" }).text("example.com")
        })
    })
    p.withText(" for reference.")
  })

  section.body.withText("").closeParagraph()

  // Example 4: Multiple hyperlinks in a comment
  section.body.withParagraph((p) => {
    p.withText("You can also have ")
    p.withChunk((chunk) => {
      chunk.text("multiple links in comments")
      chunk.comment
        .author("Alice Johnson")
        .timestamp(new Date("2024-04-05T16:20:00"))
        .withText("Related resources: ")
        .withChunk((c) => {
          c.externalLink("https://github.com").with({ underline: true, colorAlias: "blue" }).text("GitHub")
        })
        .withText(" and ")
        .withChunk((c) => {
          c.externalLink("https://stackoverflow.com").with({ underline: true, colorAlias: "blue" }).text("Stack Overflow")
        })
        .withText(" are great development resources.")
    })
    p.withText(".")
  })
})

export default builder
