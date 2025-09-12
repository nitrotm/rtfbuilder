import { AbstractDocument, DocumentOptions, RTFDocumentModel } from "../document"
import { zipSync } from "fflate"
import {
  RTFColor,
  RTFFont,
  RTFParagraphFormatting,
  RTFSection,
  RTFStyle,
  RTFParagraphElement,
  RTFCharacterElement,
  RTFTableElement,
  RTFElement,
  RTFColumnBreakElement,
  RTFTableRow,
  RTFTableCell,
} from "../types"
import { toHalfPoints, toTwips } from "../utils"

const XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>`

/** OOXML generation options */
export type OOXMLGenerationOptions = {
  creator?: string
  description?: string
  title?: string
  subject?: string
  keywords?: string
}

function convertColorToHex(color: Partial<RTFColor>): string {
  return [
    (color.red || 0).toString(16).padStart(2, "0"),
    (color.green || 0).toString(16).padStart(2, "0"),
    (color.blue || 0).toString(16).padStart(2, "0"),
  ].join("")
}

/** Generate Content Types XML */
function generateContentTypes(model: RTFDocumentModel): string {
  return [
    XML_HEADER,
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="xml" ContentType="application/xml" />',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />',
    '<Default Extension="png" ContentType="image/png" />',
    '<Default Extension="jpeg" ContentType="image/jpeg" />',
    '<Override PartName="/_rels/.rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />',
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml" />',
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml" />',
    '<Override PartName="/word/_rels/document.xml.rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" />',
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml" />',
    '<Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml" />',
    '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml" />',
    "</Types>",
  ].join("")
}

/** Generate package relationships */
function generatePackageRels(model: RTFDocumentModel): string {
  return [
    XML_HEADER,
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officedocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml" />',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml" />',
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml" />',
    "</Relationships>",
  ].join("")
}

/** Generate core properties */
function generateCoreProps(model: RTFDocumentModel, options: Partial<OOXMLGenerationOptions>): string {
  const now = new Date().toISOString()

  return (
    XML_HEADER +
    (
      <cp:coreProperties
        xmlns="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
        xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:dcterms="http://purl.org/dc/terms/"
        xmlns:dcmitype="http://purl.org/dc/dcmitype/"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      >
        <dc:creator>{options.creator}</dc:creator>
        <dc:description>{options.description}</dc:description>
        <dc:language>en-US</dc:language>
        <dc:subject>{options.subject}</dc:subject>
        <dc:title>{options.title}</dc:title>
        <cp:keywords>{options.keywords}</cp:keywords>
        <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
        <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
      </cp:coreProperties>
    )
  )
}

/** Generate application properties */
function generateAppProps(model: RTFDocumentModel, options: Partial<OOXMLGenerationOptions>): string {
  return [
    XML_HEADER,
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">',
    "<Application>rtfbuilder</Application>",
    "<AppVersion>1.0000</AppVersion>",
    "<Pages>1</Pages>",
    "<Words>51</Words>",
    "<Characters>222</Characters>",
    "<CharactersWithSpaces>261</CharactersWithSpaces>",
    "<Paragraphs>12</Paragraphs>",
    "</Properties>",
  ].join("")
}

/** Generate document relationships */
function generateDocumentRels(model: RTFDocumentModel): string {
  return [
    XML_HEADER,
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml" />',
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml" />',
    "</Relationships>",
  ].join("")
}

function generateElements(model: RTFDocumentModel, elements: (RTFElement | RTFColumnBreakElement)[]): JSX.IntrinsicElements[] {
  const content: JSX.IntrinsicElements[] = []

  for (const element of elements) {
    if ("type" in element) {
      switch (element.type) {
        case "paragraph":
          content.push(generateParagraph(model, element))
          break
        case "table":
          content.push(generateTable(model, element))
          break
        case "container":
          content.push(...generateElements(model, element.content))
          break
        case "columnBreak":
          content.push(<w:br w:type="column" />)
          break
      }
    }
  }
  return content
}

/** Generate section content from RTFSection */
function generateSection(model: RTFDocumentModel, section: RTFSection): JSX.IntrinsicElements[] {
  const content: JSX.IntrinsicElements[] = []

  content.push(...generateElements(model, section.content))

  // If no content, add a default empty paragraph
  if (content.length === 0) {
    content.push(<w:p></w:p>)
  }

  // Add section properties at the end
  content.push(generateSectionProperties(model, section))

  return content
}

/** Generate paragraph from RTFParagraphElement */
function generateParagraph(model: RTFDocumentModel, paragraph: RTFParagraphElement): JSX.IntrinsicElements {
  const pChildren: JSX.IntrinsicElements[] = []

  // Add paragraph properties if present
  if (paragraph.formatting && Object.keys(paragraph.formatting).length > 0) {
    const pPrChildren: JSX.IntrinsicElements[] = []

    // Add alignment
    if (paragraph.formatting.align) {
      const alignMap: Record<typeof paragraph.formatting.align, string> = {
        left: "left",
        center: "center",
        right: "right",
        justify: "both",
        distribute: "distribute",
      }
      pPrChildren.push(<w:jc w:val={alignMap[paragraph.formatting.align]} />)
    }

    // Add spacing
    const spacingAttrs: any = {}
    if (paragraph.formatting.spaceBefore !== undefined) {
      spacingAttrs["w:before"] = toTwips(paragraph.formatting.spaceBefore).toString()
    }
    if (paragraph.formatting.spaceAfter !== undefined) {
      spacingAttrs["w:after"] = toTwips(paragraph.formatting.spaceAfter).toString()
    }
    if (paragraph.formatting.lineSpacing !== undefined) {
      spacingAttrs["w:line"] = toTwips(paragraph.formatting.lineSpacing).toString()
      spacingAttrs["w:lineRule"] = paragraph.formatting.lineSpacingRule || "auto"
    }
    if (Object.keys(spacingAttrs).length > 0) {
      pPrChildren.push(<w:spacing {...spacingAttrs} />)
    }

    // Add indentation
    const indAttrs: any = {}
    if (paragraph.formatting.leftIndent !== undefined) {
      indAttrs["w:left"] = toTwips(paragraph.formatting.leftIndent).toString()
    }
    if (paragraph.formatting.rightIndent !== undefined) {
      indAttrs["w:right"] = toTwips(paragraph.formatting.rightIndent).toString()
    }
    if (paragraph.formatting.firstLineIndent !== undefined) {
      indAttrs["w:firstLine"] = toTwips(paragraph.formatting.firstLineIndent).toString()
    }
    if (Object.keys(indAttrs).length > 0) {
      pPrChildren.push(<w:ind {...indAttrs} />)
    }

    if (pPrChildren.length > 0) {
      pChildren.push(<w:pPr>{pPrChildren}</w:pPr>)
    }
  }

  // Process character elements
  for (const charElement of paragraph.content) {
    pChildren.push(generateCharacterElement(model, charElement))
  }

  return <w:p>{pChildren}</w:p>
}

/** Generate run from RTFCharacterElement */
function generateCharacterElement(model: RTFDocumentModel, charElement: RTFCharacterElement): JSX.IntrinsicElements {
  const rChildren: JSX.IntrinsicElements[] = []

  // Add run properties if present
  if (charElement.formatting && Object.keys(charElement.formatting).length > 0) {
    const rPrChildren: JSX.IntrinsicElements[] = []

    // Font
    if (charElement.formatting.fontAlias) {
      const fontEntry = model.fontRegistry.get(charElement.formatting.fontAlias)
      const fontName = fontEntry?.item.name || "Times New Roman"
      rPrChildren.push(<w:rFonts w:ascii={fontName} w:hAnsi={fontName} />)
    }

    // Font size
    if (charElement.formatting.fontSize !== undefined) {
      rPrChildren.push(<w:sz w:val={toHalfPoints(charElement.formatting.fontSize).toString()} />)
      rPrChildren.push(<w:szCs w:val={toHalfPoints(charElement.formatting.fontSize).toString()} />)
    }

    // Bold
    if (charElement.formatting.bold) {
      rPrChildren.push(<w:b />)
    }

    // Italic
    if (charElement.formatting.italic) {
      rPrChildren.push(<w:i />)
    }

    // Underline
    if (charElement.formatting.underline) {
      const underlineVal = typeof charElement.formatting.underline === "string" ? charElement.formatting.underline : "single"
      rPrChildren.push(<w:u w:val={underlineVal} />)
    }

    // Color
    if (charElement.formatting.colorAlias) {
      const colorEntry = model.colorRegistry.get(charElement.formatting.colorAlias)
      rPrChildren.push(<w:color w:val={convertColorToHex(colorEntry.item)} />)
    }

    if (rPrChildren.length > 0) {
      rChildren.push(<w:rPr>{rPrChildren}</w:rPr>)
    }
  }

  // Process content elements
  for (const contentElement of charElement.content) {
    switch (contentElement.type) {
      case "text":
        rChildren.push(<w:t xml:space="preserve">{contentElement.text}</w:t>)
        break
      case "tab":
        rChildren.push(<w:tab />)
        break
      case "lineBreak":
        rChildren.push(<w:br />)
        break
      case "pageBreak":
        rChildren.push(<w:br w:type="page" />)
        break
      // Add more content element types as needed
      default:
        // Handle unknown content types gracefully
        rChildren.push(<w:t>[Unsupported content]</w:t>)
        break
    }
  }

  return <w:r>{rChildren}</w:r>
}

/** Generate table from RTFTableElement */
function generateTable(model: RTFDocumentModel, table: RTFTableElement): JSX.IntrinsicElements {
  const tblChildren: JSX.IntrinsicElements[] = []

  // Generate table properties
  const tblPrChildren: JSX.IntrinsicElements[] = []

  // Table width
  if (table.formatting.width !== undefined) {
    tblPrChildren.push(<w:tblW w:type="dxa" w:w={toTwips(table.formatting.width).toString()} />)
  } else {
    // Auto width
    tblPrChildren.push(<w:tblW w:type="auto" w:w="0" />)
  }

  // Table alignment
  if (table.formatting.align) {
    const alignMap: Record<typeof table.formatting.align, string> = {
      left: "left",
      center: "center",
      right: "right",
    }
    tblPrChildren.push(<w:jc w:val={alignMap[table.formatting.align]} />)
  }

  tblChildren.push(<w:tblPr>{tblPrChildren}</w:tblPr>)

  // Generate table grid (column definitions)
  if (table.columns && table.columns.length > 0) {
    const tblGridChildren: JSX.IntrinsicElements[] = []
    for (const column of table.columns) {
      if (column.width !== undefined) {
        tblGridChildren.push(<w:gridCol w:w={toTwips(column.width).toString()} />)
      } else {
        // Default column width
        tblGridChildren.push(<w:gridCol w:w="2000" />)
      }
    }
    tblChildren.push(<w:tblGrid>{tblGridChildren}</w:tblGrid>)
  }

  // Generate table rows
  for (const row of table.rows) {
    tblChildren.push(generateTableRow(model, row))
  }

  return <w:tbl>{tblChildren}</w:tbl>
}

/** Generate table row from RTFTableRow */
function generateTableRow(model: RTFDocumentModel, row: RTFTableRow): JSX.IntrinsicElements {
  const trChildren: JSX.IntrinsicElements[] = []

  // Generate row properties if present
  if (row.formatting && Object.keys(row.formatting).length > 0) {
    const trPrChildren: JSX.IntrinsicElements[] = []

    // Row height
    if (row.formatting.height !== undefined) {
      const heightTwips = toTwips(row.formatting.height)
      // Negative height means exact height, positive means minimum height
      const heightVal = heightTwips < 0 ? Math.abs(heightTwips) : heightTwips
      const heightRule = heightTwips < 0 ? "exact" : "atLeast"
      trPrChildren.push(<w:trHeight w:val={heightVal.toString()} w:hRule={heightRule} />)
    }

    if (trPrChildren.length > 0) {
      trChildren.push(<w:trPr>{trPrChildren}</w:trPr>)
    }
  }

  // Generate table cells
  for (const cell of row.cells) {
    trChildren.push(generateTableCell(model, cell))
  }

  return <w:tr>{trChildren}</w:tr>
}

/** Generate table cell from RTFTableCell */
function generateTableCell(model: RTFDocumentModel, cell: RTFTableCell): JSX.IntrinsicElements {
  const tcChildren: JSX.IntrinsicElements[] = []

  // Generate cell properties if present
  if (cell.formatting && Object.keys(cell.formatting).length > 0) {
    const tcPrChildren: JSX.IntrinsicElements[] = []

    // Cell width (if specified)
    // if (cell.formatting.width !== undefined) {
    //   tcPrChildren.push(<w:tcW w:type="dxa" w:w={toTwips(cell.formatting.width).toString()} />)
    // }

    // Horizontal merge (colspan)
    if (cell.formatting.hspan) {
      switch (cell.formatting.hspan) {
        case "first":
          // This is the first cell in a horizontal merge
          break
        case "next":
          // This cell continues the horizontal merge
          tcPrChildren.push(<w:hMerge w:val="continue" />)
          break
      }
    }

    // Vertical merge (rowspan)
    if (cell.formatting.vspan) {
      switch (cell.formatting.vspan) {
        case "first":
          tcPrChildren.push(<w:vMerge w:val="restart" />)
          break
        case "next":
          tcPrChildren.push(<w:vMerge w:val="continue" />)
          break
      }
    }

    if (tcPrChildren.length > 0) {
      tcChildren.push(<w:tcPr>{tcPrChildren}</w:tcPr>)
    }
  }

  // Generate cell content
  if (cell.content && cell.content.length > 0) {
    tcChildren.push(...generateElements(model, cell.content))
  } else {
    // Empty cell - add empty paragraph
    tcChildren.push(<w:p></w:p>)
  }

  return <w:tc>{tcChildren}</w:tc>
}

/** Generate section properties */
function generateSectionProperties(model: RTFDocumentModel, section: RTFSection): JSX.IntrinsicElements {
  const sectPrChildren: JSX.IntrinsicElements[] = []

  // Page size
  if (section.formatting.pageWidth !== undefined && section.formatting.pageHeight !== undefined) {
    sectPrChildren.push(<w:pgSz w:w={toTwips(section.formatting.pageWidth).toString()} w:h={toTwips(section.formatting.pageHeight).toString()} />)
  } else {
    // Default to A4 size
    sectPrChildren.push(<w:pgSz w:w="12240" w:h="15840" />)
  }

  // Page margins
  const marginAttrs: any = {}
  if (section.formatting.margin?.top !== undefined) {
    marginAttrs["w:top"] = toTwips(section.formatting.margin.top).toString()
  }
  if (section.formatting.margin?.right !== undefined) {
    marginAttrs["w:right"] = toTwips(section.formatting.margin.right).toString()
  }
  if (section.formatting.margin?.bottom !== undefined) {
    marginAttrs["w:bottom"] = toTwips(section.formatting.margin.bottom).toString()
  }
  if (section.formatting.margin?.left !== undefined) {
    marginAttrs["w:left"] = toTwips(section.formatting.margin.left).toString()
  }

  // Use defaults if no margins specified
  if (Object.keys(marginAttrs).length === 0) {
    marginAttrs["w:top"] = "1440"
    marginAttrs["w:right"] = "1440"
    marginAttrs["w:bottom"] = "1440"
    marginAttrs["w:left"] = "1440"
  }

  marginAttrs["w:header"] = "708"
  marginAttrs["w:footer"] = "708"
  marginAttrs["w:gutter"] = "0"

  sectPrChildren.push(<w:pgMar {...marginAttrs} />)

  return <w:sectPr>{sectPrChildren}</w:sectPr>
}

/** Generate main document */
function generateDocument(model: RTFDocumentModel): string {
  const bodyContent: JSX.IntrinsicElements[] = []

  // Generate all sections
  for (const [index, section] of model.sections.entries()) {
    // Add section break for subsequent sections
    if (index > 0) {
      // Add section break (page break in OOXML)
      bodyContent.push(
        <w:p>
          <w:pPr>
            <w:pageBreakBefore />
          </w:pPr>
        </w:p>
      )
    }

    // Generate the section content
    bodyContent.push(...generateSection(model, section))
  }

  // If no sections, add a default empty paragraph
  if (model.sections.length === 0) {
    bodyContent.push(<w:p></w:p>)
  }

  return (
    XML_HEADER +
    (
      <w:document
        xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
      >
        <w:body>{bodyContent}</w:body>
      </w:document>
    )
  )
}

/** Generate styles */
function generateStyles(model: RTFDocumentModel): string {
  const styles: JSX.IntrinsicElements[] = []

  for (const styleEntry of model.styleRegistry.entries()) {
    const style = styleEntry.item
    const styleId = styleEntry.name

    const styleChildren: JSX.IntrinsicElements[] = []

    // Add style name
    styleChildren.push(<w:name w:val={style.name || styleId} />)

    // Add qFormat for quick styles (assuming all styles are quick styles for now)
    styleChildren.push(<w:qFormat />)

    // Generate paragraph properties if present
    if (style.paragraphFormatting && Object.keys(style.paragraphFormatting).length > 0) {
      const pPrChildren: JSX.IntrinsicElements[] = []

      // Alignment
      if (style.paragraphFormatting.align) {
        const alignMap: Record<RTFParagraphFormatting["align"], string> = {
          left: "left",
          center: "center",
          right: "right",
          justify: "both",
          distribute: "distribute",
        }

        pPrChildren.push(<w:jc w:val={alignMap[style.paragraphFormatting.align]} />)
      }

      // Spacing
      const spacingAttrs: any = {}

      if (style.paragraphFormatting.spaceBefore !== undefined) {
        spacingAttrs["w:before"] = toTwips(style.paragraphFormatting.spaceBefore).toString()
      }
      if (style.paragraphFormatting.spaceAfter !== undefined) {
        spacingAttrs["w:after"] = toTwips(style.paragraphFormatting.spaceAfter).toString()
      }
      if (style.paragraphFormatting.lineSpacing !== undefined) {
        spacingAttrs["w:line"] = toTwips(style.paragraphFormatting.lineSpacing).toString()
        spacingAttrs["w:lineRule"] = style.paragraphFormatting.lineSpacingRule || "auto"
      }
      if (Object.keys(spacingAttrs).length > 0) {
        pPrChildren.push(<w:spacing {...spacingAttrs} />)
      }

      // Indentation
      const indAttrs: any = {}

      if (style.paragraphFormatting.leftIndent !== undefined) {
        indAttrs["w:left"] = toTwips(style.paragraphFormatting.leftIndent).toString()
      }
      if (style.paragraphFormatting.rightIndent !== undefined) {
        indAttrs["w:right"] = toTwips(style.paragraphFormatting.rightIndent).toString()
      }
      if (style.paragraphFormatting.firstLineIndent !== undefined) {
        indAttrs["w:firstLine"] = toTwips(style.paragraphFormatting.firstLineIndent).toString()
      }
      if (Object.keys(indAttrs).length > 0) {
        pPrChildren.push(<w:ind {...indAttrs} />)
      }

      if (pPrChildren.length > 0) {
        styleChildren.push(<w:pPr>{pPrChildren}</w:pPr>)
      }
    }

    // Generate character/run properties if present
    if (style.characterFormatting && Object.keys(style.characterFormatting).length > 0) {
      const rPrChildren: JSX.IntrinsicElements[] = []

      // Font
      if (style.characterFormatting.fontAlias) {
        // Look up the actual font name from the font registry
        const fontEntry = model.fontRegistry.get(style.characterFormatting.fontAlias)
        const fontName = fontEntry.item.name || "Times New Roman"

        rPrChildren.push(<w:rFonts w:ascii={fontName} w:hAnsi={fontName} />)
      }

      // Font size
      if (style.characterFormatting.fontSize !== undefined) {
        rPrChildren.push(<w:sz w:val={toHalfPoints(style.characterFormatting.fontSize).toString()} />)
        rPrChildren.push(<w:szCs w:val={toHalfPoints(style.characterFormatting.fontSize).toString()} />)
      }

      // Bold
      if (style.characterFormatting.bold) {
        rPrChildren.push(<w:b />)
      }

      // Italic
      if (style.characterFormatting.italic) {
        rPrChildren.push(<w:i />)
      }

      // Underline
      if (style.characterFormatting.underline) {
        const underlineVal = typeof style.characterFormatting.underline === "string" ? style.characterFormatting.underline : "single"

        rPrChildren.push(<w:u w:val={underlineVal} />)
      }

      // Color
      if (style.characterFormatting.colorAlias) {
        // Look up the actual color from the color registry
        const colorEntry = model.colorRegistry.get(style.characterFormatting.colorAlias)

        rPrChildren.push(<w:color w:val={convertColorToHex(colorEntry.item)} />)
      }

      if (rPrChildren.length > 0) {
        styleChildren.push(<w:rPr>{rPrChildren}</w:rPr>)
      }
    }

    styles.push(
      <w:style w:type={style.type} w:styleId={styleId}>
        {styleChildren}
      </w:style>
    )
  }

  return XML_HEADER + <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">{styles}</w:styles>
}

/** Generate font table */
function generateFontTable(model: RTFDocumentModel): string {
  const fonts: JSX.IntrinsicElements[] = []

  // Iterate through all registered fonts
  for (const fontEntry of model.fontRegistry.entries()) {
    const font = fontEntry.item

    // Create font element properties
    const fontProps: any = {}

    if (font.name) {
      fontProps["w:name"] = font.name
    }

    const fontChildren: JSX.IntrinsicElements[] = []

    // Add font family
    if (font.family) {
      fontChildren.push(<w:family w:val={font.family} />)
    }

    // Add font pitch
    if (font.pitch) {
      fontChildren.push(<w:pitch w:val={font.pitch} />)
    }

    // Add font signature - use defaults for now
    // In a full implementation, this would be based on the actual font characteristics
    // fontChildren.push(<w:sig w:usb="E0002AFF" w:usb1="C0007841" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000" />)

    // Add font alternate name if present
    if (font.falt) {
      fontChildren.push(<w:altName w:val={font.falt} />)
    }

    fonts.push(<w:font {...fontProps}>{fontChildren}</w:font>)
  }

  return (
    XML_HEADER +
    (
      <w:fonts
        xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
      >
        {fonts}
      </w:fonts>
    )
  )
}

/** Generate settings */
function generateSettings(model: RTFDocumentModel): string {
  const settings: JSX.IntrinsicElements[] = []

  // Zoom settings from viewSettings
  if (model.viewSettings.viewScale !== undefined) {
    settings.push(<w:zoom w:percent={model.viewSettings.viewScale.toString()} />)
  } else {
    settings.push(<w:zoom w:percent="100" />)
  }

  // Default tab width from typography settings - OOXML uses twentieths of a point
  const defaultTabTwips = toTwips(model.typography.defaultTabWidth, 720) // 720 twips = 0.5 inch default
  settings.push(<w:defaultTabStop w:val={defaultTabTwips.toString()} />)

  // Widow control from typography settings
  if (model.typography.widowControl !== undefined && !model.typography.widowControl) {
    settings.push(<w:noWidowControl />)
  }

  // Auto-hyphenation from typography settings
  if (model.typography.autoHyphenation !== undefined) {
    settings.push(<w:autoHyphenation w:val={model.typography.autoHyphenation ? "1" : "0"} />)
  }

  // Hyphenation consecutive limit
  if (model.typography.consecutiveHyphens !== undefined) {
    settings.push(<w:consecutiveHyphenLimit w:val={model.typography.consecutiveHyphens.toString()} />)
  }

  // Hyphenation hot zone - OOXML uses twentieths of a point
  if (model.typography.hyphenationHotZone !== undefined) {
    const hotZoneTwips = toTwips(model.typography.hyphenationHotZone)
    settings.push(<w:hyphenationZone w:val={hotZoneTwips.toString()} />)
  }

  // View kind settings
  if (model.viewSettings.viewKind !== undefined) {
    const viewKindMap: Record<typeof model.viewSettings.viewKind, string> = {
      none: "none",
      pageLayout: "print",
      outline: "outline",
      masterDocument: "masterPages",
      normal: "normal",
      online: "web",
    }
    settings.push(<w:view w:val={viewKindMap[model.viewSettings.viewKind]} />)
  }

  // View zoom kind settings
  if (model.viewSettings.viewZoomKind !== undefined) {
    const zoomKindMap: Record<typeof model.viewSettings.viewZoomKind, string> = {
      none: "none",
      fullPage: "fullPage",
      bestFit: "bestFit",
      textWidth: "textFit",
    }
    settings.push(<w:zoomPercent w:val={zoomKindMap[model.viewSettings.viewZoomKind]} />)
  }

  // Contextual spacing from typography settings
  if (model.typography.contextualSpacing !== undefined) {
    settings.push(<w:contextualSpacing w:val={model.typography.contextualSpacing ? "1" : "0"} />)
  }

  // Hyphenate caps from typography settings
  if (model.typography.hyphenateCaps !== undefined) {
    settings.push(<w:doNotHyphenateCaps w:val={model.typography.hyphenateCaps ? "0" : "1"} />)
  }

  // Compatibility settings
  settings.push(
    <w:compat>
      <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="12" />
    </w:compat>
  )

  return XML_HEADER + <w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">{settings}</w:settings>
}

/** Generate OOXML document from the given model */
export class OOXMLDocument extends AbstractDocument<Uint8Array> {
  /**
   * Create a new OOXML document
   */
  constructor(options: Partial<DocumentOptions> = {}) {
    super(options)
  }

  /**
   * Render the document to the desired output format (ZIP file as Uint8Array)
   */
  override render(options: Partial<OOXMLGenerationOptions> = {}): Uint8Array {
    // Create all the required files for the OOXML package
    const files: Record<string, Uint8Array> = {}
    const encoder = new TextEncoder()

    // Required files
    files["[Content_Types].xml"] = encoder.encode(generateContentTypes(this.model))
    files["docProps/core.xml"] = encoder.encode(generateCoreProps(this.model, options))
    files["docProps/app.xml"] = encoder.encode(generateAppProps(this.model, options))
    files["_rels/.rels"] = encoder.encode(generatePackageRels(this.model))
    files["word/_rels/document.xml.rels"] = encoder.encode(generateDocumentRels(this.model))
    files["word/document.xml"] = encoder.encode(generateDocument(this.model))
    files["word/styles.xml"] = encoder.encode(generateStyles(this.model))
    files["word/settings.xml"] = encoder.encode(generateSettings(this.model))
    files["word/fontTable.xml"] = encoder.encode(generateFontTable(this.model))

    // Create ZIP file
    return zipSync(files)
  }
}
