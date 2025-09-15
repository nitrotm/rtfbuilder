import { RichTextDocumentModel } from "../document"
import { RTFBorder, RTFBorders, RTFColumnBreakElement, RTFElement, RTFRect, RTFSize } from "../types"

import { validateParagraph } from "./paragraph"
import { validateTable } from "./table"

export const INVALID_CTRL_CHARS = /[\\{}]/
export const INVALID_NAME_CHARS = /[{}\\;]/

/**
 * Validate RTF size (number in twips or object with value and unit)
 */
export function validateRTFSize(size: RTFSize | undefined, fieldName: string, allowZero: boolean = false, allowNegative: boolean = false): void {
  if (size === undefined || size === null) {
    return
  }
  if (typeof size === "number") {
    if (!Number.isFinite(size) || (size === 0 && !allowZero) || (size < 0 && !allowNegative)) {
      throw new Error(`${fieldName} must be finite and positive, got ${size}`)
    }
    return
  }

  if (!Number.isFinite(size.value) || (size.value === 0 && !allowZero) || (size.value < 0 && !allowNegative)) {
    throw new Error(`${fieldName} must be finite and positive, got ${size.value} ${size.unit}`)
  }
}

/**
 * Validate RTF rectangle object
 */
export function validateRTFRect(rect: Partial<RTFRect> | undefined, fieldName: string, allowZero: boolean = true, allowNegative: boolean = false): void {
  if (rect) {
    validateRTFSize(rect.top, `${fieldName}.top`, allowZero, allowNegative)
    validateRTFSize(rect.right, `${fieldName}.right`, allowZero, allowNegative)
    validateRTFSize(rect.bottom, `${fieldName}.bottom`, allowZero, allowNegative)
    validateRTFSize(rect.left, `${fieldName}.left`, allowZero, allowNegative)
  }
}

/**
 * Validate RTF border object
 */
export function validateRTFBorder(model: RichTextDocumentModel, border: Partial<RTFBorder> | undefined, fieldName: string): void {
  if (border) {
    // Validate border width
    validateRTFSize(border.width, `${fieldName}.width`, true)

    // Validate border color alias
    if (border.colorAlias !== undefined && !model.colorRegistry.has(border.colorAlias)) {
      throw new Error(`${fieldName}.color "${border.colorAlias}" not found.`)
    }

    // Validate border spacing
    validateRTFSize(border.spacing, `${fieldName}.spacing`, true)
  }
}

/**
 * Validate RTF borders object
 */
export function validateRTFBorders(model: RichTextDocumentModel, borders: Partial<RTFBorders> | undefined, fieldName: string): void {
  if (borders) {
    validateRTFBorder(model, borders.top, `${fieldName}.top`)
    validateRTFBorder(model, borders.right, `${fieldName}.right`)
    validateRTFBorder(model, borders.bottom, `${fieldName}.bottom`)
    validateRTFBorder(model, borders.left, `${fieldName}.left`)
  }
}

/**
 * Validate RTFContent array
 */
export function validateElements(model: RichTextDocumentModel, elements: (RTFElement | RTFColumnBreakElement)[] = []): void {
  elements.forEach((element) => validateElement(model, element))
}

/**
 * Validate RTFContent item
 */
export function validateElement(model: RichTextDocumentModel, element: RTFElement | RTFColumnBreakElement): void {
  // Validate based on content type
  switch (element.type) {
    case "columnBreak":
      break
    case "paragraph":
      validateParagraph(model, element)
      break
    case "container":
      validateElements(model, element.content)
      break
    case "table":
      validateTable(model, element)
      break
    default:
      throw new Error(`Unknown content type: ${(element as any).type}`)
  }
}
