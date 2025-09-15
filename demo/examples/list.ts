import { RichTextDocumentBuilder, pt } from "../../lib"

const builder = new RichTextDocumentBuilder()

// Setup colors for the demo
builder.withColor("blue", { red: 0, green: 0, blue: 139 })
builder.withColor("red", { red: 255, green: 0, blue: 0 })
builder.withColor("green", { red: 0, green: 128, blue: 0 })
builder.withColor("purple", { red: 128, green: 0, blue: 128 })
builder.withColor("orange", { red: 255, green: 165, blue: 0 })
builder.withColor("gray", { red: 128, green: 128, blue: 128 })

// Add fonts
builder.withFont("arial", { name: "Arial", family: "swiss" })
builder.withFont("times", { name: "Times New Roman", family: "roman" })
builder.withFont("courier", { name: "Courier New", family: "modern" })

// Create a new section
builder.withSection((section) => {
  section.body.withTitle("RTF Lists Demo")
  section.body.withText("This document demonstrates various types of lists and list formatting options available in RTF.").closeParagraph()

  section.body.withHeading("1. Simple Bullet Lists", 1)
  section.body.withText("A basic bulleted list with default formatting:").closeParagraph()
  section.body.withList((list) => {
    list.simple("bullet")
    list.newItem().withText("First item in the list")
    list.newItem().withText("Second item in the list")
    list.newItem().withText("Third item in the list")
    list.newItem().withText("Fourth item in the list")
  })
  section.body.withParagraph((p) => {
    p.spaceBefore(pt(12)).spaceAfter(pt(12))
    p.withText("A bulleted list with formatted text:")
  })
  section.body.withList((list) => {
    list.simple("decimal")
    list.newItem().withText({ bold: true }, "Bold item", {}, " with regular text")
    list.newItem().withText({ italic: true }, "Italic item", {}, " with regular text")
    list.newItem().withText("Item with ", { colorAlias: "blue" }, "colored text")
    list.newItem().withText("Item with ", { colorAlias: "red", bold: true }, "multiple", {}, " ", { italic: true, underline: true }, "formats")
  })

  section.body.withHeading("2. Nested Lists", 1)
  section.body.withText("Lists can be nested to create hierarchical structures:").closeParagraph()

  section.body.withList((list) => {
    list.withItem((item) => {
      item.withText("Top level item 1")
      item.withItem((subItem) => {
        subItem.withText("Second level item 1.1")
        subItem.withItem((subSubItem) => {
          subSubItem.withText("Third level item 1.1.1")
        })
        subItem.withItem((subSubItem) => {
          subSubItem.withText("Third level item 1.1.2")
        })
      })
      item.withItem((subItem) => {
        subItem.withText("Second level item 1.2")
      })
    })

    list.withItem((item) => {
      item.withText("Top level item 2")
      item.withItem((subItem) => {
        subItem.withText("Second level item 2.1")
      })
      item.withItem((subItem) => {
        subItem.withText("Second level item 2.2")
        subItem.withItem((subSubItem) => {
          subSubItem.withText("Third level item 2.2.1")
        })
      })
    })

    list.withItem((item) => item.withText("Top level item 3"))
  })
  section.body.withHeading("3. Mixed Content in List Items", 1)
  section.body.withText("List items can contain various types of content:").closeParagraph()

  section.body.withList((list) => {
    list.withItem((item) => {
      item.withText({ bold: true }, "Item with a paragraph")
      item
        .newParagraph()
        .withText(
          "This is a paragraph within a list item. It can contain multiple sentences and formatting. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        )
    })

    list.withItem((item) => {
      item.withText("Item with multiple paragraphs:")
      item.newParagraph().withText("First paragraph in the list item.")
      item.newParagraph().withText("Second paragraph in the list item.")
      item.newParagraph().withText("Third paragraph with ", { italic: true, colorAlias: "green" }, "formatted text")
    })

    list.withItem((item) => {
      item.withText("Item with a nested list and text:")
      item.newParagraph().withText("Some explanatory text before the nested list.")
      item.withItem((subItem) => subItem.withText("Nested item 1"))
      item.withItem((subItem) => subItem.withText("Nested item 2"))
      item.withItem((subItem) => subItem.withText("Nested item 3"))
      item.newParagraph().withText("Some text after the nested list.")
    })
  })

  section.body.withHeading("4. Complex Nested Structure", 1)
  section.body.withText("A more complex example showing multiple levels of nesting:").closeParagraph()

  section.body.withList((list) => {
    list.custom("decimal", "bullet", "decimal", "bullet", "decimal")

    list.withItem((item) => {
      item.withText({ bold: true, fontSize: pt(12) }, "Project Planning")

      item.withItem((sub1) => {
        sub1.withText({ bold: true }, "Requirements Analysis")
        sub1.newItem().withText("Gather stakeholder requirements")
        sub1.newItem().withText("Document functional specifications")
        sub1.newItem().withText("Create use cases")
        sub1.withItem((sub2) => {
          sub2.withText("Review and approval")
          sub2.newItem().withText("Internal review")
          sub2.newItem().withText("Stakeholder review")
          sub2.newItem().withText("Sign-off")
        })
      })

      item.withItem((sub1) => {
        sub1.withText({ bold: true }, "Design Phase")
        sub1.newItem().withText("System architecture")
        sub1.newItem().withText("Database design")
        sub1.newItem().withText("User interface mockups")
        sub1.newItem().withText("API specifications")
      })

      item.withItem((sub1) => {
        sub1.withText({ bold: true }, "Implementation")
        sub1.withItem((sub2) => {
          sub2.withText("Backend development")
          sub2.newItem().withText("Database setup")
          sub2.newItem().withText("API development")
          sub2.newItem().withText("Business logic")
        })
        sub1.withItem((sub2) => {
          sub2.withText("Frontend development")
          sub2.newItem().withText("UI components")
          sub2.newItem().withText("State management")
          sub2.newItem().withText("Integration")
        })
      })

      item.withItem((sub1) => {
        sub1.withText({ bold: true }, "Testing")
        sub1.newItem().withText("Unit testing")
        sub1.newItem().withText("Integration testing")
        sub1.newItem().withText("User acceptance testing")
      })
    })
  })

  section.body.withHeading("5. Lists with Different Formatting Styles", 1)
  section.body.withText("Lists with custom formatting and spacing:").closeParagraph()

  section.body.withText({ bold: true }, "Compact List:").closeParagraph()
  section.body.withList((list) => {
    list.withItem((item) => {
      item.withParagraph((p) => {
        p.spaceBefore(pt(2)).spaceAfter(pt(2))
        p.withText("Item 1 with minimal spacing")
      })
    })
    list.withItem((item) => {
      item.withParagraph((p) => {
        p.spaceBefore(pt(2)).spaceAfter(pt(2))
        p.withText("Item 2 with minimal spacing")
      })
    })
    list.withItem((item) => {
      item.withParagraph((p) => {
        p.spaceBefore(pt(2)).spaceAfter(pt(2))
        p.withText("Item 3 with minimal spacing")
      })
    })
  })

  section.body.withText({ bold: true }, "Spaced List:").closeParagraph()
  section.body.withList((list) => {
    list.withItem((item) => {
      item.withParagraph((p) => {
        p.spaceBefore(pt(8)).spaceAfter(pt(8))
        p.withText("Item 1 with more spacing")
      })
    })
    list.withItem((item) => {
      item.withParagraph((p) => {
        p.spaceBefore(pt(8)).spaceAfter(pt(8))
        p.withText("Item 2 with more spacing")
      })
    })
    list.withItem((item) => {
      item.withParagraph((p) => {
        p.spaceBefore(pt(8)).spaceAfter(pt(8))
        p.withText("Item 3 with more spacing")
      })
    })
  })

  section.body.withHeading("6. Lists with Long Content", 1)
  section.body.withText("Lists can contain lengthy items with multiple lines of text:").closeParagraph()

  section.body.withList((list) => {
    list
      .newItem()
      .withText(
        "This is a very long list item that contains multiple sentences. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      )
    list
      .newItem()
      .withText(
        "Another lengthy item with detailed information. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      )
    list.newItem().withText("A shorter item for contrast.")
    list
      .newItem()
      .withText(
        "Final long item: Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
      )
  })
})

export default builder
