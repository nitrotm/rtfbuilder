import { RichTextDocumentModel, DEFAULT_PARAGRAPH_STYLE_ALIAS } from "../document"
import { RTFCharacterFormatting, RTFParagraphElement, RTFParagraphFlag, RTFParagraphFormatting } from "../types"
import { pt, toTwips } from "../utils"

import { generateBorderStyle, generateShadingPattern, SectionGeometry } from "./base"
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
  let leftIndent = formatting.leftIndent !== undefined ? toTwips(formatting.leftIndent) : undefined

  if (formatting.listOverrideAlias) {
    const listOverride = model.listOverrideRegistry.get(formatting.listOverrideAlias)
    const listLevel = formatting.listLevel || 0

    if (formatting.listItem) {
      parts.push(`\\ls${listOverride.index}`)
      parts.push(`\\ilvl${listLevel}`)
    } else {
      const list = model.listRegistry.get(listOverride.item.listAlias || "")
      const levels = list.item.levels || []
      const level = listLevel < levels.length ? levels[listLevel] : undefined

      leftIndent = toTwips(formatting.leftIndent) + toTwips(level?.leftIndent ?? pt(36 * (listLevel + 1)))
    }
  }
  if (formatting.firstLineIndent !== undefined) parts.push(`\\fi${toTwips(formatting.firstLineIndent)}`)
  if (leftIndent !== undefined) parts.push(`\\li${leftIndent}`)
  if (formatting.rightIndent !== undefined) parts.push(`\\ri${toTwips(formatting.rightIndent)}`)
  if (formatting.spaceBefore !== undefined) parts.push(`\\sb${toTwips(formatting.spaceBefore)}`)
  if (formatting.spaceAfter !== undefined) parts.push(`\\sa${toTwips(formatting.spaceAfter)}`)
  if (formatting.lineSpacing !== undefined) parts.push(`\\sl${toTwips(formatting.lineSpacing)}`)

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
  if (formatting.shading !== undefined) {
    if (formatting.shading.ratio !== undefined) {
      parts.push(`\\shading${Math.max(0, Math.min(10000, Math.round(formatting.shading.ratio * 10000)))}`)
    }
    if (formatting.shading.pattern !== undefined) {
      parts.push(generateShadingPattern(formatting.shading.pattern))
    }
    if (formatting.shading.foregroundColorAlias !== undefined) {
      parts.push(`\\cfpat${model.colorRegistry.index(formatting.shading.foregroundColorAlias)}`)
    }
    if (formatting.shading.backgroundColorAlias !== undefined) {
      parts.push(`\\cbpat${model.colorRegistry.index(formatting.shading.backgroundColorAlias)}`)
    }
  }

  // Paragraph flags
  const flagsMap: Record<RTFParagraphFlag, string> = {
    keepLines: "\\keep",
    keepNext: "\\keepn",
    pageBreakBefore: "\\pagebb",
    noLineNumber: "\\noline",
    suppressLineNumbers: "\\nosupnum",
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
  let needSpace: boolean = true
  let formatting = element.formatting
  let characterFormatting: Partial<RTFCharacterFormatting> = {}
  let style = model.styleRegistry.get(formatting.styleAlias || DEFAULT_PARAGRAPH_STYLE_ALIAS)

  formatting = { ...(style.item.paragraphFormatting || {}), ...formatting }
  characterFormatting = { ...(style.item.characterFormatting || {}), ...characterFormatting }
  while (style.item.baseStyleAlias !== undefined && style.item.baseStyleAlias !== style.name) {
    style = model.styleRegistry.get(style.item.baseStyleAlias)
    formatting = { ...(style.item.paragraphFormatting || {}), ...formatting }
    characterFormatting = { ...(style.item.characterFormatting || {}), ...characterFormatting }
  }

  // Paragraph preamble
  const characterFormattingData = generateCharacterFormatting(model, characterFormatting)
  const paragraphFormattingData = generateParagraphFormatting(model, formatting)

  parts.push("\\pard\\plain")
  if (formatting.styleAlias !== undefined) {
    parts.push(`\\s${model.styleRegistry.index(formatting.styleAlias)}`)
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
