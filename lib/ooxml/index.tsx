import { zipSync } from "fflate"

import { AbstractRichTextDocument, RichTextDocumentOptions } from "../document"

import {
  CONTENT_TYPE_CORE_PROPERTIES,
  CONTENT_TYPE_CUSTOM_PROPERTIES,
  CONTENT_TYPE_DOCUMENT,
  CONTENT_TYPE_ENDNOTES,
  CONTENT_TYPE_EXTENDED_PROPERTIES,
  CONTENT_TYPE_FONT_TABLE,
  CONTENT_TYPE_FOOTNOTES,
  CONTENT_TYPE_NUMBERING,
  CONTENT_TYPE_RELATIONSHIPS,
  CONTENT_TYPE_SETTINGS,
  CONTENT_TYPE_STYLES,
  generateApplicationProperties,
  generateContentTypes,
  generateCustomProperties,
  generateRelationships,
  OOXMLDocumentModel,
  OOXMLRelationship,
  RELATIONSHIP_TYPE_CORE_PROPERTIES,
  RELATIONSHIP_TYPE_CUSTOM_PROPERTIES,
  RELATIONSHIP_TYPE_ENDNOTES,
  RELATIONSHIP_TYPE_EXTENDED_PROPERTIES,
  RELATIONSHIP_TYPE_FONT_TABLE,
  RELATIONSHIP_TYPE_FOOTNOTES,
  RELATIONSHIP_TYPE_NUMBERING,
  RELATIONSHIP_TYPE_OFFICE_DOCUMENT,
  RELATIONSHIP_TYPE_SETTINGS,
  RELATIONSHIP_TYPE_STYLES,
} from "./base"
import {
  generateCoreProps,
  generateDocument,
  generateEndnotes,
  generateFontTable,
  generateFootnotes,
  generateNumbering,
  generateSettings,
  generateStyles,
} from "./document"
import { RTFRegistry } from "lib/utils"

/** OOXML generation options */
export type OOXMLGenerationOptions = {
  creator?: string
  description?: string
  title?: string
  subject?: string
  keywords?: string
}

/** Generate OOXML document from the given model */
export class OOXMLDocument extends AbstractRichTextDocument<Uint8Array> {
  /**
   * Create a new OOXML document
   */
  constructor(options: Partial<RichTextDocumentOptions> = {}) {
    super(options)
  }

  /**
   * Render the document to the desired output format (ZIP file as Uint8Array)
   */
  override render(options: Partial<OOXMLGenerationOptions> = {}): Uint8Array {
    const files: Record<string, Uint8Array> = {}
    const model: OOXMLDocumentModel = {
      ...this.model,
      contentTypeOverrides: [],
      packageRelationshipRegistry: new RTFRegistry<OOXMLRelationship>({
        eq: (a, b) => a.type === b.type && a.target === b.target && a.targetMode === b.targetMode,
        prefix: "rId",
        startAt: 1,
      }),
      documentRelationshipRegistry: new RTFRegistry<OOXMLRelationship>({
        eq: (a, b) => a.type === b.type && a.target === b.target && a.targetMode === b.targetMode,
        prefix: "rId",
        startAt: 1,
      }),
      footnoteRegistry: new RTFRegistry({ eq: () => false, prefix: "fn", startAt: 2 }),
      endnoteRegistry: new RTFRegistry({ eq: () => false, prefix: "en", startAt: 2 }),
    }
    const core_xml = generateCoreProps(model, options)
    const app_xml = generateApplicationProperties(model)
    const custom_xml = generateCustomProperties(model)
    const document_xml = generateDocument(model)
    const styles_xml = generateStyles(model)
    const settings_xml = generateSettings(model)
    const fontTable_xml = generateFontTable(model)
    const numbering_xml = generateNumbering(model)
    const footnotes_xml = generateFootnotes(model)
    const endnotes_xml = generateEndnotes(model)
    // const theme_xml = generateTheme(model)

    model.packageRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_CORE_PROPERTIES,
      target: "docProps/core.xml",
      data: core_xml,
      contentType: CONTENT_TYPE_CORE_PROPERTIES,
    })
    model.packageRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_EXTENDED_PROPERTIES,
      target: "docProps/app.xml",
      data: app_xml,
      contentType: CONTENT_TYPE_EXTENDED_PROPERTIES,
    })
    model.packageRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_CUSTOM_PROPERTIES,
      target: "docProps/custom.xml",
      data: custom_xml,
      contentType: CONTENT_TYPE_CUSTOM_PROPERTIES,
    })
    model.packageRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_OFFICE_DOCUMENT,
      target: "word/document.xml",
      data: document_xml,
      contentType: CONTENT_TYPE_DOCUMENT,
    })

    model.documentRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_STYLES,
      target: "styles.xml",
      data: styles_xml,
      contentType: CONTENT_TYPE_STYLES,
    })
    model.documentRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_FONT_TABLE,
      target: "fontTable.xml",
      data: fontTable_xml,
      contentType: CONTENT_TYPE_FONT_TABLE,
    })
    model.documentRelationshipRegistry.register({
      type: RELATIONSHIP_TYPE_SETTINGS,
      target: "settings.xml",
      data: settings_xml,
      contentType: CONTENT_TYPE_SETTINGS,
    })
    if (model.listRegistry.size > 0) {
      model.documentRelationshipRegistry.register({
        type: RELATIONSHIP_TYPE_NUMBERING,
        target: "numbering.xml",
        data: numbering_xml,
        contentType: CONTENT_TYPE_NUMBERING,
      })
    }
    if (model.footnoteRegistry.size > 0) {
      model.documentRelationshipRegistry.register({
        type: RELATIONSHIP_TYPE_FOOTNOTES,
        target: "footnotes.xml",
        data: footnotes_xml,
        contentType: CONTENT_TYPE_FOOTNOTES,
      })
    }
    if (model.endnoteRegistry.size > 0) {
      model.documentRelationshipRegistry.register({
        type: RELATIONSHIP_TYPE_ENDNOTES,
        target: "endnotes.xml",
        data: endnotes_xml,
        contentType: CONTENT_TYPE_ENDNOTES,
      })
    }
    // model.documentRelationshipRegistry.register({
    //   type: RELATIONSHIP_TYPE_THEME,
    //   target: "theme/theme1.xml",
    //   data: theme_xml,
    //   contentType: "application/vnd.openxmlformats-officedocument.theme+xml",
    // })

    const encoder = new TextEncoder()

    for (const entry of model.packageRelationshipRegistry.entries()) {
      if (entry.item.data === undefined) {
        continue
      }
      files[entry.item.target] = typeof entry.item.data === "string" ? encoder.encode(entry.item.data) : entry.item.data
      if (entry.item.contentType !== undefined) {
        model.contentTypeOverrides.push({ partName: `/${entry.item.target}`, contentType: entry.item.contentType })
      }
    }
    files["_rels/.rels"] = encoder.encode(generateRelationships(model.packageRelationshipRegistry))
    model.contentTypeOverrides.push({ partName: "/_rels/.rels", contentType: CONTENT_TYPE_RELATIONSHIPS })

    for (const entry of model.documentRelationshipRegistry.entries()) {
      if (entry.item.data === undefined) {
        continue
      }
      files[`word/${entry.item.target}`] = typeof entry.item.data === "string" ? encoder.encode(entry.item.data) : entry.item.data
      if (entry.item.contentType !== undefined) {
        model.contentTypeOverrides.push({ partName: `/word/${entry.item.target}`, contentType: entry.item.contentType })
      }
    }
    files["word/_rels/document.xml.rels"] = encoder.encode(generateRelationships(model.documentRelationshipRegistry))
    model.contentTypeOverrides.push({ partName: "/word/_rels/document.xml.rels", contentType: CONTENT_TYPE_RELATIONSHIPS })

    files["[Content_Types].xml"] = encoder.encode(generateContentTypes(model))
    return zipSync(files)
  }
}
