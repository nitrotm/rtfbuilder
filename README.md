# RTF Builder

[![npm](https://img.shields.io/npm/v/rtfbuilder.svg)](https://www.npmjs.com/package/rtfbuilder)

A modern JavaScript library for creating Rich Text Format (RTF/DOCX) documents using an intuitive builder pattern.

## Introduction

This project germinated due to a lack of library options with typescript support to generate RTF/DOCX documents directly from a web browser. The goal is to be able
to export a simple document - think markdown or similar - to an office compatible format with a bit of control on the styling.

Here is a list of supported features:

- Document structure: sections with header/footer, tables, lists, paragraphs.
- Navigation: bookmarks, hyperlinks, footnotes.
- Basic picture support.

The library is built around a document builder using fluent patterns to programmatically compose the document, a document model to represent the document state
and a renderer to output into the target format. There's also a validator which can check that the document instance is well-formed (optional).

## Roadmap

The library seems stable enough for some serious usage at this point. Ensuring the library is bug-free is a priority.

Then, there is plenty of room for improvements and additional features; contributions are welcome.

- [ ] Battle testing the document builder interface and ironing out discrepancies (`~v0.9`)
- [ ] Refining the renderer to have maximum compatibility with popular text editors (`~v1.0`)
- [ ] A module to convert a markdown file to RTF (maybe using micromark?)
- [ ] A renderer for OOXML (but only for cross-compatible features with RTF)
- [ ] Implementation of common RTF constructs
  - [ ] comments
  - [ ] custom tab markers
  - [ ] picture/shape with text flow
  - [ ] positioned frame

## Alternatives

You may be interested in other projects that I stumbled upon:

- [jsrtf](https://github.com/lilliputten/jsrtf) based upon [node-rtf](https://github.com/jrowny/node-rtf) based upon rtlflex?
- [html-to-rtf](https://github.com/oziresrds/html-to-rtf)

## Installation

```bash
yarn add rtfbuilder
```

## Quick Start

```typescript
import { RichTextDocumentBuilder, pt } from "rtfbuilder";
import { RTFDocument } from "rtfbuilder/rtf";

// Create a document builder
const builder = new RichTextDocumentBuilder();

// Add colors and fonts
builder.withColor("red", { red: 255, green: 0, blue: 0 });

// Create content
builder.withSection((section) => {
  // Add a title
  section.body.withTitle("My Document");

  // Add a paragraph with mixed formatting
  section.body.withText("Here is some ", { bold: true, colorAlias: "red" }, "bold red text", {}, " and some regular text.");

  // Add a simple table
  section.body.withSimpleTable(["Header 1", "Header 2"], [["Row 1 Col 1", "Row 1 Col 2"]]);
});

// Generate RTF content (into a string)
console.log(builder.buildInto(new RTFDocument()).render());
```

To output to DOCX ([ECMA-376](https://ecma-international.org/publications-and-standards/standards/ecma-376/)), replace the last line by:

```typescript
import { OOXMLDocument } from "rtfbuilder/ooxml";

const zipData = builder.buildInto(new OOXMLDocument()).render();
```

## API Reference

### Document Builder

The `RichTextDocumentBuilder` class provides the main entry point for creating RTF documents:

```typescript
const builder = new RichTextDocumentBuilder();

// Document metadata
builder.info({ title: "My Document", author: "John Doe" });

// Page setup
builder.pageSetup({
  paperWidth: mm(210), // A4 width
  paperHeight: mm(297), // A4 height
  margin: { top: mm(20), right: mm(20), bottom: mm(20), left: mm(20) },
});

// Add resources
builder.withColor("blue", { red: 0, green: 0, blue: 255 });
builder.withFont("times", { name: "Times New Roman", family: "roman" });
```

### Text Formatting

Add formatted text using the fluent API:

```typescript
section.body.withText(
  "Normal text ",
  { bold: true },
  "bold text ",
  {},
  ", normal again, ",
  { underline: true, fontAlias: "times", fontSize: pt(14) },
  "large underlined text",
);
```

### Tables

Create tables with rich formatting:

```typescript
section.body.withTable((table) => {
  // Table-level formatting
  table.cellBorder("all", { width: pt(1), colorAlias: "black" });
  table.cellPadding({ top: pt(5), right: pt(5), bottom: pt(5), left: pt(5) });

  // Header row
  table.withHeaderRow((row) => {
    row.newCell().withText({ bold: true }, "Header 1");
    // or:
    row.withCell((cell) => cell.withText({ bold: true }, "Header 2"));
  });

  // Data rows
  table.withRow((row) => {
    row.newCell().withText("Data 1");
    row.withCell((cell) => {
      cell.shading(0.2); // Light gray background
      cell.withText("Shaded cell");
    });
  });
});
```

### Lists

Create bulleted or numbered lists:

```typescript
section.body.withList((list) => {
  list.simple("bullet"); // or 'decimal', 'lowerRoman', etc.

  list.withItem((item) => item.withText("First item"));
  list.withItem((item) => {
    item.withText("Second item with nested list");
    item.withItem((nested) => nested.withText("Nested item"));
  });
});
```

### Advanced Features

#### Footnotes and Endnotes

```typescript
section.body.withFootnote("Text with footnote", "This is a footnote");
```

#### Hyperlinks and bookmarks

```typescript
section.body.withTitle("Example", "section1");
section.body.withBookmarkLink("section1", "Go to Section 1").closeParagraph();
section.body.withExternalLink("https://example.com", "Visit Example").closeParagraph();
```

#### Headers and Footers

```typescript
section.header.withParagraph((p) => {
  p.center();
  p.withText("Document Header");
});
section.footer.withParagraph((p) => {
  p.withText({ fontSize: pt(10) }, "Page ").withSpecial("pageNumber");
});
```

## Size Units

The library provides utilities for different measurement units:

```typescript
import { pt, mm, cm, inch } from "rtfbuilder";

// Point sizes (1/72 inch)
fontSize: pt(12);

// Millimeters
margin: {
  top: mm(25);
}

// Centimeters
width: cm(5);

// Inches
pageWidth: inch(8.5);
```

## Validation

Enable optional document validation during development:

```typescript
import { RTF_DOCUMENT_VALIDATOR } from "rtfbuilder/validation";

const doc = new RTFDocument({ validator: RTF_DOCUMENT_VALIDATOR });
const content = builder.buildInto(doc).render();
```

## Examples

See the demo folder for complete examples including:

- [Simple document](demo/examples/simple.ts)
- [Text formatting](demo/examples/text-formatting.ts)
- [Using stylesheets](demo/examples/style.ts)
- [Section layouts](demo/examples/section.ts)
- [Item lists](demo/examples/list.ts)
- [Bookmarks & hyperlinks](demo/examples/navigation.ts)
- [Table layouts](demo/examples/table.ts)
- [Pictures](demo/examples/picture.ts)
- [Footnotes and endnotes](demo/examples/footnote.ts)

If you are [flakes](https://nixos.wiki/wiki/flakes)-ready, the dev shell contains a `run-demos` script to generate the corresponding RTF/DOCX. Otherwise:

```shell
run-demos
# or
run-demo simple
# or
tsx demo/cli.ts --validate simple simple.docx
tsx demo/cli.ts --validate simple simple.rtf
```

## OOXML validation

The dev shell contains a script to validate an OOXML/DOCX against the ECMA-376 XSDs:

```shell
validate-ooxml simple.docx
```

## License

MIT
