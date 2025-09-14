import { zipSync } from "fflate"

import { AbstractRichTextDocument, RichTextDocumentOptions } from "../document"

import { APPLICATION_PROPERTIES, CONTENT_TYPES, DOCUMENT_RELATIONSHIPS, PACKAGE_RELATIONSHIPS } from "./base"
import { generateCoreProps, generateDocument, generateFontTable, generateSettings, generateStyles } from "./document"

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
    // Create all the required files for the OOXML package
    const files: Record<string, Uint8Array> = {}
    const encoder = new TextEncoder()

    // Required files
    files["[Content_Types].xml"] = encoder.encode(CONTENT_TYPES)
    files["docProps/core.xml"] = encoder.encode(generateCoreProps(this.model, options))
    files["docProps/app.xml"] = encoder.encode(APPLICATION_PROPERTIES)
    files["_rels/.rels"] = encoder.encode(PACKAGE_RELATIONSHIPS)
    files["word/_rels/document.xml.rels"] = encoder.encode(DOCUMENT_RELATIONSHIPS)
    files["word/document.xml"] = encoder.encode(generateDocument(this.model))
    files["word/styles.xml"] = encoder.encode(generateStyles(this.model))
    files["word/settings.xml"] = encoder.encode(generateSettings(this.model))
    files["word/fontTable.xml"] = encoder.encode(generateFontTable(this.model))

    // Create ZIP file
    return zipSync(files)
  }
}
