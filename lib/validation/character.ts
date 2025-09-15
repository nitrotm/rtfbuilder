import { RichTextDocumentModel } from "../document"
import {
  RTFCharacterContentElement,
  RTFCharacterElement,
  RTFCharacterFormatting,
  RTFFootnoteElement,
  RTFHyperlink,
  RTFPictureElement,
  RTFPictureFormatting,
} from "../types"

import { validateRTFSize } from "./base"
import { validateParagraph } from "./paragraph"

/**
 * Validate text formatting properties
 */
export function validateCharacterFormatting(model: RichTextDocumentModel, formatting: Partial<RTFCharacterFormatting> = {}): void {
  // Validate style alias
  if (formatting.styleAlias !== undefined && !model.styleRegistry.has(formatting.styleAlias)) {
    throw new Error(`Style "${formatting.styleAlias}" not found.`)
  }

  // Validate language ID (must be valid Windows LCID)
  if (formatting.language !== undefined) {
    if (!Number.isInteger(formatting.language) || formatting.language < 0 || formatting.language > 65535) {
      throw new Error(`Language ID must be a valid Windows LCID (0-65535), got ${formatting.language}`)
    }
  }

  // Validate font styles
  if (formatting.fontAlias !== undefined && !model.fontRegistry.has(formatting.fontAlias)) {
    throw new Error(`Font "${formatting.fontAlias}" not found.`)
  }
  validateRTFSize(formatting.fontSize, "fontSize")
  validateRTFSize(formatting.kerning, "kerning", true)
  validateRTFSize(formatting.characterSpacing, "characterSpacing", true, true)
  if (formatting.horizontalScaling !== undefined) {
    if (formatting.horizontalScaling < 0.2 || formatting.horizontalScaling > 2.0) {
      throw new Error(`Horizontal scaling must be between 20-200 percent, got ${formatting.horizontalScaling}`)
    }
  }

  // Validate color aliases
  if (formatting.colorAlias !== undefined && !model.colorRegistry.has(formatting.colorAlias)) {
    throw new Error(`Color "${formatting.colorAlias}" not found.`)
  }
  if (formatting.highlightColorAlias !== undefined && !model.colorRegistry.has(formatting.highlightColorAlias)) {
    throw new Error(`Highlight color "${formatting.highlightColorAlias}" not found.`)
  }
}

/**
 * Validate picture formatting properties
 */
export function validatePictureFormatting(_model: RichTextDocumentModel, formatting: Partial<RTFPictureFormatting> = {}): void {
  // Validate display dimensions
  validateRTFSize(formatting.displayWidth, "displayWidth")
  validateRTFSize(formatting.displayHeight, "displayHeight")

  // Validate crop values (must be non-negative)
  if (formatting.cropTop !== undefined && formatting.cropTop < 0) {
    throw new Error(`Picture cropTop must be non-negative, got ${formatting.cropTop}`)
  }
  if (formatting.cropRight !== undefined && formatting.cropRight < 0) {
    throw new Error(`Picture cropRight must be non-negative, got ${formatting.cropRight}`)
  }
  if (formatting.cropBottom !== undefined && formatting.cropBottom < 0) {
    throw new Error(`Picture cropBottom must be non-negative, got ${formatting.cropBottom}`)
  }
  if (formatting.cropLeft !== undefined && formatting.cropLeft < 0) {
    throw new Error(`Picture cropLeft must be non-negative, got ${formatting.cropLeft}`)
  }
}

/**
 * Validate hyperlink properties
 */
export function validateHyperlink(model: RichTextDocumentModel, link: RTFHyperlink): void {
  switch (link.type) {
    case "bookmark":
      if (!model.bookmarkRegistry.has(link.bookmarkAlias)) {
        throw new Error(`Bookmark "${link.bookmarkAlias}" not found.`)
      }
      break

    case "external":
      if (!link.url || link.url.length === 0) {
        throw new Error("Hyperlink URL cannot be empty")
      }
      if (link.url.length > 2048) {
        throw new Error(`Hyperlink URL cannot exceed 2048 characters, got ${link.url.length}`)
      }
      break

    default:
      throw new Error(`Unknown hyperlink type: ${(link as any).type}`)
  }
}

/**
 * Validate text
 */
export function validateCharacter(model: RichTextDocumentModel, element: RTFCharacterElement): void {
  validateCharacterFormatting(model, element.formatting)
  if (element.bookmarkAlias !== undefined && !model.bookmarkRegistry.has(element.bookmarkAlias)) {
    throw new Error(`Bookmark "${element.bookmarkAlias}" not found.`)
  }
  if (element.link?.type !== undefined) {
    validateHyperlink(model, element.link)
  }
  for (const item of element.content) {
    validateTextContentElement(model, item)
  }
}

/**
 * Validate text content element (items that can appear inside character elements)
 */
function validateTextContentElement(model: RichTextDocumentModel, item: RTFCharacterContentElement): void {
  switch (item.type) {
    case "text":
      break

    case "footnote":
      validateFootnote(model, item)
      break

    case "picture":
      validatePicture(model, item)
      break

    case "pageBreak":
    case "lineBreak":
    case "tab":
    case "nonBreakingSpace":
    case "nonBreakingHyphen":
    case "optionalHyphen":
    case "pageNumber":
    case "totalPages":
    case "date":
    case "time":
      // These are simple elements with no additional properties to validate
      break

    default:
      throw new Error(`Unknown text content type: ${(item as any).type}`)
  }
}

/**
 * Validate footnote element
 */
function validateFootnote(model: RichTextDocumentModel, item: RTFFootnoteElement): void {
  // Validate custom mark if provided
  if (item.customMark !== undefined && item.customMark.length === 0) {
    throw new Error("Footnote custom mark cannot be empty if provided")
  }

  // Validate footnote content (must be a paragraph)
  if (!item.content) {
    throw new Error("Footnote must have content")
  }

  validateParagraph(model, item.content)
}

/**
 * Validate picture element
 */
function validatePicture(model: RichTextDocumentModel, element: RTFPictureElement): void {
  // Validate data
  if (!element.picture.data || element.picture.data.length === 0 || element.picture.width <= 0 || element.picture.height <= 0) {
    throw new Error("Picture cannot be empty and must have positive width and height")
  }

  // Validate formatting
  validatePictureFormatting(model, element.formatting)
}
