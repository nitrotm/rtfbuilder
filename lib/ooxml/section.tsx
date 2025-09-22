import { RTFPageSetup, RTFSection, RTFSectionFormatting } from "../types"
import { toTwip } from "../utils"

import {
  CONTENT_TYPE_FOOTER,
  CONTENT_TYPE_HEADER,
  generateElements,
  OOXMLDocumentModel,
  RELATIONSHIP_TYPE_FOOTER,
  RELATIONSHIP_TYPE_HEADER,
  RELATIONSHIPS_OFFICE_DOCUMENT_NS,
  SectionGeometry,
  WORDPROCESSINGML_MAIN_NS,
  XML_STANDALONE_HEADER,
} from "./base"

/** Generate section content from RTFSection */
export function generateSection(model: OOXMLDocumentModel, section: RTFSection, index: number): JSX.IntrinsicElements[] {
  const content: JSX.IntrinsicElements[] = []
  const [properties, geometry] = generateSectionProperties(model, section, index)

  content.push(...generateElements(model, geometry, section.content))

  // If no content, add a default empty paragraph
  if (content.length === 0) {
    content.push(<w:p></w:p>)
  }

  // Add section properties at the end
  if (index < model.sections.length - 1) {
    content.push(
      <w:p>
        <w:pPr>{properties}</w:pPr>
      </w:p>
    )
  } else {
    content.push(properties)
  }
  return content
}

/** Generate section properties */
function generateSectionProperties(model: OOXMLDocumentModel, section: RTFSection, index: number): [JSX.IntrinsicElements, SectionGeometry] {
  const sectPrChildren: JSX.IntrinsicElements[] = []
  const formatting = section.formatting
  const pageWidth: number = toTwip(
    formatting.pageWidth ?? (formatting.landscape !== model.pageSetup.landscape ? model.pageSetup.paperHeight : model.pageSetup.paperWidth)
  )
  const pageHeight: number = toTwip(
    formatting.pageHeight ?? (formatting.landscape !== model.pageSetup.landscape ? model.pageSetup.paperWidth : model.pageSetup.paperHeight)
  )
  const marginLeft: number = toTwip(formatting.margin?.left ?? model.pageSetup.margin?.left)
  const marginRight: number = toTwip(formatting.margin?.right ?? model.pageSetup.margin?.right)
  const marginTop: number = toTwip(formatting.margin?.top ?? model.pageSetup.margin?.top)
  const marginBottom: number = toTwip(formatting.margin?.bottom ?? model.pageSetup.margin?.bottom)
  const gutter = toTwip(section.formatting.gutter || model.pageSetup.gutter)
  const geometry: SectionGeometry = {
    pageWidth,
    pageHeight,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    gutter,
    contentWidth: pageWidth - marginLeft - marginRight - gutter,
    contentHeight: pageHeight - marginTop - marginBottom,
  }

  // Headers and footers
  if (formatting.titlePage && section.firstHeader) {
    const firstHeaderId = model.documentRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_HEADER,
      target: `firstHeader${index}.xml`,
      data: [
        XML_STANDALONE_HEADER,
        <w:hdr xmlns:w={WORDPROCESSINGML_MAIN_NS} xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS}>
          {generateElements(model, geometry, section.firstHeader)}
        </w:hdr>,
      ].join(""),
      contentType: CONTENT_TYPE_HEADER,
    })

    sectPrChildren.push(<w:headerReference w:type="first" r:id={firstHeaderId} />)
  }
  if (section.header) {
    const headerId = model.documentRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_HEADER,
      target: `header${index}.xml`,
      data: [
        XML_STANDALONE_HEADER,
        <w:hdr xmlns:w={WORDPROCESSINGML_MAIN_NS} xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS}>
          {generateElements(model, geometry, section.header)}
        </w:hdr>,
      ].join(""),
      contentType: CONTENT_TYPE_HEADER,
    })
    const evenHeaderId =
      section.evenHeader !== undefined
        ? model.documentRelationshipRegistry.register({
            type: RELATIONSHIP_TYPE_HEADER,
            target: `evenHeader${index}.xml`,
            data: [
              XML_STANDALONE_HEADER,
              <w:hdr xmlns:w={WORDPROCESSINGML_MAIN_NS} xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS}>
                {generateElements(model, geometry, section.evenHeader)}
              </w:hdr>,
            ].join(""),
            contentType: CONTENT_TYPE_HEADER,
          })
        : headerId

    sectPrChildren.push(<w:headerReference w:type="even" r:id={evenHeaderId} />)
    sectPrChildren.push(<w:headerReference w:type="default" r:id={headerId} />)
  }
  if (formatting.titlePage && section.firstFooter) {
    const firstFooterId = model.documentRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_FOOTER,
      target: `firstFooter${index}.xml`,
      data: [
        XML_STANDALONE_HEADER,
        <w:ftr xmlns:w={WORDPROCESSINGML_MAIN_NS} xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS}>
          {generateElements(model, geometry, section.firstFooter)}
        </w:ftr>,
      ].join(""),
      contentType: CONTENT_TYPE_FOOTER,
    })

    sectPrChildren.push(<w:footerReference w:type="first" r:id={firstFooterId} />)
  }
  if (section.footer) {
    const footerId = model.documentRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_FOOTER,
      target: `footer${index}.xml`,
      data: [
        XML_STANDALONE_HEADER,
        <w:ftr xmlns:w={WORDPROCESSINGML_MAIN_NS} xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS}>
          {generateElements(model, geometry, section.footer)}
        </w:ftr>,
      ].join(""),
      contentType: CONTENT_TYPE_FOOTER,
    })
    const evenFooterId =
      section.evenFooter !== undefined
        ? model.documentRelationshipRegistry.register({
            type: RELATIONSHIP_TYPE_FOOTER,
            target: `evenFooter${index}.xml`,
            data: [
              XML_STANDALONE_HEADER,
              <w:ftr xmlns:w={WORDPROCESSINGML_MAIN_NS} xmlns:r={RELATIONSHIPS_OFFICE_DOCUMENT_NS}>
                {generateElements(model, geometry, section.evenFooter)}
              </w:ftr>,
            ].join(""),
            contentType: CONTENT_TYPE_FOOTER,
          })
        : footerId

    sectPrChildren.push(<w:footerReference w:type="even" r:id={evenFooterId} />)
    sectPrChildren.push(<w:footerReference w:type="default" r:id={footerId} />)
  }

  const footnoteFormatMap: Record<RTFPageSetup["footnoteNumbering"], string> = {
    decimal: "decimal",
    lowercase: "lowerLetter",
    uppercase: "upperLetter",
    lowerRoman: "lowerRoman",
    upperRoman: "upperRoman",
    chicago: "symbol",
  }
  const footnotePositionMap: Record<RTFPageSetup["footnotePosition"], string> = {
    bottom: "pageBottom",
    beneath: "beneathText",
    section: "sectEnd",
    document: "docEnd",
  }

  sectPrChildren.push(
    <w:footnotePr>
      <w:pos w:val={footnotePositionMap[model.pageSetup.footnotePosition || "bottom"]} />
      <w:numFmt w:val={footnoteFormatMap[model.pageSetup.footnoteNumbering || "decimal"]} />
    </w:footnotePr>
  )
  sectPrChildren.push(
    <w:endnotePr>
      <w:pos w:val="docEnd" />
      <w:numFmt w:val={footnoteFormatMap[model.pageSetup.endnoteNumbering || "decimal"]} />
    </w:endnotePr>
  )

  // Section break type
  if (formatting.sectionBreak) {
    const breakMap: Record<RTFSectionFormatting["sectionBreak"], string> = {
      column: "nextColumn",
      nextPage: "nextPage",
      evenPage: "evenPage",
      oddPage: "oddPage",
      none: "continuous",
    }

    sectPrChildren.push(<w:type w:val={breakMap[formatting.sectionBreak]} />)
  }

  // Paper dimensions
  sectPrChildren.push(
    <w:pgSz
      w:w={pageWidth}
      w:h={pageHeight}
      w:orient={(formatting.landscape !== undefined ? formatting.landscape : model.pageSetup.landscape) ? "landscape" : "portrait"}
    />
  )

  // Page margins
  sectPrChildren.push(
    <w:pgMar
      w:top={marginTop}
      w:right={marginRight}
      w:bottom={marginBottom}
      w:left={marginLeft}
      w:gutter={gutter}
      w:header={toTwip(section.formatting.headerDistance, 708)}
      w:footer={toTwip(section.formatting.footerDistance, 708)}
    />
  )

  // Columns
  if ((section.formatting.columnCount || 1) > 1) {
    sectPrChildren.push(
      <w:cols
        w:num={section.formatting.columnCount}
        w:space={toTwip(section.formatting.columnSpacing)}
        w:equalWidth
        w:sep={section.formatting.lineBetweenColumns}
      />
    )
  }

  // Vertical text alignment
  if (formatting.valign !== undefined) {
    const alignMap: Record<RTFSectionFormatting["valign"], string> = {
      top: "start",
      center: "center",
      bottom: "end",
      justified: "justified",
    }

    sectPrChildren.push(<w:jc w:val={alignMap[formatting.valign]} />)
  }

  // Page numbering
  if (formatting.pageNumberFormat !== undefined) {
    const numberingMap: Record<RTFSectionFormatting["pageNumberFormat"], string> = {
      decimal: "decimal",
      upperRoman: "upperRoman",
      lowerRoman: "lowerRoman",
      upperLetter: "upperLetter",
      lowerLetter: "lowerLetter",
    }

    sectPrChildren.push(
      <w:pgNumType w:fmt={numberingMap[formatting.pageNumberFormat]} w:start={formatting.pageNumberRestart ? formatting.pageNumberStart : undefined} />
    )
  }

  if (formatting.titlePage) {
    sectPrChildren.push(<w:titlePg />)
  }

  return [<w:sectPr>{sectPrChildren}</w:sectPr>, geometry]
}
