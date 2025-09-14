import { RichTextDocumentModel } from "../document"
import { RTFCharacterElement } from "../types"
import { toHalfPoints } from "../utils"

import { convertColorToHex, SectionGeometry } from "./base"

/** Generate run from RTFCharacterElement */
export function generateCharacterElement(model: RichTextDocumentModel, _geometry: SectionGeometry, charElement: RTFCharacterElement): JSX.IntrinsicElements {
  const rChildren: JSX.IntrinsicElements[] = []

  // Add run properties if present
  const rPrChildren: JSX.IntrinsicElements[] = []

  // Font
  if (charElement.formatting.fontAlias) {
    const fontEntry = model.fontRegistry.get(charElement.formatting.fontAlias)
    const fontName = fontEntry?.item.name || "Times New Roman"

    rPrChildren.push(<w:rFonts w:ascii={fontName} w:hAnsi={fontName} />)
  }

  // Font size
  if (charElement.formatting.fontSize !== undefined) {
    rPrChildren.push(<w:sz w:val={toHalfPoints(charElement.formatting.fontSize)} />)
    rPrChildren.push(<w:szCs w:val={toHalfPoints(charElement.formatting.fontSize)} />)
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

  // Process content elements
  for (const item of charElement.content) {
    switch (item.type) {
      case "text":
        rChildren.push(<w:t xml:space="preserve">{item.text}</w:t>)
        break
      case "footnote":
        // TODO:
        break
      case "picture":
        // TODO:
        break
      case "pageBreak":
        rChildren.push(<w:br w:type="page" />)
        break
      case "lineBreak":
        rChildren.push(<w:br />)
        break
      case "tab":
        rChildren.push(<w:tab />)
        break
      case "nonBreakingSpace":
        rChildren.push(<w:t xml:space="preserve"> </w:t>)
        break
      case "nonBreakingHyphen":
        rChildren.push(<w:t xml:space="preserve">-</w:t>)
        break
      case "optionalHyphen":
        rChildren.push(<w:hyphen />)
        break
      case "pageNumber":
        // TODO:
        break
      case "dateTime":
        // TODO:
        break
      default:
        throw new Error(`Unknown character content type: ${(item as any).type}`)
    }
  }
  return <w:r>{rChildren}</w:r>
}
