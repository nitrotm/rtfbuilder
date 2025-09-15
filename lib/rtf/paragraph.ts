import { RichTextDocumentModel, DEFAULT_PARAGRAPH_STYLE_ALIAS, DEFAULT_TAB_WIDTH } from "../document"
import { RTFCharacterFormatting, RTFParagraphElement, RTFParagraphFlag, RTFParagraphFormatting } from "../types"
import { toTwip } from "../utils"

import { generateBorderStyle, SectionGeometry } from "./base"
import { generateCharacter, generateCharacterFormatting } from "./character"

/** Generate paragraph formatting control words */
export function generateParagraphFormatting(model: RichTextDocumentModel, formatting: Partial<RTFParagraphFormatting> = {}): string {
  const parts: string[] = []

  // Paragraph alignment
  if (formatting.align !== undefined) {
    const alignMap: Record<RTFParagraphFormatting["align"], string> = {
      left: "\\ql",
      center: "\\qc",
      right: "\\qr",
      justify: "\\qj",
      distribute: "\\qd",
    }

    parts.push(alignMap[formatting.align])
  }

  // Indentation and spacing
  let firstLineIndent = formatting.firstLineIndent !== undefined ? toTwip(formatting.firstLineIndent) : undefined
  let leftIndent = formatting.leftIndent !== undefined ? toTwip(formatting.leftIndent) : undefined

  if (formatting.listAlias !== undefined) {
    const list = model.listRegistry.get(formatting.listAlias)
    const listLevel = formatting.listLevel || 0
    const levels = list.item.levels || []
    const level = listLevel < levels.length ? levels[listLevel] : undefined
    const tabWidth = toTwip(model.typography.tabWidth || DEFAULT_TAB_WIDTH)

    leftIndent = (leftIndent || 0) + toTwip(level?.leftIndent, tabWidth * (1 + listLevel / 2))
    if (formatting.listItem) {
      firstLineIndent = (firstLineIndent || 0) - toTwip(tabWidth / 2)
      parts.push("{\\listtext ?\\tab}")
      parts.push(`\\ls${list.index}`)
      parts.push(`\\ilvl${listLevel}`)
    } else {
      firstLineIndent = undefined
    }
  }
  if (firstLineIndent !== undefined) parts.push(`\\fi${toTwip(firstLineIndent)}`)
  if (leftIndent !== undefined) parts.push(`\\li${leftIndent}`)
  if (formatting.rightIndent !== undefined) parts.push(`\\ri${toTwip(formatting.rightIndent)}`)
  if (formatting.spaceBefore !== undefined) parts.push(`\\sb${toTwip(formatting.spaceBefore)}`)
  if (formatting.spaceAfter !== undefined) parts.push(`\\sa${toTwip(formatting.spaceAfter)}`)
  if (formatting.lineSpacing !== undefined) parts.push(`\\sl${toTwip(formatting.lineSpacing)}`)
  if (formatting.lineSpacingRule === "exact") parts.push("\\slmult0")

  // Paragraph borders
  if (formatting.borders !== undefined) {
    if (formatting.borders.top !== undefined) {
      parts.push("\\brdrt", generateBorderStyle(model, formatting.borders.top))
    }
    if (formatting.borders.bottom !== undefined) {
      parts.push("\\brdrb", generateBorderStyle(model, formatting.borders.bottom))
    }
    if (formatting.borders.left !== undefined) {
      parts.push("\\brdrl", generateBorderStyle(model, formatting.borders.left))
    }
    if (formatting.borders.right !== undefined) {
      parts.push("\\brdrr", generateBorderStyle(model, formatting.borders.right))
    }
  }

  // Paragraph shading
  if (formatting.backgroundColorAlias !== undefined) {
    parts.push(`\\cbpat${model.colorRegistry.index(formatting.backgroundColorAlias)}`)
  }

  // Paragraph flags
  const flagsMap: Record<RTFParagraphFlag, string> = {
    keepLines: "\\keep",
    keepNext: "\\keepn",
    pageBreakBefore: "\\pagebb",
    suppressLineNumbers: "\\noline",
    contextualSpacing: "\\contextual",
    suppressHyphenation: "\\hyphnone",
    noWidowControl: "\\nowidctl",
  }
  const flags = formatting.flags || []

  flags.forEach((flag) => parts.push(flagsMap[flag] || ""))
  return parts.join("")
}

/** Generate a paragraph element */
export function generateParagraph(model: RichTextDocumentModel, geometry: SectionGeometry, element: RTFParagraphElement): string {
  const parts: string[] = []
  let style = model.styleRegistry.get(element.formatting.styleAlias || DEFAULT_PARAGRAPH_STYLE_ALIAS)
  let formatting = { ...(style.item.paragraphFormatting || {}), ...element.formatting, styleAlias: undefined }
  let characterFormatting: Partial<RTFCharacterFormatting> = { ...(style.item.characterFormatting || {}), styleAlias: undefined }
  let needSpace: boolean = true

  while (style.item.baseStyleAlias !== undefined && style.item.baseStyleAlias !== style.name) {
    style = model.styleRegistry.get(style.item.baseStyleAlias)
    formatting = { ...(style.item.paragraphFormatting || {}), ...formatting, styleAlias: undefined }
    characterFormatting = { ...(style.item.characterFormatting || {}), ...characterFormatting, styleAlias: undefined }
  }

  // Paragraph preamble
  const characterFormattingData = generateCharacterFormatting(model, characterFormatting)
  const paragraphFormattingData = generateParagraphFormatting(model, formatting)

  parts.push("\\pard\\plain")
  if (element.formatting.styleAlias !== undefined) {
    parts.push(`\\s${model.styleRegistry.index(element.formatting.styleAlias)}`)
    needSpace = true
  }
  if (characterFormattingData.length > 0) {
    parts.push(characterFormattingData)
    needSpace = true
  }
  if (paragraphFormattingData.length > 0) {
    parts.push(paragraphFormattingData)
    needSpace = true
  }

  // Generate content
  for (const item of element.content) {
    const data = generateCharacter(model, geometry, item)

    if (needSpace) parts.push(" ")
    parts.push(data)
    needSpace = /\\[a-zA-Z0-9]+$/.test(data)
  }

  // Paragraph postamble
  parts.push("\\par")
  return parts.join("")
}
