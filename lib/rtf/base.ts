import { RichTextDocumentModel } from "../document"
import { RTFBorder, RTFColumnBreakElement, RTFElement } from "../types"
import { toTwip } from "../utils"

import { generateParagraph } from "./paragraph"
import { generateTable } from "./table"

/** Escape special characters in text for RTF */
export function escapeRTFText(text: string): string {
  return text
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/\{/g, "\\{") // Escape opening braces
    .replace(/\}/g, "\\}") // Escape closing braces
    .replace(/[\u007F-\uFFFF]/g, (match) => {
      // Convert non-ASCII characters to Unicode escapes
      const code = match.charCodeAt(0)
      return `\\u${code}?`
    })
}

/** Generate a timestamp in RTF format */
export function generateTimestamp(date: Date): string {
  return `\\yr${date.getFullYear()}\\mo${date.getMonth() + 1}\\dy${date.getDate()}\\hr${date.getHours()}\\min${date.getMinutes()}\\sec${date.getSeconds()}`
}

/** Generate dttm date */
export function generateDTTMTimestamp(date: Date): number {
  const year = Math.min(511, Math.max(0, date.getFullYear() - 1900))
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = date.getDay()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const value = (dayOfWeek << 29) | (year << 20) | (month << 16) | (day << 11) | (hour << 6) | minute

  return value > 2147483647 ? value - 4294967296 : value
}

/** Generate border style control words */
export function generateBorderStyle(model: RichTextDocumentModel, border: Partial<RTFBorder>): string {
  const parts: string[] = []

  // Border style
  const styleMap: Record<RTFBorder["style"], string> = {
    single: "\\brdrs",
    double: "\\brdrdb",
    dotted: "\\brdrdot",
    dashed: "\\brdrdash",
    triple: "\\brdrtriple",
    wave: "\\brdrwavy",
    none: "",
  }

  parts.push(styleMap[border.style || "single"])
  if (border.width !== undefined) parts.push(`\\brdrw${toTwip(border.width)}`)
  if (border.colorAlias !== undefined) parts.push(`\\brdrcf${model.colorRegistry.index(border.colorAlias)}`)
  if (border.spacing !== undefined) parts.push(`\\brsp${toTwip(border.spacing)}`)
  return parts.join("")
}

/** Section geometry for layout calculations */
export type SectionGeometry = {
  pageWidth: number
  pageHeight: number
  marginLeft: number
  marginRight: number
  marginTop: number
  marginBottom: number
  gutter: number
  contentWidth: number
  contentHeight: number
}

/** Generate multiple elements */
export function generateElements(
  model: RichTextDocumentModel,
  geometry: SectionGeometry,
  elements: (RTFElement | RTFColumnBreakElement)[] = [],
  separator: string = "",
  stripTrailingPar = false
): string {
  const parts: string[] = []

  for (const [index, element] of elements.entries()) {
    const data = generateElement(model, geometry, element)

    if (index === elements.length - 1 && stripTrailingPar && data.endsWith("\\par")) {
      parts.push(data.slice(0, -4)) // Remove trailing \par
    } else {
      parts.push(data)
    }
  }
  return parts.join(separator)
}

/** Generate a single element */
export function generateElement(model: RichTextDocumentModel, geometry: SectionGeometry, element: RTFElement | RTFColumnBreakElement): string {
  switch (element.type) {
    case "columnBreak":
      return "\\column"
    case "paragraph":
      return generateParagraph(model, geometry, element)
    case "container":
      return generateElements(model, geometry, element.content)
    case "table":
      return generateTable(model, geometry, element)
    default:
      throw new Error(`Unknown element type: ${(element as any).type}`)
  }
}
