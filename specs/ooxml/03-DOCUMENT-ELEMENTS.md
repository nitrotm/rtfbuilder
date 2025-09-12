# Document Elements

This section covers OOXML content formatting elements including paragraphs, runs, tables, lists, and sections - the core building blocks for document content.

## Overview

OOXML document content follows a hierarchical structure where all content must be contained within proper parent elements:

- **Sections** (`w:sectPr`) - Define page layout and column structure
- **Paragraphs** (`w:p`) - Basic content containers with formatting properties
- **Runs** (`w:r`) - Character-level formatting containers within paragraphs
- **Tables** (`w:tbl`) - Structured data presentation
- **Lists** - Numbered and bulleted content organization

All formatting in OOXML separates properties from content, with properties elements (`w:pPr`, `w:rPr`, `w:tblPr`) preceding content elements.

## Paragraph Formatting

Paragraphs (`w:p`) are the fundamental content containers in OOXML documents.

### Basic Paragraph Structure

```xml
<w:p>
  <w:pPr>
    <!-- Paragraph properties -->
  </w:pPr>
  <w:r>
    <w:rPr>
      <!-- Run properties -->
    </w:rPr>
    <w:t>Text content</w:t>
  </w:r>
</w:p>
```

### Paragraph Properties (`w:pPr`)

**Style reference:**
```xml
<w:pPr>
  <w:pStyle w:val="Heading1"/>
</w:pPr>
```

**Alignment:**
```xml
<w:pPr>
  <w:jc w:val="center"/>  <!-- left, center, right, both, distribute -->
</w:pPr>
```

**Indentation:**
```xml
<w:pPr>
  <w:ind w:left="720"      <!-- Left indent in twips -->
         w:right="720"     <!-- Right indent in twips -->  
         w:firstLine="360" <!-- First line indent in twips -->
         w:hanging="360"/> <!-- Hanging indent in twips -->
</w:pPr>
```

**Spacing:**
```xml
<w:pPr>
  <w:spacing w:before="240"        <!-- Space before paragraph -->
             w:after="240"         <!-- Space after paragraph -->
             w:line="276"          <!-- Line spacing in twips -->
             w:lineRule="auto"/>   <!-- auto, atLeast, exact -->
</w:pPr>
```

**Keep together/with next:**
```xml
<w:pPr>
  <w:keepNext/>    <!-- Keep with next paragraph -->
  <w:keepLines/>   <!-- Keep paragraph lines together -->
  <w:pageBreakBefore/> <!-- Force page break before -->
</w:pPr>
```

### Paragraph Borders

```xml
<w:pPr>
  <w:pBdr>
    <w:top w:val="single" w:sz="4" w:space="1" w:color="000000"/>
    <w:left w:val="single" w:sz="4" w:space="4" w:color="000000"/>
    <w:bottom w:val="single" w:sz="4" w:space="1" w:color="000000"/>
    <w:right w:val="single" w:sz="4" w:space="4" w:color="000000"/>
  </w:pBdr>
</w:pPr>
```

**Border styles:**
- `single` - Solid line
- `double` - Double line
- `dotted` - Dotted line  
- `dashed` - Dashed line
- `wave` - Wavy line

**Border properties:**
- `w:sz` - Border width in eighths of a point (4 = 0.5pt)
- `w:space` - Spacing from text in points
- `w:color` - Border color (hex RGB)

### Paragraph Shading

```xml
<w:pPr>
  <w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>
</w:pPr>
```

- `w:val` - Shading pattern (clear, pct5, pct10, pct20, etc.)
- `w:color` - Foreground color  
- `w:fill` - Background color

## Character Formatting

Runs (`w:r`) contain character-level formatting and text content.

### Run Structure

```xml
<w:r>
  <w:rPr>
    <!-- Character properties -->
  </w:rPr>
  <w:t>Text content</w:t>
</w:r>
```

### Character Properties (`w:rPr`)

**Font formatting:**
```xml
<w:rPr>
  <w:rFonts w:ascii="Times New Roman" 
            w:hAnsi="Times New Roman"
            w:eastAsia="SimSun"
            w:cs="Times New Roman"/>
  <w:sz w:val="24"/>      <!-- Font size in half-points (24 = 12pt) -->
  <w:szCs w:val="24"/>    <!-- Complex script font size -->
</w:rPr>
```

**Character effects:**
```xml
<w:rPr>
  <w:b/>                  <!-- Bold -->
  <w:i/>                  <!-- Italic -->
  <w:u w:val="single"/>   <!-- Underline: single, double, thick, etc. -->
  <w:strike/>             <!-- Strikethrough -->
  <w:dstrike/>            <!-- Double strikethrough -->
  <w:caps/>               <!-- All capitals -->
  <w:smallCaps/>          <!-- Small capitals -->
  <w:vanish/>             <!-- Hidden text -->
</w:rPr>
```

**Color and highlighting:**
```xml
<w:rPr>
  <w:color w:val="FF0000"/>        <!-- Font color (hex RGB) -->
  <w:highlight w:val="yellow"/>     <!-- Text highlighting -->
</w:rPr>
```

**Position and spacing:**
```xml
<w:rPr>
  <w:position w:val="6"/>          <!-- Raise/lower text (half-points) -->
  <w:spacing w:val="20"/>          <!-- Character spacing expansion -->
  <w:kern w:val="24"/>             <!-- Kerning threshold -->
</w:rPr>
```

### Text Elements

**Plain text:**
```xml
<w:t>Simple text content</w:t>
```

**Text with preserved whitespace:**
```xml
<w:t xml:space="preserve">  Text with spaces  </w:t>
```

**Special characters and breaks:**
```xml
<w:br/>                          <!-- Line break -->
<w:br w:type="page"/>            <!-- Page break -->
<w:br w:type="column"/>          <!-- Column break -->
<w:tab/>                         <!-- Tab character -->
<w:noBreakHyphen/>              <!-- Non-breaking hyphen -->
<w:softHyphen/>                 <!-- Optional hyphen -->
```

## Table Formatting

Tables in OOXML use a three-level hierarchy: table, row, cell.

### Table Structure

```xml
<w:tbl>
  <w:tblPr>
    <!-- Table properties -->
  </w:tblPr>
  <w:tblGrid>
    <!-- Column definitions -->
  </w:tblGrid>
  <w:tr>
    <!-- Table row -->
    <w:tc>
      <!-- Table cell -->
    </w:tc>
  </w:tr>
</w:tbl>
```

### Table Properties (`w:tblPr`)

**Table width:**
```xml
<w:tblPr>
  <w:tblW w:w="5000" w:type="pct"/>  <!-- Percentage width -->
  <!-- or -->
  <w:tblW w:w="8640" w:type="dxa"/>  <!-- Fixed width in twips -->
</w:tblPr>
```

**Table alignment:**
```xml
<w:tblPr>
  <w:jc w:val="center"/>  <!-- left, center, right -->
</w:tblPr>
```

**Table indentation:**
```xml
<w:tblPr>
  <w:tblInd w:w="708" w:type="dxa"/>
</w:tblPr>
```

**Table borders:**
```xml
<w:tblPr>
  <w:tblBorders>
    <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
  </w:tblBorders>
</w:tblPr>
```

### Table Grid

Define column widths:

```xml
<w:tblGrid>
  <w:gridCol w:w="2880"/>  <!-- Column 1: 2" wide -->
  <w:gridCol w:w="2880"/>  <!-- Column 2: 2" wide -->
  <w:gridCol w:w="2880"/>  <!-- Column 3: 2" wide -->
</w:tblGrid>
```

### Table Row (`w:tr`)

```xml
<w:tr>
  <w:trPr>
    <w:trHeight w:val="360" w:hRule="atLeast"/>  <!-- Minimum row height -->
    <w:tblHeader/>                              <!-- Repeat as header row -->
  </w:trPr>
  <w:tc>
    <!-- Cell content -->
  </w:tc>
</w:tr>
```

### Table Cell (`w:tc`)

```xml
<w:tc>
  <w:tcPr>
    <w:tcW w:w="2880" w:type="dxa"/>           <!-- Cell width -->
    <w:gridSpan w:val="2"/>                   <!-- Column span -->
    <w:vMerge w:val="restart"/>               <!-- Vertical merge start -->
    <w:vAlign w:val="center"/>                <!-- top, center, bottom -->
    <w:tcBorders>
      <w:top w:val="single" w:sz="4" w:color="000000"/>
    </w:tcBorders>
    <w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>
    <w:tcMar>
      <w:top w:w="108" w:type="dxa"/>
      <w:left w:w="108" w:type="dxa"/>
      <w:bottom w:w="108" w:type="dxa"/>
      <w:right w:w="108" w:type="dxa"/>
    </w:tcMar>
  </w:tcPr>
  <w:p>
    <w:r><w:t>Cell content</w:t></w:r>
  </w:p>
</w:tc>
```

### Complete Table Example

```xml
<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="TableGrid"/>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="4320"/>
    <w:gridCol w:w="4320"/>
  </w:tblGrid>
  <w:tr>
    <w:trPr>
      <w:tblHeader/>
    </w:trPr>
    <w:tc>
      <w:tcPr><w:tcW w:w="4320" w:type="dxa"/></w:tcPr>
      <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Header 1</w:t></w:r></w:p>
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="4320" w:type="dxa"/></w:tcPr>
      <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Header 2</w:t></w:r></w:p>
    </w:tc>
  </w:tr>
  <w:tr>
    <w:tc>
      <w:tcPr><w:tcW w:w="4320" w:type="dxa"/></w:tcPr>
      <w:p><w:r><w:t>Data 1</w:t></w:r></w:p>
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="4320" w:type="dxa"/></w:tcPr>
      <w:p><w:r><w:t>Data 2</w:t></w:r></w:p>
    </w:tc>
  </w:tr>
</w:tbl>
```

## List Formatting

OOXML handles lists through numbering definitions that are referenced by paragraphs.

### Numbering Definition Structure

Lists require separate `word/numbering.xml` file:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:nsid w:val="1A2B3C4D"/>
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="·"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="720" w:hanging="360"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/>
      </w:rPr>
    </w:lvl>
  </w:abstractNum>
  
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>
```

### List Paragraph

Reference numbering in paragraph:

```xml
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>    <!-- List level (0-8) -->
      <w:numId w:val="1"/>   <!-- Numbering definition ID -->
    </w:numPr>
  </w:pPr>
  <w:r><w:t>List item text</w:t></w:r>
</w:p>
```

### Bulleted List

```xml
<!-- In numbering.xml -->
<w:lvl w:ilvl="0">
  <w:start w:val="1"/>
  <w:numFmt w:val="bullet"/>
  <w:lvlText w:val=""/>
  <w:lvlJc w:val="left"/>
  <w:pPr>
    <w:ind w:left="720" w:hanging="360"/>
  </w:pPr>
  <w:rPr>
    <w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/>
  </w:rPr>
</w:lvl>
```

### Numbered List

```xml
<!-- In numbering.xml -->
<w:lvl w:ilvl="0">
  <w:start w:val="1"/>
  <w:numFmt w:val="decimal"/>
  <w:lvlText w:val="%1."/>
  <w:lvlJc w:val="left"/>
  <w:pPr>
    <w:ind w:left="720" w:hanging="360"/>
  </w:pPr>
</w:lvl>
```

**Number formats:**
- `decimal` - 1, 2, 3
- `upperRoman` - I, II, III
- `lowerRoman` - i, ii, iii
- `upperLetter` - A, B, C
- `lowerLetter` - a, b, c
- `bullet` - Bullet characters

## Section Formatting

Sections define page layout and are marked by section properties (`w:sectPr`).

### Section Break Types

```xml
<w:p>
  <w:pPr>
    <w:sectPr>
      <w:type w:val="nextPage"/>  <!-- Section break type -->
      <!-- Section properties -->
    </w:sectPr>
  </w:pPr>
</w:p>
```

**Break types:**
- `continuous` - New section, same page
- `nextColumn` - New section, next column
- `nextPage` - New section, next page  
- `evenPage` - New section, next even page
- `oddPage` - New section, next odd page

### Page Orientation and Size

```xml
<w:sectPr>
  <w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/>
  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
</w:sectPr>
```

### Multi-Column Layout

```xml
<w:sectPr>
  <w:cols w:space="708" w:num="2">
    <w:col w:w="3816" w:space="354"/>
    <w:col w:w="3816" w:space="354"/>
  </w:cols>
</w:sectPr>
```

## Headers and Footers

Headers and footers are separate XML parts referenced by section properties.

### Header Reference

```xml
<w:sectPr>
  <w:headerReference w:type="default" r:id="rId7"/>
  <w:footerReference w:type="default" r:id="rId8"/>
</w:sectPr>
```

### Header Content (`word/header1.xml`)

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:t>Document Header</w:t>
    </w:r>
  </w:p>
</w:hdr>
```

### Footer with Page Number

```xml
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:t>Page </w:t>
    </w:r>
    <w:fldSimple w:instr=" PAGE ">
      <w:r><w:t>1</w:t></w:r>
    </w:fldSimple>
  </w:p>
</w:ftr>
```

## Implementation Guidelines

### For OOXML Writers:

1. **Element hierarchy**: Always follow proper parent-child relationships
2. **Properties first**: Place property elements before content elements
3. **Required elements**: Include mandatory elements even if empty
4. **Measurement consistency**: Use twips for all measurements 
5. **Style references**: Ensure referenced styles exist in styles.xml
6. **Table structure**: Always include tblGrid for proper column layout

### Best Practices:

1. **Semantic structure**: Use appropriate elements for content type
2. **Style separation**: Prefer styles over direct formatting when possible
3. **Cross-reference validation**: Verify all ID references are valid
4. **Whitespace handling**: Use xml:space="preserve" when needed
5. **Error handling**: Provide fallbacks for missing references

### Common Patterns:

1. **Simple paragraph**: `w:p > w:r > w:t`
2. **Formatted paragraph**: `w:p > w:pPr + w:r > w:rPr + w:t`
3. **Table cell**: `w:tc > w:tcPr + w:p > w:r > w:t`
4. **List item**: `w:p > w:pPr > w:numPr + w:r > w:t`