import { RTFDocumentModel } from "lib/document"
import { RTFSection, RTFSectionFormatting } from "lib/types"

import { validateElements, validateRTFRect, validateRTFSize } from "./base"

/**
 * Validate section formatting properties
 */
export function validateSectionFormatting(model: RTFDocumentModel, formatting: Partial<RTFSectionFormatting> = {}): void {
  // Validate style alias
  if (formatting.styleAlias !== undefined && !model.styleRegistry.has(formatting.styleAlias)) {
    throw new Error(`Section style "${formatting.styleAlias}" not found.`)
  }

  // Validate page dimensions
  validateRTFSize(formatting.pageWidth, "pageWidth")
  validateRTFSize(formatting.pageHeight, "pageHeight")
  validateRTFRect(formatting.margin, "margin")
  validateRTFSize(formatting.gutter, "gutter", true)

  // Validate header/footer distances
  validateRTFSize(formatting.headerDistance, "headerDistance", true)
  validateRTFSize(formatting.footerDistance, "footerDistance", true)

  // Validate column layout
  if (formatting.columnCount !== undefined) {
    if (!Number.isInteger(formatting.columnCount) || formatting.columnCount < 1 || formatting.columnCount > 45) {
      throw new Error(`Column count must be between 1-45, got ${formatting.columnCount}`)
    }
  }
  validateRTFSize(formatting.columnSpacing, "columnSpacing", true)

  // Validate page numbering
  if (formatting.pageNumberStart !== undefined) {
    if (!Number.isInteger(formatting.pageNumberStart) || formatting.pageNumberStart < 1) {
      throw new Error(`Page number start must be a positive integer, got ${formatting.pageNumberStart}`)
    }
  }

  // Validate page number position
  if (formatting.pageNumberPosition) {
    validateRTFSize(formatting.pageNumberPosition.x, "pageNumberPosition.x")
    validateRTFSize(formatting.pageNumberPosition.y, "pageNumberPosition.y")
  }
}

/**
 * Validate individual RTFSection
 */
export function validateSection(model: RTFDocumentModel, section: Partial<RTFSection> = {}): void {
  // Validate section formatting
  if (section.formatting) {
    validateSectionFormatting(model, section.formatting)
  }

  // Validate section content areas
  validateElements(model, section.header)
  validateElements(model, section.evenHeader)
  validateElements(model, section.firstHeader)
  validateElements(model, section.footer)
  validateElements(model, section.evenFooter)
  validateElements(model, section.firstFooter)
  validateElements(model, section.content)
}
