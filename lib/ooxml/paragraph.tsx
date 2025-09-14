import { RichTextDocumentModel } from "../document"
import { RTFParagraphElement } from "../types"
import { toTwips } from "../utils"

import { SectionGeometry } from "./base"
import { generateCharacterElement } from "./character"

/** Generate paragraph from RTFParagraphElement */
export function generateParagraph(model: RichTextDocumentModel, geometry: SectionGeometry, paragraph: RTFParagraphElement): JSX.IntrinsicElements {
  const pChildren: JSX.IntrinsicElements[] = []

  // Add paragraph properties if present
  if (paragraph.formatting && Object.keys(paragraph.formatting).length > 0) {
    const pPrChildren: JSX.IntrinsicElements[] = []

    // Add spacing
    const spacingAttrs: Partial<JSX.IntrinsicElements["w:spacing"]> = {}

    if (paragraph.formatting.spaceBefore !== undefined) {
      spacingAttrs["w:before"] = toTwips(paragraph.formatting.spaceBefore)
    }
    if (paragraph.formatting.spaceAfter !== undefined) {
      spacingAttrs["w:after"] = toTwips(paragraph.formatting.spaceAfter)
    }
    if (paragraph.formatting.lineSpacing !== undefined) {
      spacingAttrs["w:line"] = toTwips(paragraph.formatting.lineSpacing)
      spacingAttrs["w:lineRule"] = paragraph.formatting.lineSpacingRule || "auto"
    }
    if (Object.keys(spacingAttrs).length > 0) {
      pPrChildren.push(<w:spacing {...spacingAttrs} />)
    }

    // Add indentation
    const indAttrs: Partial<JSX.IntrinsicElements["w:ind"]> = {}

    if (paragraph.formatting.leftIndent !== undefined || paragraph.formatting.firstLineIndent !== undefined) {
      let leftIndent = toTwips(paragraph.formatting.leftIndent)
      let firstLineIndent = toTwips(paragraph.formatting.firstLineIndent)

      indAttrs["w:start"] = leftIndent
      if (firstLineIndent < 0) {
        indAttrs["w:hanging"] = Math.abs(firstLineIndent)
      } else {
        indAttrs["w:firstLine"] = firstLineIndent
      }
    }
    if (paragraph.formatting.rightIndent !== undefined) {
      indAttrs["w:end"] = toTwips(paragraph.formatting.rightIndent)
    }
    if (Object.keys(indAttrs).length > 0) {
      pPrChildren.push(<w:ind {...indAttrs} />)
    }

    // Add alignment
    if (paragraph.formatting.align) {
      const alignMap: Record<typeof paragraph.formatting.align, string> = {
        left: "start",
        center: "center",
        right: "end",
        justify: "both",
        distribute: "distribute",
      }

      pPrChildren.push(<w:jc w:val={alignMap[paragraph.formatting.align]} />)
    }

    if (pPrChildren.length > 0) {
      pChildren.push(<w:pPr>{pPrChildren}</w:pPr>)
    }
  }

  // Process character elements
  for (const charElement of paragraph.content) {
    pChildren.push(generateCharacterElement(model, geometry, charElement))
  }
  return <w:p>{pChildren}</w:p>
}
