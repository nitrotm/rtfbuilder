import { RichTextDocumentModel } from "../document"
import { RTFColor, RTFColumnBreakElement, RTFElement } from "../types"

import { generateParagraph } from "./paragraph"
import { generateTable } from "./table"

export const XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>`

/** Convert RTFColor to hex string */
export function convertColorToHex(color: Partial<RTFColor>): string {
  return [
    (color.red || 0).toString(16).padStart(2, "0"),
    (color.green || 0).toString(16).padStart(2, "0"),
    (color.blue || 0).toString(16).padStart(2, "0"),
  ].join("")
}

/** Content Types XML */
export const CONTENT_TYPES = [
  XML_HEADER,
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
  '<Default Extension="xml" ContentType="application/xml" />',
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />',
  '<Default Extension="png" ContentType="image/png" />',
  '<Default Extension="jpeg" ContentType="image/jpeg" />',
  '<Override PartName="/_rels/.rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />',
  '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml" />',
  '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml" />',
  '<Override PartName="/word/_rels/document.xml.rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />',
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" />',
  '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml" />',
  '<Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml" />',
  '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml" />',
  "</Types>",
].join("")

/** Package relationships */
export const PACKAGE_RELATIONSHIPS = [
  XML_HEADER,
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officedocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml" />',
  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml" />',
  '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml" />',
  "</Relationships>",
].join("")

/** Application properties */
export const APPLICATION_PROPERTIES = [
  XML_HEADER,
  '<Properties xmlns="http://purl.oclc.org/ooxml/officeDocument/extendedProperties" xmlns:vt="http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes">',
  "<Application>rtfbuilder</Application>",
  "<AppVersion>1.0000</AppVersion>",
  "<Pages>1</Pages>",
  "<Words>51</Words>",
  "<Characters>222</Characters>",
  "<CharactersWithSpaces>261</CharactersWithSpaces>",
  "<Paragraphs>12</Paragraphs>",
  "</Properties>",
].join("")

/** Generate document relationships */
export const DOCUMENT_RELATIONSHIPS = [
  XML_HEADER,
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />',
  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml" />',
  '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml" />',
  "</Relationships>",
].join("")

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

/** Generate document content */
export function generateElements(
  model: RichTextDocumentModel,
  geometry: SectionGeometry,
  elements: (RTFElement | RTFColumnBreakElement)[]
): JSX.IntrinsicElements[] {
  const content: JSX.IntrinsicElements[] = []

  for (const element of elements) {
    if ("type" in element) {
      switch (element.type) {
        case "paragraph":
          content.push(generateParagraph(model, geometry, element))
          break
        case "table":
          content.push(generateTable(model, geometry, element))
          break
        case "container":
          content.push(...generateElements(model, geometry, element.content))
          break
        case "columnBreak":
          content.push(<w:br w:type="column" />)
          break
        default:
          throw new Error(`Unknown element type: ${(element as any).type}`)
      }
    }
  }
  return content
}
