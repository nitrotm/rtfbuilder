import { RichTextDocumentModel } from "../document"
import { RTFParagraphElement, RTFParagraphFormatting } from "../types"

import { validateRTFBorders, validateRTFSize } from "./base"
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

  // Validate color aliases
  if (formatting.backgroundColorAlias !== undefined && !model.colorRegistry.has(formatting.backgroundColorAlias)) {
    throw new Error(`Background color "${formatting.backgroundColorAlias}" not found.`)
  }

  // List formatting
  if (formatting.listAlias !== undefined && !model.listRegistry.has(formatting.listAlias)) {
    throw new Error(`List "${formatting.listAlias}" not found.`)
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
