import { RTFDocumentModel } from "lib/document"
import { RTFSection, RTFSectionFormatting } from "lib/types"
import { toTwips } from "lib/utils"

import { generateElements, SectionGeometry } from "./base"

/** Generate section formatting control words */
export function generateSectionFormatting(model: RTFDocumentModel, formatting: Partial<RTFSectionFormatting> = {}): [string, SectionGeometry] {
  const parts: string[] = []

  // Section break type
  if (formatting.sectionBreak) {
    const breakMap: Record<RTFSectionFormatting["sectionBreak"], string> = {
      column: "\\sbkcol",
      nextPage: "\\sbknextpage",
      evenPage: "\\sbkeven",
      oddPage: "\\sbkodd",
      none: "",
    }

    parts.push(breakMap[formatting.sectionBreak])
  }

  // Paper dimensions
  const pageWidth: number = toTwips(
    formatting.pageWidth ?? (formatting.landscape !== model.pageSetup.landscape ? model.pageSetup.paperHeight : model.pageSetup.paperWidth)
  )
  const pageHeight: number = toTwips(
    formatting.pageHeight ?? (formatting.landscape !== model.pageSetup.landscape ? model.pageSetup.paperWidth : model.pageSetup.paperHeight)
  )

  parts.push(`\\pgwsxn${pageWidth}`)
  parts.push(`\\pghsxn${pageHeight}`)

  // Margins
  const marginLeft: number = toTwips(formatting.margin?.left ?? model.pageSetup.margin?.left)
  const marginRight: number = toTwips(formatting.margin?.right ?? model.pageSetup.margin?.right)
  const marginTop: number = toTwips(formatting.margin?.top ?? model.pageSetup.margin?.top)
  const marginBottom: number = toTwips(formatting.margin?.bottom ?? model.pageSetup.margin?.bottom)

  parts.push(`\\marglsxn${marginLeft}`)
  parts.push(`\\margrsxn${marginRight}`)
  parts.push(`\\margtsxn${marginTop}`)
  parts.push(`\\margbsxn${marginBottom}`)

  // Gutter
  const gutter: number = toTwips(formatting.gutter ?? model.pageSetup.gutter)

  parts.push(`\\guttersxn${gutter}`)

  // Page options
  if (formatting.landscape) parts.push("\\lndscpsxn")

  // Header and footer distances
  if (formatting.headerDistance !== undefined) parts.push(`\\headery${toTwips(formatting.headerDistance)}`)
  if (formatting.footerDistance !== undefined) parts.push(`\\footery${toTwips(formatting.footerDistance)}`)

  // Vertical text alignment
  if (formatting.valign !== undefined) {
    const alignMap: Record<RTFSectionFormatting["valign"], string> = {
      top: "\\vertalt",
      center: "\\vertalc",
      bottom: "\\vertalb",
      justified: "\\vertalj",
    }

    parts.push(alignMap[formatting.valign])
  }

  // Column layout
  if (formatting.columnCount !== undefined) {
    parts.push(`\\cols${formatting.columnCount}`)
    if (formatting.columnSpacing !== undefined) {
      parts.push(`\\colsx${toTwips(formatting.columnSpacing)}`)
    }
    if (formatting.lineBetweenColumns) {
      parts.push("\\linebetcol")
    }
  }

  // Page numbering
  if (formatting.pageNumberStart !== undefined) parts.push(`\\pgnstarts${formatting.pageNumberStart}`)
  if (formatting.pageNumberRestart !== undefined) parts.push(formatting.pageNumberRestart ? "\\pgnrestart" : "\\pgncont")
  if (formatting.pageNumberFormat !== undefined) {
    const formatMap: Record<RTFSectionFormatting["pageNumberFormat"], string> = {
      decimal: "\\pgndec",
      upperRoman: "\\pgnucrm",
      lowerRoman: "\\pgnlcrm",
      upperLetter: "\\pgnucltr",
      lowerLetter: "\\pgnlcltr",
    }

    parts.push(formatMap[formatting.pageNumberFormat])
  }

  // Include endnotes in this section
  if (formatting.endnotesHere) parts.push("\\endnhere")
  if (formatting.suppressEndnotes) parts.push("\\noendnotes")

  // Title page
  if (formatting.titlePage) parts.push("\\titlepg")

  return [
    parts.join(""),
    {
      pageWidth,
      pageHeight,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      gutter,
      contentWidth: pageWidth - marginLeft - marginRight - gutter,
      contentHeight: pageHeight - marginTop - marginBottom,
    },
  ]
}

/** Generate a document section */
export function generateSection(model: RTFDocumentModel, section: RTFSection): string {
  const parts: string[] = []
  const formatting = section.formatting

  // Section preamble
  const [sectionFormattingData, geometry] = generateSectionFormatting(model, formatting)

  parts.push("\\sectd")
  if (sectionFormattingData.length > 0) parts.push(sectionFormattingData)

  // Generate headers / footers
  if (formatting.titlePage && section.firstHeader) {
    parts.push("{\\headerf ")
    parts.push(generateElements(model, geometry, section.firstHeader, "\n", true))
    parts.push("}")
  }
  if (formatting.titlePage && section.firstFooter) {
    parts.push("{\\footerf ")
    parts.push(generateElements(model, geometry, section.firstFooter, "\n", true))
    parts.push("}")
  }
  if (section.header) {
    parts.push("{\\headerl ")
    parts.push(generateElements(model, geometry, section.evenHeader || section.header, "\n", true))
    parts.push("}")
    parts.push("{\\headerr ")
    parts.push(generateElements(model, geometry, section.header, "\n", true))
    parts.push("}")
  }
  if (section.footer) {
    parts.push("{\\footerl ")
    parts.push(generateElements(model, geometry, section.evenFooter || section.footer, "\n", true))
    parts.push("}")
    parts.push("{\\footerr ")
    parts.push(generateElements(model, geometry, section.footer, "\n", true))
    parts.push("}")
  }

  // Generate the section content
  const data = generateElements(model, geometry, section.content, "\n", true)

  if (parts.length > 0 && data.length > 0 && !data.startsWith("\\") && !data.startsWith("{")) parts.push(" ")
  parts.push(data)

  return parts.join("")
}
