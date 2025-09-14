import { RichTextDocumentBuilder, inch, pt, RTFPictureData, readBase64 } from "../../lib"

const builder = new RichTextDocumentBuilder()

// Add some colors
builder.withColor("blue", { red: 0, green: 0, blue: 255 })
builder.withColor("darkgray", { red: 128, green: 128, blue: 128 })

// Sample png
const pictureData: RTFPictureData = {
  format: "png",
  data: readBase64(
    "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAY0lEQVQY032PMRKEMAwDV5CWgrs/8P/30SxFcsRHgceFJVkaO/JWDYjIcy3E72cBxJCnhqxr63hsRAAzwva9FYuY3zA5UCDhlu3ythW3M5xuP8/hTk28T0uWCUrNX6x9HP4zF5CFNasivtrxAAAAAElFTkSuQmCC"
  ),
  width: 10,
  height: 10,
}

// Create a new section
builder.withSection((section) => {
  section.body.withTitle("RTF Picture Demo")
  section.body.withText("This document demonstrates embedding pictures in RTF format.").closeParagraph()

  // Inline picture example
  section.body.withHeading("Inline Picture", 1)
  section.body
    .withText("Here is a small image embedded inline: ")
    .withPicture(pictureData, {
      displayWidth: pt(20),
      displayHeight: pt(20),
    })
    .withText(" within the text.")
    .closeParagraph()

  // Standalone picture with different sizes
  section.body.withHeading("Picture Sizing", 1)

  section.body
    .withText("Original size (10x10 pixels): ")
    .withPicture(pictureData, {
      displayWidth: pt(10),
      displayHeight: pt(10),
    })
    .closeParagraph()

  section.body
    .withText("Scaled to 1 inch: ")
    .withPicture(pictureData, {
      displayWidth: inch(1),
      displayHeight: inch(1),
    })
    .closeParagraph()

  section.body
    .withText("Scaled to 2 inches wide, 1 inch tall: ")
    .withPicture(pictureData, {
      displayWidth: inch(2),
      displayHeight: inch(1),
    })
    .closeParagraph()

  // Picture with scaling
  section.body.withHeading("Picture Scaling", 1)

  section.body
    .withText("50% scale: ")
    .withPicture(pictureData, {
      displayWidth: inch(1),
      displayHeight: inch(1),
      scaleX: 0.5,
      scaleY: 0.5,
    })
    .closeParagraph()

  section.body
    .withText("200% horizontal scale: ")
    .withPicture(pictureData, {
      displayWidth: inch(1),
      displayHeight: inch(1),
      scaleX: 2.0,
      scaleY: 1.0,
    })
    .closeParagraph()

  // Multiple pictures in a row
  section.body.withHeading("Multiple Pictures", 1)
  section.body.withText("Three images in a row: ")
  for (let i = 0; i < 3; i++) {
    if (i > 0) section.body.withText(" ")
    section.body.withPicture(pictureData, {
      displayWidth: pt(30),
      displayHeight: pt(30),
    })
  }
  section.body.closeParagraph()

  // Pictures in a table
  section.body.withHeading("Pictures in Tables", 1)
  section.body.withTable((t) => {
    t.column(0, inch(2))
    t.column(1, inch(2))
    t.column(2, inch(2))

    t.withHeaderRow((r) => {
      r.newCell().withText({ bold: true }, "Description")
      r.newCell().newParagraph().center().withText({ bold: true }, "Image")
      r.newCell().withText({ bold: true }, "Size")
    })

    t.withRow((r) => {
      r.newCell().withText("Small")
      r.newCell()
        .middle()
        .newParagraph()
        .center()
        .withPicture(pictureData, {
          displayWidth: pt(20),
          displayHeight: pt(20),
        })
      r.newCell().withText("20pt x 20pt")
    })

    t.withRow((r) => {
      r.newCell().withText("Medium")
      r.newCell()
        .middle()
        .newParagraph()
        .center()
        .withPicture(pictureData, {
          displayWidth: pt(40),
          displayHeight: pt(40),
        })
      r.newCell().withText("40pt x 40pt")
    })

    t.withRow((r) => {
      r.newCell().withText("Large")
      r.newCell()
        .middle()
        .newParagraph()
        .center()
        .withPicture(pictureData, {
          displayWidth: pt(60),
          displayHeight: pt(60),
        })
      r.newCell().withText("60pt x 60pt")
    })
  })

  // Centered picture
  section.body.withHeading("Centered Picture", 1)
  section.body
    .newParagraph()
    .center()
    .withPicture(pictureData, {
      displayWidth: inch(1.5),
      displayHeight: inch(1.5),
    })
})

export default builder
