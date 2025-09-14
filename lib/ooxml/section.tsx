import { RichTextDocumentModel } from "../document"
import { RTFSection } from "../types"
import { toTwips } from "../utils"

import { generateElements, SectionGeometry } from "./base"

/** Generate section content from RTFSection */
export function generateSection(model: RichTextDocumentModel, section: RTFSection): JSX.IntrinsicElements[] {
  const content: JSX.IntrinsicElements[] = []
  const [properties, geometry] = generateSectionProperties(model, section)

  content.push(...generateElements(model, geometry, section.content))

  // If no content, add a default empty paragraph
  if (content.length === 0) {
    content.push(<w:p></w:p>)
  }

  // Add section properties at the end
  content.push(properties)
  return content
}

/** Generate section properties */
function generateSectionProperties(model: RichTextDocumentModel, section: RTFSection): [JSX.IntrinsicElements, SectionGeometry] {
  const sectPrChildren: JSX.IntrinsicElements[] = []
  const pageWidth = toTwips(section.formatting.pageWidth || model.pageSetup.paperWidth, 12240) // Default A4 width
  const pageHeight = toTwips(section.formatting.pageHeight || model.pageSetup.paperHeight, 15840) // Default A4 height
  const marginLeft = toTwips(section.formatting.margin?.left || model.pageSetup.margin?.left)
  const marginRight = toTwips(section.formatting.margin?.right || model.pageSetup.margin?.right)
  const marginTop = toTwips(section.formatting.margin?.top || model.pageSetup.margin?.top)
  const marginBottom = toTwips(section.formatting.margin?.bottom || model.pageSetup.margin?.bottom)
  const gutter = toTwips(section.formatting.gutter || model.pageSetup.gutter)

  // Page size (default to A4 if not specified)
  sectPrChildren.push(<w:pgSz w:w={pageWidth} w:h={pageHeight} />)

  // Page margins
  sectPrChildren.push(
    <w:pgMar
      w:top={marginTop}
      w:right={marginRight}
      w:bottom={marginBottom}
      w:left={marginLeft}
      w:gutter={gutter}
      w:header={toTwips(section.formatting.headerDistance, 708)}
      w:footer={toTwips(section.formatting.footerDistance, 708)}
    />
  )
  return [
    <w:sectPr>{sectPrChildren}</w:sectPr>,
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
