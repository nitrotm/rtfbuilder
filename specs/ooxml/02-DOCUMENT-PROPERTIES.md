# Document Properties & Setup

This section covers OOXML document-level properties, page setup, styles, fonts, and document metadata that align with RTFBuilder's capabilities.

## Overview

Document properties in OOXML are distributed across multiple XML files within the package:

1. **Document settings** (`word/settings.xml`) - Basic document-wide behavior settings
2. **Style definitions** (`word/styles.xml`) - Paragraph and character styles  
3. **Font table** (`word/fontTable.xml`) - Basic font declarations
4. **Core properties** (`docProps/core.xml`) - Standard metadata
5. **Extended properties** (`docProps/app.xml`) - Application-specific metadata

All measurements in OOXML use **twips** (1/1440 inch) for consistency with RTF.

## Document Settings

The `word/settings.xml` file contains document-wide settings and behavior configuration.

### Settings Structure

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:zoom w:percent="100"/>
  <w:defaultTabStop w:val="708"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>
```

### Common Settings

#### View and Display Settings

- `<w:view w:val="print"/>` - Document view mode (print, outline, masterPages, normal, web)
- `<w:zoom w:percent="100"/>` - Zoom percentage
- `<w:displayHorizontalDrawingGridEvery w:val="0"/>` - Grid display settings
- `<w:displayVerticalDrawingGridEvery w:val="2"/>` - Vertical grid spacing

#### Typography Settings

- `<w:defaultTabStop w:val="708"/>` - Default tab stop spacing in twips
- `<w:characterSpacingControl w:val="doNotCompress"/>` - Character spacing behavior

#### Basic Compatibility Settings

```xml
<w:compat>
  <w:compatSetting w:name="compatibilityMode" 
                   w:uri="http://schemas.microsoft.com/office/word" 
                   w:val="15"/>
</w:compat>
```

### Example Complete Settings

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:zoom w:percent="100"/>
  <w:defaultTabStop w:val="708"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" 
                     w:uri="http://schemas.microsoft.com/office/word" 
                     w:val="15"/>
  </w:compat>
</w:settings>
```

## Page Setup and Section Properties

Page layout is defined through section properties (`w:sectPr`), which appear at the end of `w:body` or after section breaks.

### Section Properties Structure

```xml
<w:sectPr>
  <w:pgSz w:w="12240" w:h="15840"/>
  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" 
           w:header="720" w:footer="720" w:gutter="0"/>
  <w:cols w:space="708"/>
  <w:docGrid w:linePitch="360"/>
</w:sectPr>
```

### Page Dimensions

**Paper size:**
```xml
<w:pgSz w:w="12240" w:h="15840" w:orient="portrait"/>
```

| Paper Size | Width (twips) | Height (twips) | Code |
|------------|---------------|----------------|------|
| Letter     | 12240         | 15840          | 1    |
| Legal      | 12240         | 20160          | 5    |
| A4         | 11906         | 16838          | 9    |
| A5         | 8419          | 11906          | 11   |

**Orientation:**
- `w:orient="portrait"` (default)  
- `w:orient="landscape"`

### Margins

```xml
<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"
         w:header="720" w:footer="720" w:gutter="0"/>
```

- `w:top`, `w:right`, `w:bottom`, `w:left` - Page margins in twips
- `w:header` - Distance from top of page to header
- `w:footer` - Distance from bottom of page to footer  
- `w:gutter` - Extra space for binding

### Columns

```xml
<w:cols w:space="708" w:num="2">
  <w:col w:w="4320" w:space="708"/>
  <w:col w:w="4320" w:space="0"/>
</w:cols>
```

### Headers and Footers

```xml
<w:sectPr>
  <w:headerReference w:type="default" r:id="rId7"/>
  <w:footerReference w:type="default" r:id="rId8"/>
  <w:pgSz w:w="12240" w:h="15840"/>
  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
</w:sectPr>
```

## Style Definitions

The `word/styles.xml` file contains all paragraph and character style definitions.

### Styles Structure

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  
  <!-- Style definitions here -->
</w:styles>
```

### Document Defaults

Define fallback formatting for all document content:

```xml
<w:docDefaults>
  <w:rPrDefault>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" 
                w:eastAsia="Times New Roman" w:cs="Times New Roman"/>
      <w:sz w:val="24"/>        <!-- 12pt font -->
      <w:szCs w:val="24"/>      <!-- 12pt complex script font -->
      <w:lang w:val="en-US"/>
    </w:rPr>
  </w:rPrDefault>
  <w:pPrDefault>
    <w:pPr>
      <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
    </w:pPr>
  </w:pPrDefault>
</w:docDefaults>
```

### Style Definition

```xml
<w:style w:type="paragraph" w:styleId="Heading1">
  <w:name w:val="heading 1"/>
  <w:next w:val="Normal"/>
  <w:link w:val="Heading1Char"/>
  <w:uiPriority w:val="9"/>
  <w:qFormat/>
  <w:pPr>
    <w:keepNext/>
    <w:spacing w:before="240" w:after="60"/>
    <w:outlineLvl w:val="0"/>
  </w:pPr>
  <w:rPr>
    <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
    <w:b/>
    <w:sz w:val="32"/>
    <w:szCs w:val="32"/>
  </w:rPr>
</w:style>
```

### Common Built-in Styles

**Normal (default paragraph style):**
```xml
<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
  <w:name w:val="Normal"/>
  <w:qFormat/>
</w:style>
```

**Character styles:**
```xml
<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont">
  <w:name w:val="Default Paragraph Font"/>
  <w:uiPriority w:val="1"/>
  <w:semiHidden/>
  <w:unhideWhenUsed/>
</w:style>
```

**Table styles:**
```xml
<w:style w:type="table" w:default="1" w:styleId="TableNormal">
  <w:name w:val="Normal Table"/>
  <w:uiPriority w:val="99"/>
  <w:semiHidden/>
  <w:unhideWhenUsed/>
  <w:tblPr>
    <w:tblInd w:w="0" w:type="dxa"/>
    <w:tblCellMar>
      <w:top w:w="0" w:type="dxa"/>
      <w:left w:w="108" w:type="dxa"/>
      <w:bottom w:w="0" w:type="dxa"/>
      <w:right w:w="108" w:type="dxa"/>
    </w:tblCellMar>
  </w:tblPr>
</w:style>
```

### Numbering Styles

Reference numbering definitions:

```xml
<w:style w:type="numbering" w:styleId="NoList">
  <w:name w:val="No List"/>
  <w:uiPriority w:val="99"/>
  <w:semiHidden/>
  <w:unhideWhenUsed/>
</w:style>
```

## Font Table

The `word/fontTable.xml` file declares fonts used in the document.

### Font Table Structure

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
         xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:font w:name="Times New Roman">
    <w:panose1 w:val="02020603050405020304"/>
    <w:charset w:val="00"/>
    <w:family w:val="roman"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E0002AFF" w:usb1="C0007841" w:usb2="00000009" w:usb3="00000000" 
           w:csb0="000001FF" w:csb1="00000000"/>
  </w:font>
</w:fonts>
```

### Font Properties

**Basic font declaration:**
```xml
<w:font w:name="Arial">
  <w:charset w:val="00"/>
  <w:family w:val="swiss"/>
  <w:pitch w:val="variable"/>
</w:font>
```

**Font families:**
- `roman` - Serif fonts (Times New Roman, Georgia)
- `swiss` - Sans-serif fonts (Arial, Calibri)  
- `modern` - Monospace fonts (Courier New)
- `script` - Script fonts
- `decorative` - Decorative fonts

**Character sets:**
- `00` - ANSI (Western)
- `01` - Default
- `02` - Symbol  
- `4D` - Mac
- `B1` - Hebrew
- `B2` - Arabic


## Core Document Properties

The `docProps/core.xml` file contains standard document metadata.

### Core Properties Structure

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" 
                   xmlns:dc="http://purl.org/dc/elements/1.1/" 
                   xmlns:dcterms="http://purl.org/dc/terms/" 
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/" 
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Document Title</dc:title>
  <dc:subject>Document Subject</dc:subject>
  <dc:creator>Author Name</dc:creator>
  <dc:description>Document description or comments</dc:description>
  <cp:keywords>keyword1, keyword2, keyword3</cp:keywords>
  <cp:lastModifiedBy>Last Editor</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
  <dcterms:created xsi:type="dcterms:W3CDTF">2024-01-15T10:30:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2024-01-16T14:45:00Z</dcterms:modified>
  <cp:category>Document Category</cp:category>
</cp:coreProperties>
```

## Extended Properties

The `docProps/app.xml` file contains application-specific metadata.

### Extended Properties Structure

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" 
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>RTF Builder</Application>
  <DocSecurity>0</DocSecurity>
  <Lines>1</Lines>
  <Paragraphs>1</Paragraphs>
  <ScaleCrop>false</ScaleCrop>
  <Company>Company Name</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <CharactersWithSpaces>500</CharactersWithSpaces>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
```

## Complete Document Setup Example

### Package Structure Implementation

```xml
<!-- [Content_Types].xml -->
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/fontTable.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
  <Override PartName="/docProps/core.xml" 
           ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" 
           ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>

<!-- _rels/.rels -->
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

## Implementation Guidelines

### For OOXML Writers:

1. **Package organization**: Create all required files and relationships
2. **Style consistency**: Define comprehensive default styles
3. **Measurement units**: Use twips consistently for compatibility with RTF
4. **Font declarations**: Include all referenced fonts in font table
5. **Metadata completeness**: Populate core and extended properties

### Best Practices:

1. **Start with defaults**: Establish good document defaults before adding content
2. **Style hierarchy**: Use style inheritance to minimize redundant formatting
3. **Cross-reference validation**: Ensure all style and font references are declared
4. **Compatibility modes**: Set appropriate compatibility for target Word versions