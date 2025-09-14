import { RichTextDocumentModel } from "../document"
import { RTFTableCell, RTFTableCellFormatting, RTFTableElement, RTFTableFormatting, RTFTableRow, RTFTableRowFormatting } from "../types"

import { validateElements, validateRTFBorder, validateRTFRect, validateRTFShading, validateRTFSize } from "./base"

/**
 * Validate table formatting properties
 */
export function validateTableFormatting(model: RichTextDocumentModel, formatting: Partial<RTFTableFormatting> = {}): void {
  // Validate dimensions
  validateRTFSize(formatting.width, "width")
  validateRTFSize(formatting.leftIndent, "leftIndent", true, true)
  validateRTFSize(formatting.rightIndent, "rightIndent", true, true)
  validateRTFSize(formatting.cellSpacing, "cellSpacing", true)

  // Validate nesting level
  if (formatting.nestedLevel !== undefined) {
    if (!Number.isInteger(formatting.nestedLevel) || formatting.nestedLevel < 0 || formatting.nestedLevel > 9) {
      throw new Error(`Table nesting level must be between 0-9, got ${formatting.nestedLevel}`)
    }
  }

  // Validate cell formatting
  if (formatting.cellFormatting) {
    validateTableCellFormatting(model, formatting.cellFormatting)
  }
}

/**
 * Validate table row formatting properties
 */
export function validateTableRowFormatting(model: RichTextDocumentModel, formatting: Partial<RTFTableRowFormatting> = {}): void {
  // Validate row height (can be negative for exact height)
  validateRTFSize(formatting.height, "height", true, true)

  // Validate cell spacing
  validateRTFSize(formatting.cellSpacing, "cellSpacing", true)

  // Validate cell formatting
  if (formatting.cellFormatting) {
    validateTableCellFormatting(model, formatting.cellFormatting)
  }

  // Validate flags for conflicts
  if (formatting.flags) {
    if (formatting.flags.includes("repeatHeader") && formatting.flags.includes("lastRow")) {
      throw new Error("Table row cannot be both a repeating header and the last row")
    }
  }
}

/**
 * Validate table cell formatting properties
 */
export function validateTableCellFormatting(model: RichTextDocumentModel, formatting: Partial<RTFTableCellFormatting> = {}): void {
  // Validate cell borders
  if (formatting.borders) {
    validateRTFBorder(model, formatting.borders.top, "cell.borders.top")
    validateRTFBorder(model, formatting.borders.right, "cell.borders.right")
    validateRTFBorder(model, formatting.borders.bottom, "cell.borders.bottom")
    validateRTFBorder(model, formatting.borders.left, "cell.borders.left")
    validateRTFBorder(model, formatting.borders.horizontal, "cell.borders.horizontal")
    validateRTFBorder(model, formatting.borders.vertical, "cell.borders.vertical")
  }

  // Validate cell shading
  validateRTFShading(model, formatting.shading)

  // Validate cell padding
  validateRTFRect(formatting.padding, "cell.padding", true)

  // Validate color aliases
  if (formatting.backgroundColorAlias !== undefined && !model.colorRegistry.has(formatting.backgroundColorAlias)) {
    throw new Error(`Cell background color "${formatting.backgroundColorAlias}" not found.`)
  }
  if (formatting.foregroundColorAlias !== undefined && !model.colorRegistry.has(formatting.foregroundColorAlias)) {
    throw new Error(`Cell foreground color "${formatting.foregroundColorAlias}" not found.`)
  }

  // Validate merge spans
  if (formatting.hspan !== undefined) {
    if (formatting.hspan !== "none" && formatting.hspan !== "first" && formatting.hspan !== "next") {
      throw new Error(`Invalid horizontal span value: ${formatting.hspan}. Must be "none", "first", or "next"`)
    }
  }

  if (formatting.vspan !== undefined) {
    if (formatting.vspan !== "none" && formatting.vspan !== "first" && formatting.vspan !== "next") {
      throw new Error(`Invalid vertical span value: ${formatting.vspan}. Must be "none", "first", or "next"`)
    }
  }
}

/**
 * Validate table
 */
export function validateTable(model: RichTextDocumentModel, content: RTFTableElement): void {
  // Validate table formatting
  validateTableFormatting(model, content.formatting)

  // Validate columns
  content.columns.forEach((column, index) => {
    validateRTFSize(column.width, `columns[${index}].width`)
    if (column.weight !== undefined && (!Number.isFinite(column.weight) || column.weight <= 0)) {
      throw new Error(`Column weight must be a positive number, got ${column.weight} for column ${index}`)
    }
  })

  // Validate each row
  content.rows.forEach((row) => validateTableRow(model, row))
}

/**
 * Validate table row
 */
export function validateTableRow(model: RichTextDocumentModel, row: RTFTableRow): void {
  // Validate row formatting
  validateTableRowFormatting(model, row.formatting)

  // Validate each cell
  row.cells.forEach((cell) => validateTableCell(model, cell))
}

/**
 * Validate table cell
 */
export function validateTableCell(model: RichTextDocumentModel, cell: RTFTableCell): void {
  // Validate cell formatting
  if (cell.formatting) {
    validateTableCellFormatting(model, cell.formatting)
  }

  // Validate cell content
  validateElements(model, cell.content)
}
