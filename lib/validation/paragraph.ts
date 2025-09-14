import { RichTextDocumentModel } from "../document"
import { RTFParagraphElement, RTFParagraphFormatting } from "../types"

import { validateRTFBorders, validateRTFShading, validateRTFSize } from "./base"
import { validateCharacter } from "./character"

/**
 * Validate paragraph formatting properties
 */
export function validateParagraphFormatting(model: RichTextDocumentModel, formatting: Partial<RTFParagraphFormatting> = {}): void {
  // Validate style alias
  if (formatting.styleAlias !== undefined && !model.styleRegistry.has(formatting.styleAlias)) {
    throw new Error(`Style "${formatting.styleAlias}" not found.`)
  }
  validateRTFSize(formatting.lineSpacing, "lineSpacing", true)
  validateRTFSize(formatting.firstLineIndent, "firstLineIndent", true, true)
  validateRTFSize(formatting.leftIndent, "leftIndent", true, true)
  validateRTFSize(formatting.rightIndent, "rightIndent", true, true)
  validateRTFSize(formatting.spaceBefore, "spaceBefore", true)
  validateRTFSize(formatting.spaceAfter, "spaceAfter", true)

  // Style & effects
  validateRTFBorders(model, formatting.borders, "borders")
  validateRTFShading(model, formatting.shading)

  // List formatting
  if (formatting.listOverrideAlias !== undefined && !model.listOverrideRegistry.has(formatting.listOverrideAlias)) {
    throw new Error(`List override "${formatting.listOverrideAlias}" not found.`)
  }
  if (formatting.listLevel !== undefined) {
    if (!Number.isInteger(formatting.listLevel) || formatting.listLevel < 0 || formatting.listLevel > 8) {
      throw new Error(`List level must be an integer between 0-8, got ${formatting.listLevel}`)
    }
  }
}

/**
 * Validate paragraph
 */
export function validateParagraph(model: RichTextDocumentModel, element: RTFParagraphElement): void {
  // Validate paragraph formatting
  validateParagraphFormatting(model, element.formatting)

  // Validate content elements
  element.content.forEach((item) => validateCharacter(model, item))
}
