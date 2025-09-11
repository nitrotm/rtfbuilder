import { AbstractDocument, DocumentOptions } from "lib/document"

import {
  generateCharset,
  generateColorTable,
  generateDocumentInfo,
  generateFontTable,
  generateListOverrideTable,
  generateListTable,
  generatePageSetup,
  generateStyleTable,
  generateTypographySettings,
  generateViewSettings,
} from "./document"
import { generateSection } from "./section"

/** RTF generation options */
export type RTFGenerationOptions = {
  generator: string // Generator name
  creationTime: Date // Document creation time
  version: number // Document version
  editingMinutes: number // Total editing time in minutes
  printTime: Date // Last print time
  backupTime: Date // Last backup time
  internalVersion: number // Internal version number
}

/** Generate RTF document from the given model */
export class RTFDocument extends AbstractDocument<string> {
  /**
   * Create a new RTF document
   */
  constructor(options: Partial<DocumentOptions> = {}) {
    super(options)
  }

  /**
   * Render the document to the desired output format
   */
  override render(options: Partial<RTFGenerationOptions> = {}): string {
    const parts: string[] = []

    // Start RTF document
    parts.push("{\\rtf1")

    // Character set
    parts.push(generateCharset(this.model.charset))

    // Default font
    parts.push(`\\deff0`)

    // Default language (US English)
    parts.push("\\deflang1033\n")

    // Font table
    if (!this.model.fontRegistry.empty) {
      parts.push(generateFontTable(this.model.fontRegistry))
    }

    // Color table
    if (!this.model.colorRegistry.empty) {
      parts.push(generateColorTable(this.model.colorRegistry))
    }

    // Style table
    if (!this.model.styleRegistry.empty) {
      parts.push(generateStyleTable(this.model))
    }

    // List/override table
    if (!this.model.listRegistry.empty) {
      parts.push(generateListTable(this.model.listRegistry))
      parts.push(generateListOverrideTable(this.model.listRegistry, this.model.listOverrideRegistry))
    }

    // Document info
    parts.push(generateDocumentInfo(this.model, options))

    // Generator info
    if (options.generator !== undefined) {
      parts.push(`{\\*\\generator ${options.generator};}\n`)
    }

    // Page setup
    parts.push(generatePageSetup(this.model.pageSetup))

    // Typography settings
    parts.push(generateTypographySettings(this.model.typography))

    // View settings
    parts.push(generateViewSettings(this.model.viewSettings))

    // Document sections
    for (const [index, section] of this.model.sections.entries()) {
      if (index > 0) {
        parts.push("\\sect")
      }
      parts.push(generateSection(this.model, section))
    }

    // Close RTF document
    parts.push("}")
    return parts.join("")
  }
}
