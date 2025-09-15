import { zipSync } from "fflate"

import { AbstractRichTextDocument, RichTextDocumentOptions } from "../document"

import {
  APPLICATION_PROPERTIES,
  CONTENT_TYPES,
  generateDocumentRelationships,
  OOXMLDocumentModel,
  OOXMLRelationship,
  PACKAGE_RELATIONSHIPS,
  RELATIONSHIP_TYPE_ENDNOTES,
  RELATIONSHIP_TYPE_FONT_TABLE,
  RELATIONSHIP_TYPE_FOOTNOTES,
  RELATIONSHIP_TYPE_NUMBERING,
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
      relationshipRegistry: new RTFRegistry<OOXMLRelationship>({
        eq: (a, b) => a.type === b.type && a.target === b.target && a.targetMode === b.targetMode,
        prefix: "rId",
        startAt: 1,
      }),
      footnoteRegistry: new RTFRegistry({ eq: () => false, prefix: "fn", startAt: 2 }),
      endnoteRegistry: new RTFRegistry({ eq: () => false, prefix: "en", startAt: 2 }),
    }

    model.relationshipRegistry.register({ type: RELATIONSHIP_TYPE_STYLES, target: "styles.xml" })
    model.relationshipRegistry.register({ type: RELATIONSHIP_TYPE_FONT_TABLE, target: "fontTable.xml" })
    model.relationshipRegistry.register({ type: RELATIONSHIP_TYPE_SETTINGS, target: "settings.xml" })
    model.relationshipRegistry.register({ type: RELATIONSHIP_TYPE_NUMBERING, target: "numbering.xml" })
    model.relationshipRegistry.register({ type: RELATIONSHIP_TYPE_FOOTNOTES, target: "footnotes.xml" })
    model.relationshipRegistry.register({ type: RELATIONSHIP_TYPE_ENDNOTES, target: "endnotes.xml" })

    const document_xml = generateDocument(model)
    const styles_xml = generateStyles(model)
    const settings_xml = generateSettings(model)
    const fontTable_xml = generateFontTable(model)

    // Required files
    const encoder = new TextEncoder()

    files["[Content_Types].xml"] = encoder.encode(CONTENT_TYPES)
    files["docProps/core.xml"] = encoder.encode(generateCoreProps(model, options))
    files["docProps/app.xml"] = encoder.encode(APPLICATION_PROPERTIES)
    files["_rels/.rels"] = encoder.encode(PACKAGE_RELATIONSHIPS)
    files["word/_rels/document.xml.rels"] = encoder.encode(generateDocumentRelationships(model))
    files["word/document.xml"] = encoder.encode(document_xml)
    files["word/styles.xml"] = encoder.encode(styles_xml)
    files["word/settings.xml"] = encoder.encode(settings_xml)
    files["word/fontTable.xml"] = encoder.encode(fontTable_xml)
    files["word/numbering.xml"] = encoder.encode(generateNumbering(model))
    files["word/footnotes.xml"] = encoder.encode(generateFootnotes(model))
    files["word/endnotes.xml"] = encoder.encode(generateEndnotes(model))

    for (const entry of model.relationshipRegistry.entries()) {
      if (entry.item.data === undefined) {
        continue
      }
      files[`word/${entry.item.target}`] = typeof entry.item.data === "string" ? encoder.encode(entry.item.data) : entry.item.data
    }

    // Create ZIP file
    return zipSync(files)
  }
}
