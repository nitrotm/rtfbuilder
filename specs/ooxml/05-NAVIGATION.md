# Navigation & References

This section covers OOXML navigation features including bookmarks, hyperlinks, footnotes, endnotes, and cross-references.

## Overview

OOXML navigation elements enable document interactivity and references:

- **Bookmarks** - Named locations within the document
- **Hyperlinks** - Links to external URLs, internal bookmarks, and email addresses
- **Footnotes and Endnotes** - Reference notes with automatic numbering
- **Cross-references** - Dynamic references to numbered elements
- **Fields** - Dynamic content and calculations

## Bookmarks

Bookmarks mark specific locations in the document for reference by hyperlinks and cross-references.

### Bookmark Definition

```xml
<w:p>
  <w:bookmarkStart w:id="0" w:name="introduction"/>
  <w:r><w:t>This is the introduction section.</w:t></w:r>
  <w:bookmarkEnd w:id="0"/>
</w:p>
```

### Bookmark Properties

- `w:id` - Unique numeric identifier
- `w:name` - Bookmark name (no spaces, case-sensitive)
- Names must start with letter or underscore
- Maximum length: 40 characters

### Spanning Bookmarks

```xml
<w:p>
  <w:bookmarkStart w:id="1" w:name="chapter1"/>
  <w:r><w:t>Chapter 1: Introduction</w:t></w:r>
</w:p>
<w:p>
  <w:r><w:t>Chapter content continues here...</w:t></w:r>
  <w:bookmarkEnd w:id="1"/>
</w:p>
```

## Hyperlinks

### External Hyperlinks

```xml
<w:p>
  <w:hyperlink r:id="rId5" w:tooltip="Visit our website">
    <w:r>
      <w:rPr>
        <w:color w:val="0563C1" w:themeColor="hyperlink"/>
        <w:u w:val="single"/>
      </w:rPr>
      <w:t>https://example.com</w:t>
    </w:r>
  </w:hyperlink>
</w:p>
```

Corresponding relationship in `word/_rels/document.xml.rels`:

```xml
<Relationship Id="rId5"
              Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
              Target="https://example.com"
              TargetMode="External"/>
```

### Internal Hyperlinks (Bookmarks)

```xml
<w:p>
  <w:hyperlink w:anchor="introduction">
    <w:r>
      <w:rPr>
        <w:color w:val="0563C1" w:themeColor="hyperlink"/>
        <w:u w:val="single"/>
      </w:rPr>
      <w:t>Go to Introduction</w:t>
    </w:r>
  </w:hyperlink>
</w:p>
```

## Footnotes and Endnotes

Footnotes and endnotes require separate XML parts and relationships.

### Footnote Reference

```xml
<w:p>
  <w:r><w:t>This text has a footnote</w:t></w:r>
  <w:r>
    <w:footnoteReference w:id="1"/>
  </w:r>
  <w:r><w:t> and continues here.</w:t></w:r>
</w:p>
```

### Footnotes XML Part (`word/footnotes.xml`)

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:footnote w:type="separator" w:id="-1">
    <w:p>
      <w:pPr>
        <w:spacing w:after="0" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:separator/>
      </w:r>
    </w:p>
  </w:footnote>

  <w:footnote w:type="continuationSeparator" w:id="0">
    <w:p>
      <w:pPr>
        <w:spacing w:after="0" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:continuationSeparator/>
      </w:r>
    </w:p>
  </w:footnote>

  <w:footnote w:id="1">
    <w:p>
      <w:pPr>
        <w:pStyle w:val="FootnoteText"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rStyle w:val="FootnoteReference"/>
        </w:rPr>
        <w:footnoteRef/>
      </w:r>
      <w:r>
        <w:t xml:space="preserve"> This is the footnote text.</w:t>
      </w:r>
    </w:p>
  </w:footnote>
</w:footnotes>
```

### Footnote Relationship

Add to `word/_rels/document.xml.rels`:

```xml
<Relationship Id="rId7"
              Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes"
              Target="footnotes.xml"/>
```

### Endnotes

Similar structure but using `w:endnoteReference`, `word/endnotes.xml`, and endnote relationship type:

```xml
<w:r>
  <w:endnoteReference w:id="1"/>
</w:r>
```

## Simple Dynamic Content

### Page Numbers

**Page number field:**

```xml
<w:fldSimple w:instr=" PAGE ">
  <w:r><w:t>1</w:t></w:r>
</w:fldSimple>
```

**Date and time:**

```xml
<w:fldSimple w:instr=" DATE \@ &quot;MMMM d, yyyy&quot; ">
  <w:r><w:t>January 15, 2024</w:t></w:r>
</w:fldSimple>
```

## Implementation Guidelines

### Bookmark Management:

1. **Unique IDs**: Ensure bookmark IDs are unique within document
2. **Valid names**: Use only letters, digits, and underscores in names
3. **Proper nesting**: Don't overlap bookmark ranges improperly
4. **Cleanup**: Remove unused bookmarks to avoid clutter

### Hyperlink Best Practices:

1. **External validation**: Verify external URLs when possible
2. **Tooltip usage**: Provide descriptive tooltips for user guidance
3. **Style consistency**: Use consistent hyperlink formatting
4. **Relationship management**: Maintain proper relationship entries

### Footnote Organization:

1. **Separator management**: Include proper separator footnotes
2. **Style application**: Use appropriate footnote styles
3. **Numbering**: Let Word handle automatic numbering
4. **Placement**: Consider footnote placement in document flow

### Simple Field Usage:

1. **Basic fields**: Use PAGE, DATE fields for dynamic content
2. **Fallback content**: Provide static text for field values
3. **Cross-platform**: Test field compatibility across applications
