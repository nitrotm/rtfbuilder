import { RichTextDocumentModel } from "../document"

import { OOXMLGenerationOptions } from "."
import { convertColorToHex, XML_HEADER } from "./base"
import { generateSection } from "./section"
import { RTFParagraphFormatting, RTFViewSettings } from "../types"
import { toHalfPoints, toTwips } from "../utils"

/** Generate core properties */
export function generateCoreProps(_model: RichTextDocumentModel, options: Partial<OOXMLGenerationOptions>): string {
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

/** Generate main document */
export function generateDocument(model: RichTextDocumentModel): string {
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
    bodyContent.push(...generateSection(model, section))
  }

  // If no sections, add a default empty paragraph
  if (bodyContent.length === 0) {
    bodyContent.push(<w:p></w:p>)
  }

  return (
    XML_HEADER +
    (
      <w:document xmlns:w="http://purl.oclc.org/ooxml/wordprocessingml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships">
        <w:body>{bodyContent}</w:body>
      </w:document>
    )
  )
}

/** Generate styles */
export function generateStyles(model: RichTextDocumentModel): string {
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

      // Spacing
      const spacingAttrs: Partial<JSX.IntrinsicElements["w:spacing"]> = {}

      if (style.paragraphFormatting.spaceBefore !== undefined) {
        spacingAttrs["w:before"] = toTwips(style.paragraphFormatting.spaceBefore)
      }
      if (style.paragraphFormatting.spaceAfter !== undefined) {
        spacingAttrs["w:after"] = toTwips(style.paragraphFormatting.spaceAfter)
      }
      if (style.paragraphFormatting.lineSpacing !== undefined) {
        spacingAttrs["w:line"] = toTwips(style.paragraphFormatting.lineSpacing)
        spacingAttrs["w:lineRule"] = style.paragraphFormatting.lineSpacingRule || "auto"
      }
      if (Object.keys(spacingAttrs).length > 0) {
        pPrChildren.push(<w:spacing {...spacingAttrs} />)
      }

      // Indentation
      const indAttrs: Partial<JSX.IntrinsicElements["w:ind"]> = {}

      if (style.paragraphFormatting.leftIndent !== undefined || style.paragraphFormatting.firstLineIndent !== undefined) {
        let leftIndent = toTwips(style.paragraphFormatting.leftIndent)
        let firstLineIndent = toTwips(style.paragraphFormatting.firstLineIndent)

        indAttrs["w:start"] = leftIndent
        if (firstLineIndent < 0) {
          indAttrs["w:hanging"] = Math.abs(firstLineIndent)
        } else {
          indAttrs["w:firstLine"] = firstLineIndent
        }
      }
      if (style.paragraphFormatting.rightIndent !== undefined) {
        indAttrs["w:end"] = toTwips(style.paragraphFormatting.rightIndent)
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
        rPrChildren.push(<w:sz w:val={toHalfPoints(style.characterFormatting.fontSize)} />)
        rPrChildren.push(<w:szCs w:val={toHalfPoints(style.characterFormatting.fontSize)} />)
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

  return XML_HEADER + <w:styles xmlns:w="http://purl.oclc.org/ooxml/wordprocessingml/main">{styles}</w:styles>
}

/** Generate font table */
export function generateFontTable(model: RichTextDocumentModel): string {
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
      <w:fonts xmlns:w="http://purl.oclc.org/ooxml/wordprocessingml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships">
        {fonts}
      </w:fonts>
    )
  )
}

/** Generate settings */
export function generateSettings(model: RichTextDocumentModel): string {
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

  settings.push(<w:zoom w:val={zoomKindMap[model.viewSettings.viewZoomKind || "none"]} w:percent={`${model.viewSettings.viewScale || 100}%`} />)
  if (model.typography.defaultTabWidth !== undefined) {
    settings.push(<w:defaultTabStop w:val={toTwips(model.typography.defaultTabWidth)} />)
  }
  if (model.typography.autoHyphenation) {
    settings.push(<w:autoHyphenation />)
  }
  if (model.typography.consecutiveHyphens !== undefined) {
    settings.push(<w:consecutiveHyphenLimit w:val={model.typography.consecutiveHyphens} />)
  }
  if (model.typography.hyphenationHotZone !== undefined) {
    settings.push(<w:hyphenationZone w:val={toTwips(model.typography.hyphenationHotZone)} />)
  }

  // Hyphenate caps from typography settings
  if (model.typography.hyphenateCaps !== undefined && !model.typography.hyphenateCaps) {
    settings.push(<w:doNotHyphenateCaps />)
  }

  // View zoom kind settings
  // Contextual spacing from typography settings
  // if (model.typography.contextualSpacing) {
  //   settings.push(<w:contextualSpacing />)
  // }
  // if (model.typography.widowControl !== undefined && !model.typography.widowControl) {
  //   settings.push(<w:widowControl />)
  // }

  // Compatibility settings
  settings.push(
    <w:compat>
      <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="12" />
    </w:compat>
  )

  return XML_HEADER + <w:settings xmlns:w="http://purl.oclc.org/ooxml/wordprocessingml/main">{settings}</w:settings>
}
