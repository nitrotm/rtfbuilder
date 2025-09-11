import * as fs from "fs"
import { DocumentBuilder, pt, RTFCharacterFormatting } from "../lib"
import { RTFDocument } from "../lib/rtf"
import { RTF_DOCUMENT_VALIDATOR } from "../lib/validation"

// Parse command line arguments
const args = process.argv.slice(2)

// Check for help flag or missing argument
if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log("Usage: navigation.ts <output.rtf> [--validate]")
  console.log("  output.rtf: Path to output RTF file (required)")
  process.exit(args.length === 0 ? 1 : 0)
}

const outputFile = args[0]
const validator = args.includes("--validate") ? RTF_DOCUMENT_VALIDATOR : undefined

// Create content using the new builder pattern
const builder = new DocumentBuilder()

// Add colors for links and headings
builder.withColor("linkBlue", { red: 0, green: 0, blue: 255 })
builder.withColor("headingBlue", { red: 0, green: 0, blue: 139 })
builder.withColor("gray", { red: 100, green: 100, blue: 100 })

// Add fonts
builder.withFont("arial", { name: "Arial", family: "swiss" })
builder.withFont("courier", { name: "Courier New", family: "modern" })

const linkStyle: Partial<RTFCharacterFormatting> = { colorAlias: "linkBlue", underline: true }

// Create main section
builder.withSection((section) => {
  section.body.withTitle("RTF Navigation Demo: Hyperlinks & Bookmarks", "top")
  section.body.withText("This document demonstrates hyperlink and bookmark functionality in RTF documents.").closeParagraph()

  section.body.withHeading("Table of Contents", 1)
  section.body.withText("Click on any link below to jump to the corresponding section:").closeParagraph()
  section.body.withBookmarkLink("intro", "1. Introduction to Bookmarks", linkStyle).closeParagraph()
  section.body.withBookmarkLink("external", "2. External Links", linkStyle).closeParagraph()
  section.body.withBookmarkLink("email", "3. Email Links", linkStyle).closeParagraph()
  section.body.withBookmarkLink("files", "4. File Links", linkStyle).closeParagraph()
})

// Create new section for page break effect
builder.withSection((section) => {
  section.body.withHeading("1. Introduction to Bookmarks", 1, "intro")
  section.body
    .withText(
      "Bookmarks allow you to create navigation points within your RTF document. They work in conjunction with hyperlinks to enable readers to jump directly to specific sections."
    )
    .closeParagraph()

  section.body.withHeading("Key Features:", 2)
  section.body.withList((list) => {
    list.newItem().withText("Named anchors within the document")
    list.newItem().withText("Can be referenced by hyperlinks using #bookmarkname")
    list.newItem().withText("Invisible in the rendered document")
    list.newItem().withText("Supported by most RTF readers")
  })
  section.body.withBookmarkLink("top", "← Back to Table of Contents", linkStyle)
})

// Section 2: External Links
builder.withSection((section) => {
  section.body.withHeading("2. External Links", 1, "external")
  section.body
    .withText("RTF documents can contain hyperlinks to external resources such as websites, making them interactive and connected to online content.")
    .closeParagraph()

  section.body.withHeading("Web Links:", 2)
  section.body.withText("Visit ").withExternalLink("https://www.example.com", "Example.com", linkStyle).withText(" for more information.").closeParagraph()
  section.body.withBookmarkLink("top", "← Back to Table of Contents", linkStyle)
})

// Section 3: Email Links
builder.withSection((section) => {
  section.body.withHeading("3. Email Links", 1, "email")
  section.body.withText("RTF supports mailto links that open the default email client with pre-filled information.").closeParagraph()

  section.body.withHeading("Simple Email Link:", 2)
  section.body.withParagraph((p) =>
    p.withText("Contact us at ").withChunk((c) => c.emailLink("support@example.com").with(linkStyle).text("support@example.com"))
  )
  section.body.withHeading("Email with Subject:", 2)
  section.body.withParagraph((p) =>
    p.withText("Send feedback: ").withChunk((c) => c.emailLink("feedback@example.com", "RTF Document Feedback").with(linkStyle).text("feedback@example.com"))
  )
  section.body.withHeading("Email with Subject and Body:", 2)
  section.body.withParagraph((p) =>
    p.withChunk((c) => c.emailLink("info@example.com", "Question", 'Hello, I have a "question" about...').with(linkStyle).text("Send a pre-composed email"))
  )
  section.body.closeParagraph()
  section.body.withBookmarkLink("top", "← Back to Table of Contents", linkStyle)
})

// Section 4: File Links
builder.withSection((section) => {
  section.body.withHeading("4. File Links", 1, "files")
  section.body.withText("Link to local files or network resources (support varies by RTF reader).").closeParagraph()

  section.body.withHeading("Local File Examples:", 2)
  section.body
    .withText("• Open ")
    .withExternalLink("file://./simple.rtf", "Local Document", linkStyle)
    .withText(" (simple.rtf in current directory)")
    .closeParagraph()
  section.body.withHeading("Note:", 2)
  section.body
    .withText("File links may not work in all RTF readers due to security restrictions. Some readers may require user confirmation before opening local files.")
    .closeParagraph()
  section.body.withBookmarkLink("top", "← Back to Table of Contents", linkStyle)
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
