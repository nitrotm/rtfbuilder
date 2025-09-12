# OOXML Fundamentals

This section covers the fundamental concepts and structure for OOXML (Office Open XML) Word documents, essential for implementing an OOXML writer.

## Overview

OOXML documents are **ZIP packages** containing multiple XML files, consisting of three main components:

- **XML Parts** - structured content files following OOXML schemas
- **Relationships** - connections between parts and external resources
- **Content Types** - MIME type declarations for all parts

OOXML uses **UTF-8 encoding** throughout and follows XML 1.0 standards with specific namespace conventions.

## Package Structure

An OOXML Word document (.docx) follows this ZIP package structure:

```
document.docx (ZIP file)
├── [Content_Types].xml          # Content type definitions
├── _rels/
│   └── .rels                    # Package-level relationships
├── word/
│   ├── document.xml            # Main document content
│   ├── styles.xml              # Style definitions  
│   ├── settings.xml            # Document settings
│   ├── webSettings.xml         # Web-specific settings
│   ├── fontTable.xml           # Font declarations
│   ├── theme/
│   │   └── theme1.xml          # Document theme
│   ├── _rels/
│   │   └── document.xml.rels   # Document relationships
│   └── media/                  # Embedded media files
│       ├── image1.png
│       └── image2.jpg
└── docProps/
    ├── core.xml                # Core document properties
    ├── app.xml                 # Application properties
    └── custom.xml              # Custom properties (optional)
```

### Minimal OOXML Package

A minimal OOXML document requires:

1. `[Content_Types].xml` - Content type declarations
2. `_rels/.rels` - Package relationships
3. `word/document.xml` - Main content
4. `word/_rels/document.xml.rels` - Document relationships

## XML Namespaces

OOXML uses specific namespaces for different document aspects:

### Primary Namespaces

```xml
xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
```

### Content Types Namespace

```xml
xmlns="http://schemas.openxmlformats.org/package/2006/content-types"
```

### Relationship Namespace

```xml
xmlns="http://schemas.openxmlformats.org/package/2006/relationships"
```

## Content Types Definition

The `[Content_Types].xml` file declares MIME types for all parts in the package.

### Basic Content Types Structure

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  
  <!-- Default extensions -->
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
  
  <!-- Override specific parts -->
  <Override PartName="/word/document.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/docProps/core.xml" 
           ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
           
</Types>
```

### Common Content Types

| Content Type | Usage | Required |
|--------------|--------|----------|
| `wordprocessingml.document.main+xml` | Main document | Yes |
| `wordprocessingml.styles+xml` | Style definitions | Recommended |
| `wordprocessingml.settings+xml` | Document settings | Optional |
| `wordprocessingml.webSettings+xml` | Web settings | Optional |
| `wordprocessingml.fontTable+xml` | Font declarations | Optional |
| `package.core-properties+xml` | Core metadata | Recommended |
| `officedocument.extended-properties+xml` | App properties | Optional |

## Relationships

Relationships define connections between parts within the package and to external resources.

### Package-Level Relationships

`_rels/.rels` defines the main document relationship:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" 
                Target="word/document.xml"/>
  <Relationship Id="rId2" 
                Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" 
                Target="docProps/core.xml"/>
  <Relationship Id="rId3" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" 
                Target="docProps/app.xml"/>
</Relationships>
```

### Document-Level Relationships

`word/_rels/document.xml.rels` defines relationships from the main document:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" 
                Target="styles.xml"/>
  <Relationship Id="rId2" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" 
                Target="settings.xml"/>
  <Relationship Id="rId3" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings" 
                Target="webSettings.xml"/>
  <Relationship Id="rId4" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" 
                Target="fontTable.xml"/>
  <Relationship Id="rId5" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" 
                Target="theme/theme1.xml"/>
</Relationships>
```

### Relationship Types

| Type | Usage | Target Example |
|------|--------|----------------|
| `officeDocument` | Main document | `word/document.xml` |
| `styles` | Style definitions | `word/styles.xml` |
| `settings` | Document settings | `word/settings.xml` |
| `image` | Embedded images | `word/media/image1.png` |
| `hyperlink` | External links | `http://example.com` |
| `footnotes` | Footnote definitions | `word/footnotes.xml` |

## Basic Document Structure

### Document Root Element

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <!-- Document content here -->
  </w:body>
</w:document>
```

### Basic Content Elements

**Paragraph (w:p):**
```xml
<w:p>
  <w:r>
    <w:t>Hello World!</w:t>
  </w:r>
</w:p>
```

**Run (w:r) with formatting:**
```xml
<w:p>
  <w:r>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
    </w:rPr>
    <w:t>Bold text</w:t>
  </w:r>
</w:p>
```

**Section properties:**
```xml
<w:body>
  <w:p>
    <w:r><w:t>Content here</w:t></w:r>
  </w:p>
  <w:sectPr>
    <w:pgSz w:w="12240" w:h="15840"/>
    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
  </w:sectPr>
</w:body>
```

## Element Hierarchy

OOXML documents follow a strict element hierarchy:

```
w:document
└── w:body
    ├── w:p (paragraph)
    │   ├── w:pPr (paragraph properties)
    │   └── w:r (run) 
    │       ├── w:rPr (run properties)
    │       └── w:t (text)
    ├── w:tbl (table)
    │   ├── w:tblPr (table properties)
    │   └── w:tr (table row)
    │       └── w:tc (table cell)
    │           └── w:p (paragraph)
    └── w:sectPr (section properties)
```

## Measurement Units

OOXML uses specific measurement units:

### Length Units
- **Twips**: 1/1440 inch (same as RTF) - used for margins, spacing
- **DXA**: 1/20 point (same as twip) - used for character positioning
- **Half-points**: 1/2 point - used for font sizes
- **EMU**: English Metric Unit (1/914400 inch) - used for drawings

### Common Conversions
```javascript
// Points to half-points (font size)
halfPoints = points * 2

// Points to twips (margins, spacing)
twips = points * 20

// Inches to twips
twips = inches * 1440

// Millimeters to twips  
twips = mm * 56.7
```

## XML Formatting Rules

### Text Content
- **Whitespace preservation**: Use `xml:space="preserve"` for significant whitespace
- **Special characters**: XML-encode `<`, `>`, `&`, quotes
- **Line breaks**: Use `<w:br/>` elements, not literal newlines

### Element Ordering
- **Properties first**: `w:pPr`, `w:rPr` elements must precede content
- **Content elements**: Text and other content follow properties
- **Section properties last**: `w:sectPr` must be last in `w:body`

### Example with proper structure:
```xml
<w:p>
  <w:pPr>
    <w:jc w:val="center"/>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:b/>
    </w:rPr>
    <w:t>Centered bold text</w:t>
  </w:r>
</w:p>
```

## Minimal Working Document

```xml
<!-- [Content_Types].xml -->
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>

<!-- _rels/.rels -->
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" 
                Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" 
                Target="word/document.xml"/>
</Relationships>

<!-- word/document.xml -->
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Hello World!</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>
```

## Implementation Guidelines

### For OOXML Writers:

1. **Start with package structure**: Create proper ZIP with required files
2. **Declare content types**: Include all parts in `[Content_Types].xml`
3. **Establish relationships**: Connect all parts through relationship files  
4. **Use proper namespaces**: Include required namespace declarations
5. **Follow element hierarchy**: Respect the strict parent-child relationships
6. **Handle encodings correctly**: Use UTF-8 throughout

### Best Practices:

1. **Validate XML**: Ensure well-formed XML in all parts
2. **Test with Word**: Verify documents open correctly in Microsoft Word
3. **Use meaningful IDs**: Make relationship IDs descriptive and unique
4. **Handle whitespace**: Use `xml:space="preserve"` when needed
5. **Organize content**: Keep logical separation between different document aspects

### Error Prevention:

1. **Missing relationships**: Always create corresponding relationship entries
2. **Invalid XML**: Validate against OOXML schemas when possible  
3. **Namespace errors**: Include all required namespace declarations
4. **ZIP corruption**: Use proper ZIP creation libraries
5. **Content type mismatches**: Ensure content types match actual file contents