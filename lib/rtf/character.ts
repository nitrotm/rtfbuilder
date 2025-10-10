import { RichTextDocumentModel, FOOTNOTE_BACKGROUND_COLOR_ALIAS, FOOTNOTE_COLOR_ALIAS } from "../document"
import { RTFCharacterElement, RTFCharacterFlag, RTFCharacterFormatting, RTFFootnoteElement, RTFPictureElement, RTFPictureType } from "../types"
import { toHalfPoint, toTwip } from "../utils"

import { escapeRTFText, generateDTTMTimestamp, generateElement, SectionGeometry } from "./base"
import { generateParagraph } from "./paragraph"

/** Generate character formatting control words */
export function generateCharacterFormatting(model: RichTextDocumentModel, formatting: Partial<RTFCharacterFormatting> = {}): string {
  const parts: string[] = []

  // Character style
  if (formatting.fontAlias !== undefined) parts.push(`\\f${model.fontRegistry.index(formatting.fontAlias)}`)
  if (formatting.fontSize !== undefined) parts.push(`\\fs${toHalfPoint(formatting.fontSize)}`)
  if (formatting.language !== undefined) parts.push(`\\lang${formatting.language}`)
  if (formatting.kerning !== undefined) parts.push(`\\kerning${toHalfPoint(formatting.kerning)}`)
  if (formatting.characterSpacing !== undefined) parts.push(`\\expndtw${toTwip(formatting.characterSpacing)}`)
  if (formatting.horizontalScaling !== undefined) parts.push(`\\charscalex${Math.round(formatting.horizontalScaling * 100)}`)
  if (formatting.colorAlias !== undefined) parts.push(`\\cf${model.colorRegistry.index(formatting.colorAlias)}`)
  if (formatting.highlightColorAlias !== undefined) parts.push(`\\highlight${model.colorRegistry.index(formatting.highlightColorAlias)}`)
  if (formatting.bold) parts.push("\\b")
  if (formatting.italic) parts.push("\\i")
  if (formatting.underline !== undefined) {
    if (formatting.underline === true) {
      parts.push("\\ul")
    } else if (formatting.underline === "double") {
      parts.push("\\uldb")
    } else if (formatting.underline === "dotted") {
      parts.push("\\uld")
    } else if (formatting.underline === "dash") {
      parts.push("\\uldash")
    } else if (formatting.underline === "wave") {
      parts.push("\\ulwave")
    }
  }
  if (formatting.strikethrough !== undefined) {
    if (formatting.strikethrough === true) {
      parts.push("\\strike")
    } else if (formatting.strikethrough === "double") {
      parts.push("\\striked")
    }
  }

  // Character flags
  const flagsMap: Record<RTFCharacterFlag, string> = {
    superscript: "\\super",
    subscript: "\\sub",
    smallCaps: "\\scaps",
    allCaps: "\\caps",
    hidden: "\\v",
    noProof: "\\noproof",
  }
  const flags = formatting.flags || []

  flags.forEach((flag) => parts.push(flagsMap[flag] || ""))
  return parts.join("")
}

/** Generate a character element */
export function generateCharacter(model: RichTextDocumentModel, geometry: SectionGeometry, element: RTFCharacterElement): string {
  const parts: string[] = []
  let style = element.formatting.styleAlias !== undefined ? model.styleRegistry.get(element.formatting.styleAlias) : undefined
  let formatting = { ...(style?.item?.characterFormatting || {}), ...element.formatting, styleAlias: undefined }
  let needSpace: boolean = false

  while (style?.item?.baseStyleAlias !== undefined && style.item.baseStyleAlias !== style.name) {
    style = model.styleRegistry.get(style.item.baseStyleAlias)
    formatting = { ...(style.item.characterFormatting || {}), ...formatting, styleAlias: undefined }
  }
  if (element.formatting.styleAlias !== undefined) {
    parts.push(`\\cs${model.styleRegistry.index(element.formatting.styleAlias)}`)
    needSpace = true
  }

  // Content preamble
  const formattingData = generateCharacterFormatting(model, formatting)

  if (formattingData.length > 0) {
    parts.push(formattingData)
    needSpace = true
  }

  // Bookmark start
  if (element.bookmarkAlias !== undefined) {
    parts.push(`{\\*\\bkmkstart bk${model.bookmarkRegistry.index(element.bookmarkAlias)}}`)
    needSpace = false
  }

  // Comment start
  if (element.comment !== undefined) {
    parts.push(`{\\*\\atrfstart ${model.commentRegistry.index(element.comment.alias)}}`)
    needSpace = false
  }

  // Links
  if (element.link?.type !== undefined) {
    switch (element.link.type) {
      case "bookmark":
        parts.push(`{\\field{\\*\\fldinst HYPERLINK "." \\l "#bk${model.bookmarkRegistry.index(element.link.bookmarkAlias)}"}{\\fldrslt{`)
        break
      case "external":
        parts.push(`{\\field{\\*\\fldinst HYPERLINK "${element.link.url}"}{\\fldrslt{`)
        break
      default:
        throw new Error(`Unknown hyperlink type: ${(element.link as any).type}`)
    }
    needSpace = false
  }

  // Content
  for (const item of element.content) {
    let chunk: string

    switch (item.type) {
      case "text":
        if (needSpace) {
          parts.push(" ")
        }
        chunk = escapeRTFText(item.text)
        needSpace = false
        break
      case "footnote":
        chunk = generateFootnoteContent(model, geometry, item)
        needSpace = false
        break
      case "picture":
        chunk = generatePicture(model, geometry, item)
        needSpace = false
        break
      case "pageBreak":
        chunk = "\\page"
        needSpace = true
        break
      case "lineBreak":
        chunk = "\\line"
        needSpace = true
        break
      case "tab":
        chunk = "\\tab"
        needSpace = true
        break
      case "nonBreakingSpace":
        chunk = "\\~"
        needSpace = true
        break
      case "nonBreakingHyphen":
        chunk = "\\_"
        needSpace = true
        break
      case "optionalHyphen":
        chunk = "\\-"
        needSpace = true
        break
      case "pageNumber":
        chunk = "{\\field{\\*\\fldinst PAGE}{\\fldrslt 1}}"
        needSpace = false
        break
      case "totalPages":
        chunk = "{\\field{\\*\\fldinst NUMPAGES}{\\fldrslt 1}}"
        needSpace = false
        break
      case "date":
        chunk = `{\\field{\\*\\fldinst DATE \\\\@"dd.MM.yyyy" }{\\fldrslt ${(item.value || new Date()).toDateString()}}}`
        needSpace = false
        break
      case "time":
        chunk = `{\\field{\\*\\fldinst TIME \\\\@"HH:mm:ss" }{\\fldrslt ${(item.value || new Date()).toDateString()}}}`
        needSpace = false
        break
      default:
        throw new Error(`Unknown character content type: ${(item as any).type}`)
    }
    parts.push(chunk)
  }

  // Close link group
  if (element.link?.type !== undefined) {
    parts.push("}}}")
    needSpace = false
  }

  // Bookmark end
  if (element.bookmarkAlias !== undefined) {
    parts.push(`{\\*\\bkmkend bk${model.bookmarkRegistry.index(element.bookmarkAlias)}}`)
    needSpace = false
  }

  // Comment end
  if (element.comment !== undefined) {
    const commentIndex = model.commentRegistry.index(element.comment.alias)
    const initials = element.comment.author.match(/\b\w/g)?.join("").toUpperCase() || "??"

    parts.push(`{\\*\\atrfend ${commentIndex}}`)
    parts.push(`{\\*\\atnid ${escapeRTFText(initials)}}{\\*\\atnauthor ${escapeRTFText(element.comment.author)}}`)
    parts.push(`\\chatn{\\*\\annotation{\\*\\atndate ${generateDTTMTimestamp(element.comment.timestamp)}}{\\*\\atnref ${commentIndex}}`)
    parts.push(generateParagraph(model, geometry, element.comment.content))
    parts.push("}")
    needSpace = false
  }

  // Content postamble
  if (
    formatting.fontAlias !== undefined ||
    formatting.fontSize !== undefined ||
    formatting.kerning !== undefined ||
    formatting.characterSpacing !== undefined ||
    formatting.horizontalScaling !== undefined ||
    formatting.colorAlias !== undefined ||
    formatting.highlightColorAlias !== undefined ||
    formatting.bold ||
    formatting.italic ||
    formatting.underline !== undefined ||
    formatting.strikethrough !== undefined ||
    formatting.flags !== undefined
  ) {
    parts.unshift("{")
    parts.push("}")
    needSpace = false
  }
  if (needSpace) {
    parts.push(" ")
  }
  return parts.join("")
}

/** Generate footnote content */
export function generateFootnoteContent(model: RichTextDocumentModel, geometry: SectionGeometry, item: RTFFootnoteElement): string {
  const parts: string[] = []

  // Footnote preamble
  parts.push(`{\\super\\cf${model.colorRegistry.index(FOOTNOTE_COLOR_ALIAS)}\\cb${model.colorRegistry.index(FOOTNOTE_BACKGROUND_COLOR_ALIAS)} `)
  if ((item.customMark || "").length > 0) {
    parts.push(escapeRTFText(item.customMark || ""))
  } else {
    parts.push("\\chftn")
  }
  parts.push("{")
  parts.push("\\footnote")
  if (item.endnote) parts.push("\\ftnalt")

  // Add the reference mark
  if ((item.customMark || "").length > 0) {
    parts.push(" ")
    parts.push(escapeRTFText(item.customMark || ""))
  } else {
    parts.push("\\chftn")
  }
  parts.push("\\tab")

  // Add the footnote content
  const data = generateElement(model, geometry, item.content)

  parts.push(" ")
  parts.push(data)

  // Footnote postamble
  parts.push("}}")
  return parts.join("")
}

/** Generate a picture element */
export function generatePicture(_model: RichTextDocumentModel, _geometry: SectionGeometry, element: RTFPictureElement): string {
  const picture = element.picture
  const formatting = element.formatting
  const parts: string[] = []

  // Start picture group
  parts.push("{\\pict")

  // Picture preamble
  const formatMap: Record<RTFPictureType, string> = {
    png: "\\pngblip",
    jpeg: "\\jpegblip",
  }

  parts.push(formatMap[picture.format] || "\\pngblip")

  // Original dimensions (in pixels)
  parts.push(`\\picw${picture.width}`)
  parts.push(`\\pich${picture.height}`)

  // Display dimensions (in twips)
  if (formatting.displayWidth !== undefined) parts.push(`\\picwgoal${toTwip(formatting.displayWidth)}`)
  if (formatting.displayHeight !== undefined) parts.push(`\\pichgoal${toTwip(formatting.displayHeight)}`)

  // Scale percentages
  // if (formatting.scaleX !== undefined) parts.push(`\\picscalex${Math.round(formatting.scaleX * 100)}`)
  // if (formatting.scaleY !== undefined) parts.push(`\\picscaley${Math.round(formatting.scaleY * 100)}`)

  // Crop values (in twips)
  if (formatting.cropTop !== undefined) parts.push(`\\piccropt${formatting.cropTop}`)
  if (formatting.cropBottom !== undefined) parts.push(`\\piccropb${formatting.cropBottom}`)
  if (formatting.cropLeft !== undefined) parts.push(`\\piccropl${formatting.cropLeft}`)
  if (formatting.cropRight !== undefined) parts.push(`\\piccropr${formatting.cropRight}`)

  // Add space before hex data
  parts.push(" ")

  // Convert binary data to hex string
  parts.push(
    Array.from(picture.data)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  )

  // Picture postamble
  parts.push("}")
  return parts.join("")
}
