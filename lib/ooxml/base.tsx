import { RTFRegistry, toEighthPoint, toPoint } from "lib/utils"
import { DEFAULT_COLOR_ALIAS, RichTextDocumentModel } from "../document"
import { RTFBorder, RTFColor, RTFColumnBreakElement, RTFElement, RTFFootnoteElement } from "../types"

import { generateParagraph } from "./paragraph"
import { generateTable } from "./table"

const XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>`

export const XML_STANDALONE_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`

export const CONTENT_TYPES_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
export const CONTENT_TYPE_RELATIONSHIPS = "application/vnd.openxmlformats-package.relationships+xml"
export const CONTENT_TYPE_CORE_PROPERTIES = "application/vnd.openxmlformats-package.core-properties+xml"
export const CONTENT_TYPE_EXTENDED_PROPERTIES = "application/vnd.openxmlformats-officedocument.extended-properties+xml"
export const CONTENT_TYPE_CUSTOM_PROPERTIES = "application/vnd.openxmlformats-officedocument.custom-properties+xml"
export const CONTENT_TYPE_THEME = "application/vnd.openxmlformats-officedocument.theme+xml"
export const CONTENT_TYPE_DOCUMENT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"
export const CONTENT_TYPE_STYLES = "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"
export const CONTENT_TYPE_FONT_TABLE = "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"
export const CONTENT_TYPE_SETTINGS = "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"
export const CONTENT_TYPE_NUMBERING = "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"
export const CONTENT_TYPE_FOOTNOTES = "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"
export const CONTENT_TYPE_ENDNOTES = "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml"
export const CONTENT_TYPE_HEADER = "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"
export const CONTENT_TYPE_FOOTER = "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"

export const RELATIONSHIPS_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
export const RELATIONSHIP_TYPE_CORE_PROPERTIES = "http://schemas.openxmlformats.org/officedocument/2006/relationships/metadata/core-properties"
export const RELATIONSHIP_TYPE_CUSTOM_PROPERTIES = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties"
export const RELATIONSHIP_TYPE_EXTENDED_PROPERTIES = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties"
export const RELATIONSHIP_TYPE_OFFICE_DOCUMENT = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
export const RELATIONSHIP_TYPE_IMAGE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
export const RELATIONSHIP_TYPE_STYLES = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"
export const RELATIONSHIP_TYPE_THEME = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme"
export const RELATIONSHIP_TYPE_FONT_TABLE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable"
export const RELATIONSHIP_TYPE_SETTINGS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings"
export const RELATIONSHIP_TYPE_NUMBERING = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering"
export const RELATIONSHIP_TYPE_FOOTNOTES = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes"
export const RELATIONSHIP_TYPE_ENDNOTES = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes"
export const RELATIONSHIP_TYPE_HEADER = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header"
export const RELATIONSHIP_TYPE_FOOTER = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer"

export const CORE_PROPERTIES_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
export const EXTENDED_PROPERTIES_NS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" // "http://purl.oclc.org/ooxml/officeDocument/extendedProperties"
export const CUSTOM_PROPERTIES_NS = "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" // "http://purl.oclc.org/ooxml/officeDocument/customProperties"
export const DOC_PROPS_VTYPES_NS = "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes" // "http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes"
export const DC_ELEMENTS_NS = "http://purl.org/dc/elements/1.1/"
export const DC_TERMS_NS = "http://purl.org/dc/terms/"
export const DCMI_TYPE_NS = "http://purl.org/dc/dcmitype/"

export const RELATIONSHIPS_OFFICE_DOCUMENT_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships" // "http://purl.oclc.org/ooxml/officeDocument/relationships"
export const WORDPROCESSINGML_MAIN_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main" // "http://purl.oclc.org/ooxml/wordprocessingml/main"
export const DRAWINGML_MAIN_NS = "http://schemas.openxmlformats.org/drawingml/2006/main" // "http://purl.oclc.org/ooxml/drawingml/main"
export const DRAWINGML_PICTURE_NS = "http://schemas.openxmlformats.org/drawingml/2006/picture" // "http://purl.oclc.org/ooxml/drawingml/picture"
export const DRAWINGML_WORDPROCESSING_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" // "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing"

export type OOXMLContentTypeOverride = {
  partName: string
  contentType: string
}

export type OOXMLRelationship = {
  type: string
  target: string
  targetMode?: "External"
  data?: string | Uint8Array<ArrayBufferLike>
  contentType?: string
}

export type OOXMLDocumentModel = RichTextDocumentModel & {
  contentTypeOverrides: OOXMLContentTypeOverride[]
  packageRelationshipRegistry: RTFRegistry<OOXMLRelationship>
  documentRelationshipRegistry: RTFRegistry<OOXMLRelationship>
  footnoteRegistry: RTFRegistry<RTFFootnoteElement>
  endnoteRegistry: RTFRegistry<RTFFootnoteElement>
}

/** Convert RTFColor to hex string */
export function convertColorToHex(color: Partial<RTFColor>): string {
  return [
    (color.red || 0).toString(16).padStart(2, "0"),
    (color.green || 0).toString(16).padStart(2, "0"),
    (color.blue || 0).toString(16).padStart(2, "0"),
  ].join("")
}

export function convertBorderProps(model: OOXMLDocumentModel, border: Partial<RTFBorder>) {
  return {
    "w:val": border.style || "single",
    "w:sz": border.width !== undefined ? toEighthPoint(border.width) : undefined,
    "w:space": border.spacing !== undefined ? toPoint(border.spacing) : undefined,
    "w:color": convertColorToHex(model.colorRegistry.get(border.colorAlias || DEFAULT_COLOR_ALIAS).item),
  }
}

function encodeXmlAttribute(value: string | undefined): string {
  if (value === undefined) return ""
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

/** Content Types XML */
export function generateContentTypes(model: OOXMLDocumentModel) {
  const parts = [
    XML_HEADER,
    `<Types xmlns="${CONTENT_TYPES_NS}">`,
    '<Default Extension="xml" ContentType="application/xml" />',
    `<Default Extension="rels" ContentType="${encodeXmlAttribute(CONTENT_TYPE_RELATIONSHIPS)}" />`,
    '<Default Extension="png" ContentType="image/png" />',
    '<Default Extension="jpeg" ContentType="image/jpeg" />',
  ]

  for (const override of model.contentTypeOverrides.sort((a, b) => a.partName.localeCompare(b.partName))) {
    parts.push(`<Override PartName="${encodeXmlAttribute(override.partName)}" ContentType="${encodeXmlAttribute(override.contentType)}" />`)
  }
  parts.push("</Types>")
  return parts.join("")
}

/** Generate document relationships */
export function generateRelationships(registry: RTFRegistry<OOXMLRelationship>) {
  const parts = [XML_HEADER, `<Relationships xmlns="${RELATIONSHIPS_NS}">`]

  for (const entry of registry.entries()) {
    parts.push(
      `<Relationship Id="${encodeXmlAttribute(entry.name)}"`,
      ` Type="${encodeXmlAttribute(entry.item.type)}"`,
      ` Target="${encodeXmlAttribute(entry.item.target)}"`
    )

    if (entry.item.targetMode) {
      parts.push(` TargetMode="${encodeXmlAttribute(entry.item.targetMode)}"`)
    }
    parts.push(" />")
  }
  parts.push("</Relationships>")
  return parts.join("")
}

/** Application properties */
export function generateApplicationProperties(_model: OOXMLDocumentModel) {
  return [
    XML_STANDALONE_HEADER,
    `<Properties xmlns="${EXTENDED_PROPERTIES_NS}" xmlns:vt="${DOC_PROPS_VTYPES_NS}">`,
    "<Template></Template>",
    "<TotalTime>0</TotalTime>",
    "<Application>rftbuilder/1.0</Application>",
    "<AppVersion>1.0000</AppVersion>",
    "<Pages>1</Pages>",
    "<Words>0</Words>",
    "<Characters>0</Characters>",
    "<CharactersWithSpaces>0</CharactersWithSpaces>",
    "<Paragraphs>0</Paragraphs>",
    "</Properties>",
  ].join("")
}

/** Custom properties */
export function generateCustomProperties(_model: OOXMLDocumentModel) {
  return [XML_STANDALONE_HEADER, `<Properties xmlns="${CUSTOM_PROPERTIES_NS}" xmlns:vt="${DOC_PROPS_VTYPES_NS}">`, "</Properties>"].join("")
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

/** Generate document content */
export function generateElements(
  model: OOXMLDocumentModel,
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
          content.push(
            <w:p>
              <w:r>
                <w:br w:type="column" />
              </w:r>
            </w:p>
          )
          break
        default:
          throw new Error(`Unknown element type: ${(element as any).type}`)
      }
    }
  }
  return content
}
