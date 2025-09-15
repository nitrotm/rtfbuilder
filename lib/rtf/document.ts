import { DEFAULT_TAB_WIDTH, RichTextDocumentModel } from "../document"
import {
  RTFCharset,
  RTFColumnBreakElement,
  RTFElement,
  RTFFont,
  RTFListLevel,
  RTFPageSetup,
  RTFSection,
  RTFStyle,
  RTFTypographySettings,
  RTFViewSettings,
} from "../types"
import { toTwip } from "../utils"

import { RTFGenerationOptions } from "."
import { escapeRTFText, generateTimestamp } from "./base"
import { generateCharacterFormatting } from "./character"
import { generateParagraphFormatting } from "./paragraph"
import { generateSectionFormatting } from "./section"

/** Generate borders control words */
export function generateCharset(charset: RTFCharset): string {
  switch (charset) {
    case "ansi":
      return "\\ansi"
    case "mac":
      return "\\mac"
    case "pc":
      return "\\pc"
    case "pca":
      return "\\pca"
  }
}

/** Generate border control words for all sides */
export function generateFontTable(model: RichTextDocumentModel): string {
  const parts = ["{\\fonttbl"]

  for (const entry of model.fontRegistry.entries()) {
    const font = entry.item

    parts.push(`{\\f${entry.index}`)

    // Font family
    if (font.family !== undefined) parts.push(`\\${font.family}`)

    // Character set
    if (font.charset !== undefined) parts.push(`\\fcharset${font.charset}`)

    // Font pitch
    if (font.pitch !== undefined) {
      const pitchMap: Record<Exclude<RTFFont["pitch"], undefined>, number> = { default: 0, fixed: 1, variable: 2 }

      parts.push(`\\fprq${pitchMap[font.pitch]}`)
    }

    // Font alternate name
    if (font.falt !== undefined) parts.push(`{\\*\\falt ${font.falt}}`)

    // Font name
    parts.push(` ${font.name || entry.name};}`)
  }

  parts.push("}\n")
  return parts.join("")
}

/** Generate color table */
export function generateColorTable(model: RichTextDocumentModel): string {
  const parts = ["{\\colortbl;"] // First entry is always empty (auto color)

  for (const entry of model.colorRegistry.entries()) {
    const color = entry.item

    if (entry.index === 0) continue // Skip auto color
    parts.push(`\\red${color.red}\\green${color.green}\\blue${color.blue};`)
  }

  parts.push("}\n")
  return parts.join("")
}

/** Generate style table */
export function generateStyleTable(model: RichTextDocumentModel): string {
  const parts = ["{\\stylesheet"]

  for (const entry of model.styleRegistry.entries()) {
    const style = entry.item

    parts.push("{")

    // Style type and ID
    const typeMap: Record<RTFStyle["type"], string> = {
      character: `\\*\\cs${entry.index}`,
      paragraph: `\\s${entry.index}`,
      section: `\\*\\ds${entry.index}`,
    }

    parts.push(typeMap[style.type || "paragraph"])

    // Character formatting
    if (style.type === "character" || style.type === "paragraph") {
      parts.push(generateCharacterFormatting(model, style.characterFormatting || {}))
    }

    // Paragraph formatting
    if (style.type === "paragraph") {
      parts.push(generateParagraphFormatting(model, style.paragraphFormatting || {}))
    }

    // Section formatting
    if (style.type === "section") {
      parts.push(generateSectionFormatting(model, style.sectionFormatting || {})[0])
    }

    // Style references
    parts.push(`\\sbasedon${style.baseStyleAlias !== undefined ? model.styleRegistry.index(style.baseStyleAlias) : 0}`)

    // Next style reference
    parts.push(`\\snext${model.styleRegistry.index(style.nextStyleAlias || entry.name)}`)

    // Style name
    parts.push(` ${style.name || entry.name};}`)
  }

  parts.push("}\n")
  return parts.join("")
}

/** Generate list table */
export function generateListTable(model: RichTextDocumentModel): string {
  const parts = []

  parts.push("{\\*\\listtable")
  for (const entry of model.listRegistry.entries()) {
    const list = entry.item
    const levels = list.levels || []

    parts.push("{\\list")
    if (list.restartEachSection) parts.push("\\listrestarthdn1")
    for (let i = 0; i < Math.min(9, levels.length); i++) {
      parts.push("{\\listlevel", generateListLevel(model, levels[i], i), "}\n")
    }
    parts.push(`\\listid${entry.index}`)
    parts.push("}\n")
  }
  parts.push("}\n")

  parts.push("{\\*\\listoverridetable")
  for (const entry of model.listRegistry.entries()) {
    parts.push("{\\listoverride")
    parts.push(`\\listid${entry.index}`)
    parts.push(`\\listoverridecount0`)
    parts.push(`\\ls${entry.index}`)
    parts.push("}")
  }
  parts.push("}\n")

  return parts.join("")
}

/** Generate a single list level */
export function generateListLevel(model: RichTextDocumentModel, level: RTFListLevel, levelIndex: number): string {
  const parts = []

  // Number format
  const formatMap: Record<RTFListLevel["format"], number> = {
    decimal: 0,
    bullet: 23,
    none: 255,
  }

  parts.push(`\\levelnfc${formatMap[level.format]}`)
  parts.push(`\\levelfollow0`)

  // Justification
  const justMap = { left: 0, center: 1, right: 2 }

  parts.push(`\\leveljc${justMap[level.justification || "left"]}`)

  // Follow character
  parts.push(`\\levelstartat${level.startAt ?? 1}`)

  // Level text - this defines what appears for the number/bullet
  switch (level.format) {
    case "decimal":
      parts.push(`{\\leveltext\\'02\\'0${levelIndex}.;}`)
      parts.push(`{\\levelnumbers\\'01;}`)
      break
    case "bullet":
      if (levelIndex === 0) {
        parts.push(`{\\leveltext\\'01\\u8226 \'b7;}`)
      } else if (levelIndex === 1) {
        parts.push(`{\\leveltext\\'01\\u9702 \'b7;}`)
      } else if (levelIndex === 2) {
        parts.push(`{\\leveltext\\'01\\u9642 \'b7;}`)
      } else if (levelIndex === 3) {
        parts.push(`{\\leveltext\\'01\\u9643 \'b7;}`)
      } else {
        parts.push(`{\\leveltext\\'01\\u8226 \'b7;}`)
      }
      parts.push(`{\\levelnumbers;}`)
      break
    case "none":
      parts.push(`{\\leveltext\\'01;}`)
      parts.push(`{\\levelnumbers;}`)
      break
  }

  // Text position and indentation
  const tabWidth = toTwip(model.typography.tabWidth || DEFAULT_TAB_WIDTH)
  const leftIndent = toTwip(level.leftIndent, tabWidth * (1 + levelIndex / 2))
  const firstLineIndent = toTwip(level.firstLineIndent, -tabWidth / 2)

  parts.push(`\\fi${firstLineIndent}`)
  parts.push(`\\li${leftIndent}`)

  // Restart level after higher level
  if (level.restartAfterLevel !== undefined) {
    parts.push(`\\levelrestart${level.restartAfterLevel}`)
  }
  return parts.join("")
}

/** Generate document info section */
export function generateDocumentInfo(model: RichTextDocumentModel, options: Partial<RTFGenerationOptions> = {}): string {
  const info = model.info
  const parts = ["{\\info"]

  // Basic info
  if (info.title) parts.push(`{\\title ${escapeRTFText(info.title)}}`)
  if (info.subject) parts.push(`{\\subject ${escapeRTFText(info.subject)}}`)
  if (info.author) parts.push(`{\\author ${escapeRTFText(info.author)}}`)
  if (info.manager) parts.push(`{\\manager ${escapeRTFText(info.manager)}}`)
  if (info.company) parts.push(`{\\company ${escapeRTFText(info.company)}}`)
  if (info.category) parts.push(`{\\category ${escapeRTFText(info.category)}}`)
  if (info.keywords) parts.push(`{\\keywords ${escapeRTFText(info.keywords)}}`)
  if (info.comment) parts.push(`{\\comment ${escapeRTFText(info.comment)}}`)

  // General informations
  if (options.creationTime) parts.push(generateTimestamp("creatim", options.creationTime))
  if (options.version !== undefined) parts.push(`{\\version${options.version}}`)
  if (options.internalVersion !== undefined) parts.push(`{\\vern${options.internalVersion}}`)

  // Statistics
  const stats = computeStatistics(model)

  if (stats.nofpages !== undefined) parts.push(`{\\nofpages${stats.nofpages}}`)
  if (stats.nofwords !== undefined) parts.push(`{\\nofwords${stats.nofwords}}`)
  if (stats.nofchars !== undefined) parts.push(`{\\nofchars${stats.nofchars}}`)
  if (stats.nofcharsws !== undefined) parts.push(`{\\nofcharsws${stats.nofcharsws}}`)

  parts.push("}\n")
  return parts.join("")
}

/** Generate page setup control words */
export function generatePageSetup(pageSetup: Partial<RTFPageSetup>): string {
  const parts: string[] = []

  // Paper dimensions
  if (pageSetup.paperWidth !== undefined) parts.push(`\\paperw${toTwip(pageSetup.paperWidth)}`)
  if (pageSetup.paperHeight !== undefined) parts.push(`\\paperh${toTwip(pageSetup.paperHeight)}`)

  // Margins
  if (pageSetup.margin?.left !== undefined) parts.push(`\\margl${toTwip(pageSetup.margin.left)}`)
  if (pageSetup.margin?.right !== undefined) parts.push(`\\margr${toTwip(pageSetup.margin.right)}`)
  if (pageSetup.margin?.top !== undefined) parts.push(`\\margt${toTwip(pageSetup.margin.top)}`)
  if (pageSetup.margin?.bottom !== undefined) parts.push(`\\margb${toTwip(pageSetup.margin.bottom)}`)

  // Gutter
  if (pageSetup.gutter !== undefined) parts.push(`\\gutter${toTwip(pageSetup.gutter)}`)

  // Orientation
  if (pageSetup.landscape) parts.push("\\landscape")

  // Facing pages
  if (pageSetup.facingPages) parts.push("\\facingp")
  if (pageSetup.marginMirror) parts.push("\\margmirror")

  // Add footnote position directives
  const footnotePositionMap: Record<RTFPageSetup["footnotePosition"], string> = {
    bottom: "\\ftnbj", // Footnotes at bottom of page
    beneath: "\\ftntj", // Footnotes beneath text
    section: "\\endnotes", // Endnotes at end of section
    document: "\\enddoc", // Endnotes at end of document
  }

  parts.push(footnotePositionMap[pageSetup.footnotePosition || "bottom"])

  // Add number format
  const footnoteNumberingMap: Record<RTFPageSetup["footnoteNumbering"], string> = {
    decimal: "ftnnar", // Arabic numerals (1, 2, 3)
    lowercase: "ftnnalc", // Lowercase letters (a, b, c)
    uppercase: "ftnnauc", // Uppercase letters (A, B, C)
    lowerRoman: "ftnnrlc", // Lowercase Roman (i, ii, iii)
    upperRoman: "ftnnruc", // Uppercase Roman (I, II, III)
    chicago: "ftnnchi", // Chicago style (*, †, ‡, §)
  }

  parts.push("\\" + footnoteNumberingMap[pageSetup.footnoteNumbering || "decimal"])
  parts.push("\\a" + footnoteNumberingMap[pageSetup.endnoteNumbering || "decimal"])

  // Add start number if specified
  if (pageSetup.footnoteStartNumber !== undefined) parts.push(`\\ftnstart${pageSetup.footnoteStartNumber}`)
  if (pageSetup.endnoteStartNumber !== undefined) parts.push(`\\aftnstart${pageSetup.endnoteStartNumber}`)

  // Add restart option
  const footnoteRestartMap: Record<RTFPageSetup["footnoteRestart"], string> = {
    page: "ftnrstpg", // Restart numbering each page
    section: "ftnrestart", // Restart numbering each section
    continuous: "ftnrstcont", // Continuous numbering
  }

  parts.push("\\" + footnoteRestartMap[pageSetup.footnoteRestart || "continuous"])

  // Add separator definitions
  parts.push("{\\*\\ftnsep\\chftnsep}")

  if (parts.length > 0) parts.push("\n")
  return parts.join("")
}

/** Generate typography settings control words */
export function generateTypographySettings(typography: Partial<RTFTypographySettings>): string {
  const parts: string[] = []

  parts.push(`\\deftab${toTwip(typography.tabWidth || DEFAULT_TAB_WIDTH)}`)
  if (typography.hyphenationHotZone !== undefined) parts.push(`\\hyphhotz${toTwip(typography.hyphenationHotZone)}`)
  if (typography.consecutiveHyphens !== undefined) parts.push(`\\hyphconsec${typography.consecutiveHyphens}`)
  if (typography.hyphenateCaps) parts.push("\\hyphcaps")
  if (typography.autoHyphenation) parts.push("\\hyphauto")

  if (parts.length > 0) parts.push("\n")
  return parts.join("")
}

/** Generate view settings control words */
export function generateViewSettings(viewSettings: Partial<RTFViewSettings>): string {
  const parts: string[] = []

  if (viewSettings.viewKind !== undefined) {
    const viewKindMap: Record<RTFViewSettings["viewKind"], number> = {
      none: 0,
      pageLayout: 1,
      outline: 2,
      masterDocument: 3,
      normal: 4,
      online: 5,
    }

    parts.push(`\\viewkind${viewKindMap[viewSettings.viewKind]}`)
  }

  if (viewSettings.viewScale) parts.push(`\\viewscale${viewSettings.viewScale}`)

  if (viewSettings.viewZoomKind) {
    const viewZoomKindMap: Record<RTFViewSettings["viewZoomKind"], number> = {
      none: 0,
      fullPage: 1,
      bestFit: 2,
      textWidth: 3,
    }

    parts.push(`\\viewzk${viewZoomKindMap[viewSettings.viewZoomKind]}`)
  }

  if (parts.length > 0) parts.push("\n")
  return parts.join("")
}

/** Internal document statistics - calculated automatically */
type RTFDocumentStatistics = {
  nofpages: number // Number of pages
  nofwords: number // Word count
  nofchars: number // Character count
  nofcharsws: number // Character count with spaces
}

/** Generate document statistics based on content */
function computeStatistics(model: RichTextDocumentModel): Partial<RTFDocumentStatistics> {
  let pageCount = 1
  let wordCount = 0
  let charCount = 0
  let charCountWS = 0

  const countContent = (elements: (RTFElement | RTFColumnBreakElement)[] = []) => {
    elements.forEach((element) => {
      switch (element.type) {
        case "paragraph":
          if (element.formatting.flags?.includes("pageBreakBefore")) {
            pageCount++
          }
          element.content.forEach((child) => {
            child.content.forEach((text) => {
              if (text.type === "text") {
                const t = text.text
                charCountWS += t.length
                charCount += t.replace(/\s/g, "").length
                wordCount += t.split(/\s+/).filter((w) => w.length > 0).length
              } else if (text.type === "footnote") {
                countContent([text.content])
              } else if (text.type === "pageBreak") {
                pageCount++
              }
            })
          })
          break
        case "container":
          countContent(element.content)
          break
        case "table":
          element.rows.forEach((row) => {
            row.cells.forEach((cell) => countContent(cell.content))
          })
          break
      }
    })
  }

  const countSection = (section: Partial<RTFSection>) => {
    countContent(section.header)
    countContent(section.evenHeader)
    countContent(section.firstHeader)
    countContent(section.footer)
    countContent(section.evenFooter)
    countContent(section.firstFooter)
    countContent(section.content)
  }

  model.sections.forEach((section) => countSection(section))
  return {
    nofpages: pageCount,
    nofwords: wordCount,
    nofchars: charCount,
    nofcharsws: charCountWS,
  }
}
