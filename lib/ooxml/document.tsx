import { DEFAULT_FONT_ALIAS, DEFAULT_PARAGRAPH_STYLE_ALIAS, DEFAULT_TAB_WIDTH } from "../document"

import { OOXMLGenerationOptions } from "."
import {
  convertColorToHex,
  CORE_PROPERTIES_NS,
  DC_ELEMENTS_NS,
  DC_TERMS_NS,
  DCMI_TYPE_NS,
  OOXMLDocumentModel,
  RELATIONSHIPS_OFFICE_DOCUMENT_NS,
  SectionGeometry,
  WORDPROCESSINGML_MAIN_NS,
  XML_STANDALONE_HEADER,
} from "./base"
import { generateSection } from "./section"
import { RTFListLevel, RTFPageSetup, RTFParagraphFormatting, RTFViewSettings } from "../types"
import { pt, toHalfPoint, toTwip } from "../utils"
import { generateParagraph } from "./paragraph"

/** Generate core properties */
export function generateCoreProps(_model: OOXMLDocumentModel, options: Partial<OOXMLGenerationOptions>): string {
  const now = new Date().toISOString()

  return (
    XML_STANDALONE_HEADER +
    (
      <cp:coreProperties
        xmlns:cp={CORE_PROPERTIES_NS}
        xmlns:dc={DC_ELEMENTS_NS}
        xmlns:dcterms={DC_TERMS_NS}
        xmlns:dcmitype={DCMI_TYPE_NS}
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      >
        <dc:creator>{options.creator}</dc:creator>
        <dc:description>{options.description}</dc:description>
        <dc:language>en-US</dc:language>
        <dc:subject>{options.subject}</dc:subject>
        <dc:title>{options.title}</dc:title>
        <cp:lastModifiedBy />
        <cp:revision>0</cp:revision>
        <cp:keywords>{options.keywords}</cp:keywords>
        <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
        <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
      </cp:coreProperties>
    )
  )
}

/** Generate main document */
export function generateDocument(model: OOXMLDocumentModel): string {
  const bodyContent: JSX.IntrinsicElements[] = []

  // Generate all sections
  for (const [index, section] of model.sections.entries()) {
    if (index > 0) {
      bodyContent.push(
        <w:p>
          <w:pPr>
            <w:pageBreakBefore />
          </w:pPr>
        </w:p>
      )
    }

    // Generate the section content
    bodyContent.push(...generateSection(model, section, index))
  }

  // If no sections, add a default empty paragraph
  if (bodyContent.length === 0) {
    bodyContent.push(
      <w:p>
        <w:r></w:r>
      </w:p>
    )
    // TODO: Add default section properties (page size, margins, etc.)
    // bodyContent.push(
    //   <w:sectPr>
    //   </w:sectPr>
    // )
  }

  return (
    XML_STANDALONE_HEADER +
    (
      <w:document xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS} xmlns:w={WORDPROCESSINGML_MAIN_NS}>
        <w:body>{bodyContent}</w:body>
      </w:document>
    )
  )
}

/** Generate styles */
export function generateStyles(model: OOXMLDocumentModel): string {
  const styles: JSX.IntrinsicElements[] = []
  const defaultFont = model.fontRegistry.get(DEFAULT_FONT_ALIAS)
  const defaultFontName = defaultFont?.item?.name || "Times New Roman"

  styles.push(
    <w:docDefaults>
      <w:rPrDefault>
        <w:rPr>
          <w:rFonts w:ascii={defaultFontName} w:hAnsi={defaultFontName} />
          <w:kern w:val={2} />
          <w:sz w:val={toHalfPoint(pt(12))} />
          <w:szCs w:val={toHalfPoint(pt(12))} />
          <w:lang w:val="en-US" />
        </w:rPr>
      </w:rPrDefault>
      <w:pPrDefault>
        <w:pPr>
          <w:suppressAutoHyphens />
        </w:pPr>
      </w:pPrDefault>
    </w:docDefaults>
  )

  for (const styleEntry of model.styleRegistry.entries()) {
    const style = styleEntry.item
    const styleChildren: JSX.IntrinsicElements[] = []

    // Add style name
    styleChildren.push(<w:name w:val={style.name || styleEntry.name} />)
    styleChildren.push(<w:basedOn w:val={style.baseStyleAlias || DEFAULT_PARAGRAPH_STYLE_ALIAS} />)
    styleChildren.push(<w:next w:val={style.nextStyleAlias || styleEntry.name} />)

    // Add qFormat for quick styles (assuming all styles are quick styles for now)
    styleChildren.push(<w:qFormat />)

    // Generate paragraph properties if present
    if (style.paragraphFormatting && Object.keys(style.paragraphFormatting).length > 0) {
      const pPrChildren: JSX.IntrinsicElements[] = []

      // Spacing
      const spacingAttrs: Partial<Exclude<JSX.IntrinsicElements["w:spacing"], { "w:val"?: number }>> = {}

      if (style.paragraphFormatting.spaceBefore !== undefined) {
        spacingAttrs["w:before"] = toTwip(style.paragraphFormatting.spaceBefore)
      }
      if (style.paragraphFormatting.spaceAfter !== undefined) {
        spacingAttrs["w:after"] = toTwip(style.paragraphFormatting.spaceAfter)
      }
      if (style.paragraphFormatting.lineSpacing !== undefined) {
        spacingAttrs["w:line"] = toTwip(style.paragraphFormatting.lineSpacing)
        spacingAttrs["w:lineRule"] = style.paragraphFormatting.lineSpacingRule || "auto"
      }
      if (Object.keys(spacingAttrs).length > 0) {
        pPrChildren.push(<w:spacing {...spacingAttrs} />)
      }

      // Indentation
      const indAttrs: Partial<JSX.IntrinsicElements["w:ind"]> = {}

      if (style.paragraphFormatting.leftIndent !== undefined || style.paragraphFormatting.firstLineIndent !== undefined) {
        let leftIndent = toTwip(style.paragraphFormatting.leftIndent)
        let firstLineIndent = toTwip(style.paragraphFormatting.firstLineIndent)

        indAttrs["w:start"] = leftIndent
        if (firstLineIndent < 0) {
          indAttrs["w:hanging"] = Math.abs(firstLineIndent)
        } else {
          indAttrs["w:firstLine"] = firstLineIndent
        }
      }
      if (style.paragraphFormatting.rightIndent !== undefined) {
        indAttrs["w:end"] = toTwip(style.paragraphFormatting.rightIndent)
      }
      if (Object.keys(indAttrs).length > 0) {
        pPrChildren.push(<w:ind {...indAttrs} />)
      }

      // Alignment
      if (style.paragraphFormatting.align) {
        const alignMap: Record<RTFParagraphFormatting["align"], string> = {
          left: "start",
          center: "center",
          right: "end",
          justify: "both",
          distribute: "distribute",
        }

        pPrChildren.push(<w:jc w:val={alignMap[style.paragraphFormatting.align]} />)
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
        rPrChildren.push(<w:sz w:val={toHalfPoint(style.characterFormatting.fontSize)} />)
        rPrChildren.push(<w:szCs w:val={toHalfPoint(style.characterFormatting.fontSize)} />)
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
      <w:style w:type={style.type || "paragraph"} w:styleId={styleEntry.name}>
        {styleChildren}
      </w:style>
    )
  }

  return XML_STANDALONE_HEADER + <w:styles xmlns:w={WORDPROCESSINGML_MAIN_NS}>{styles}</w:styles>
}

/** Generate font table */
export function generateFontTable(model: OOXMLDocumentModel): string {
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

    // <w:charset w:val="00" w:characterSet="windows-1252" />
    // <w:charset w:val="01" w:characterSet="utf-8" />
    // <w:charset w:val="02" />

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
    XML_STANDALONE_HEADER +
    (
      <w:fonts xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS} xmlns:w={WORDPROCESSINGML_MAIN_NS}>
        {fonts}
      </w:fonts>
    )
  )
}

/** Generate settings */
export function generateSettings(model: OOXMLDocumentModel): string {
  const settings: JSX.IntrinsicElements[] = []

  const viewKindMap: Record<RTFViewSettings["viewKind"], string> = {
    none: "none",
    pageLayout: "print",
    outline: "outline",
    masterDocument: "masterPages",
    normal: "normal",
    online: "web",
  }

  settings.push(<w:view w:val={viewKindMap[model.viewSettings.viewKind || "normal"]} />)

  const zoomKindMap: Record<RTFViewSettings["viewZoomKind"], JSX.IntrinsicElements["w:zoom"]["w:val"]> = {
    none: "none",
    fullPage: "fullPage",
    bestFit: "bestFit",
    textWidth: "textFit",
  }

  settings.push(
    <w:zoom
      w:val={model.viewSettings.viewZoomKind !== undefined ? zoomKindMap[model.viewSettings.viewZoomKind] : undefined}
      w:percent={`${model.viewSettings.viewScale || 100}%`}
    />
  )

  if (model.pageSetup.marginMirror) {
    settings.push(<w:mirrorMargins />)
  }
  settings.push(<w:defaultTabStop w:val={toTwip(model.typography.tabWidth || DEFAULT_TAB_WIDTH)} />)
  if (model.typography.autoHyphenation) {
    settings.push(<w:autoHyphenation />)
  }
  if (model.typography.consecutiveHyphens !== undefined) {
    settings.push(<w:consecutiveHyphenLimit w:val={model.typography.consecutiveHyphens} />)
  }
  if (model.typography.hyphenationHotZone !== undefined) {
    settings.push(<w:hyphenationZone w:val={toTwip(model.typography.hyphenationHotZone)} />)
  }
  if (model.typography.hyphenateCaps !== undefined && !model.typography.hyphenateCaps) {
    settings.push(<w:doNotHyphenateCaps />)
  }
  if (model.pageSetup.facingPages) {
    settings.push(<w:evenAndOddHeaders />)
  }

  const footnoteFormatMap: Record<RTFPageSetup["footnoteNumbering"], string> = {
    decimal: "decimal",
    lowercase: "lowerLetter",
    uppercase: "upperLetter",
    lowerRoman: "lowerRoman",
    upperRoman: "upperRoman",
    chicago: "symbol",
  }
  const footnoteRestartMap: Record<RTFPageSetup["footnoteRestart"], string> = {
    continuous: "continuous",
    page: "eachPage",
    section: "eachSection",
  }
  const footnotePositionMap: Record<RTFPageSetup["footnotePosition"], string> = {
    bottom: "pageBottom",
    beneath: "beneathText",
    section: "sectEnd",
    document: "docEnd",
  }

  settings.push(
    <w:footnotePr>
      <w:pos w:val={footnotePositionMap[model.pageSetup.footnotePosition || "bottom"]} />
      <w:numFmt w:val={footnoteFormatMap[model.pageSetup.footnoteNumbering || "decimal"]} />
      <w:numStart w:val={model.pageSetup.footnoteStartNumber || 1} />
      <w:numRestart w:val={footnoteRestartMap[model.pageSetup.footnoteRestart || "continuous"]} />
    </w:footnotePr>
  )
  settings.push(
    <w:endnotePr>
      <w:pos w:val="docEnd" />
      <w:numFmt w:val={footnoteFormatMap[model.pageSetup.endnoteNumbering || "decimal"]} />
      <w:numStart w:val={model.pageSetup.endnoteStartNumber || 1} />
      <w:numRestart w:val="continuous" />
    </w:endnotePr>
  )

  // Compatibility settings
  settings.push(
    <w:compat>
      <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="12" />
    </w:compat>
  )

  return XML_STANDALONE_HEADER + <w:settings xmlns:w={WORDPROCESSINGML_MAIN_NS}>{settings}</w:settings>
}

/** Generate list numbering */
export function generateNumbering(model: OOXMLDocumentModel): string {
  const children: JSX.IntrinsicElements[] = []

  for (const entry of model.listRegistry.entries()) {
    const list = entry.item
    const levels: JSX.IntrinsicElements[] = []

    list.levels.forEach((level, levelIndex) => {
      const formattingChildren: JSX.IntrinsicElements[] = []
      const indAttrs: Partial<JSX.IntrinsicElements["w:ind"]> = {}
      const tabWidth = toTwip(model.typography.tabWidth || DEFAULT_TAB_WIDTH)
      const leftIndent = toTwip(level.leftIndent, tabWidth * (1 + levelIndex / 2))
      const firstLineIndent = toTwip(level.firstLineIndent, -tabWidth / 2)

      formattingChildren.push(
        <w:tabs>
          <w:tab w:val="num" w:pos={0} />
        </w:tabs>
      )

      indAttrs["w:start"] = leftIndent
      if (firstLineIndent < 0) {
        indAttrs["w:hanging"] = Math.abs(firstLineIndent)
      } else {
        indAttrs["w:firstLine"] = firstLineIndent
      }
      formattingChildren.push(<w:ind {...indAttrs} />)

      // Numbering format
      const levelChildren: JSX.IntrinsicElements[] = []

      levelChildren.push(<w:start w:val={level.startAt || 1} />)

      const numFmtMap: Record<RTFListLevel["format"], string> = {
        none: "none",
        decimal: "decimal",
        bullet: "bullet",
      }

      levelChildren.push(<w:numFmt w:val={numFmtMap[level.format]} />)

      switch (level.format) {
        case "decimal":
          levelChildren.push(<w:lvlText w:val={`%${levelIndex + 1}.`} />)
          break
        case "bullet":
          if (levelIndex === 0) {
            levelChildren.push(<w:lvlText w:val="&#x2022;" />)
          } else if (levelIndex === 1) {
            levelChildren.push(<w:lvlText w:val="&#x25E6;" />)
          } else if (levelIndex === 2) {
            levelChildren.push(<w:lvlText w:val="&#x25AA;" />)
          } else if (levelIndex === 3) {
            levelChildren.push(<w:lvlText w:val="&#x25AB;" />)
          } else {
            levelChildren.push(<w:lvlText w:val="&#x2022;" />)
          }
          break
        case "none":
          break
      }

      const alignMap: Record<Exclude<RTFListLevel["justification"], undefined>, string> = {
        left: "start",
        center: "center",
        right: "end",
      }

      levelChildren.push(<w:lvlJc w:val={alignMap[level.justification || "left"]} />)
      levelChildren.push(<w:pPr>{formattingChildren}</w:pPr>)
      // levelChildren.push(
      //   <w:rPr>
      //     <w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:cs="Symbol" w:hint="default" />
      //   </w:rPr>
      // )

      levels.push(<w:lvl w:ilvl={levelIndex}>{levelChildren}</w:lvl>)
    })
    children.push(<w:abstractNum w:abstractNumId={entry.index}>{levels}</w:abstractNum>)
  }
  for (const entry of model.listRegistry.entries()) {
    children.push(
      <w:num w:numId={entry.index}>
        <w:abstractNumId w:val={entry.index} />
      </w:num>
    )
  }

  return (
    XML_STANDALONE_HEADER +
    (
      <w:numbering xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS} xmlns:w={WORDPROCESSINGML_MAIN_NS}>
        {children}
      </w:numbering>
    )
  )
}

/** Generate list numbering */
export function generateFootnotes(model: OOXMLDocumentModel): string {
  const children: JSX.IntrinsicElements[] = []
  const pageWidth: number = toTwip(model.pageSetup.paperWidth)
  const pageHeight: number = toTwip(model.pageSetup.paperHeight)
  const marginLeft: number = toTwip(model.pageSetup.margin?.left)
  const marginRight: number = toTwip(model.pageSetup.margin?.right)
  const marginTop: number = toTwip(model.pageSetup.margin?.top)
  const marginBottom: number = toTwip(model.pageSetup.margin?.bottom)
  const gutter = toTwip(model.pageSetup.gutter)
  const geometry: SectionGeometry = {
    pageWidth,
    pageHeight,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    gutter,
    contentWidth: pageWidth - marginLeft - marginRight - gutter,
    contentHeight: pageHeight - marginTop - marginBottom,
  }

  children.push(
    <w:footnote w:id={0} w:type="separator">
      <w:p>
        <w:r />
      </w:p>
    </w:footnote>,
    <w:footnote w:id={1} w:type="continuationSeparator">
      <w:p>
        <w:r />
      </w:p>
    </w:footnote>
  )
  for (const entry of model.footnoteRegistry.entries()) {
    children.push(<w:footnote w:id={entry.index}>{generateParagraph(model, geometry, entry.item.content)}</w:footnote>)
  }
  return XML_STANDALONE_HEADER + <w:footnotes xmlns:w={WORDPROCESSINGML_MAIN_NS}>{children}</w:footnotes>
}

/** Generate list numbering */
export function generateEndnotes(model: OOXMLDocumentModel): string {
  const children: JSX.IntrinsicElements[] = []
  const pageWidth: number = toTwip(model.pageSetup.paperWidth)
  const pageHeight: number = toTwip(model.pageSetup.paperHeight)
  const marginLeft: number = toTwip(model.pageSetup.margin?.left)
  const marginRight: number = toTwip(model.pageSetup.margin?.right)
  const marginTop: number = toTwip(model.pageSetup.margin?.top)
  const marginBottom: number = toTwip(model.pageSetup.margin?.bottom)
  const gutter = toTwip(model.pageSetup.gutter)
  const geometry: SectionGeometry = {
    pageWidth,
    pageHeight,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    gutter,
    contentWidth: pageWidth - marginLeft - marginRight - gutter,
    contentHeight: pageHeight - marginTop - marginBottom,
  }

  children.push(
    <w:endnote w:id={0} w:type="separator">
      <w:p>
        <w:r />
      </w:p>
    </w:endnote>,
    <w:endnote w:id={1} w:type="continuationSeparator">
      <w:p>
        <w:r />
      </w:p>
    </w:endnote>
  )
  for (const entry of model.endnoteRegistry.entries()) {
    children.push(<w:endnote w:id={entry.index}>{generateParagraph(model, geometry, entry.item.content)}</w:endnote>)
  }
  return XML_STANDALONE_HEADER + <w:endnotes xmlns:w={WORDPROCESSINGML_MAIN_NS}>{children}</w:endnotes>
}
