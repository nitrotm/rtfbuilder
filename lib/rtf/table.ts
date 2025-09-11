import { RTFDocumentModel } from "lib/document"
import {
  RTFBorders,
  RTFTableBorders,
  RTFTableCellFormatting,
  RTFTableElement,
  RTFTableFormatting,
  RTFTableRow,
  RTFTableRowFlag,
  RTFTableRowFormatting,
} from "lib/types"
import { toTwips } from "lib/utils"

import { generateBorderStyle, generateElements, generateShadingPattern, SectionGeometry } from "./base"

/** Generate table cell formatting control words */
export function generateTableCellFormatting(model: RTFDocumentModel, formatting: Partial<RTFTableCellFormatting>): string {
  const parts: string[] = []

  // Cell merging
  if (formatting.hspan === "first") parts.push("\\clmgf")
  if (formatting.hspan === "next") parts.push("\\clmrg")
  if (formatting.vspan === "first") parts.push("\\clvmgf")
  if (formatting.vspan === "next") parts.push("\\clvmrg")

  // Cell vertical alignment
  if (formatting.valign !== undefined) {
    if (formatting.valign === "center") parts.push("\\clvertalc")
    else if (formatting.valign === "bottom") parts.push("\\clvertalb")
    else parts.push("\\clvertalt")
  }

  // Cell borders
  if (formatting.borders !== undefined) {
    if (formatting.borders.top) parts.push("\\clbrdrt", generateBorderStyle(model, formatting.borders.top))
    if (formatting.borders.bottom) parts.push("\\clbrdrb", generateBorderStyle(model, formatting.borders.bottom))
    if (formatting.borders.left) parts.push("\\clbrdrl", generateBorderStyle(model, formatting.borders.left))
    if (formatting.borders.right) parts.push("\\clbrdrr", generateBorderStyle(model, formatting.borders.right))
  }

  // Cell shading
  if (formatting.shading) {
    if (formatting.shading.ratio !== undefined) {
      parts.push(`\\clshdng${Math.max(0, Math.min(10000, Math.round(formatting.shading.ratio * 10000)))}`)
    }
    if (formatting.shading.pattern) {
      // Table cell patterns use 'clbg' prefix instead of 'bg'
      const pattern = generateShadingPattern(formatting.shading.pattern).replace(/\\bg/, "\\clbg")
      parts.push(pattern)
    }
    if (formatting.shading.foregroundColorAlias) {
      parts.push(`\\clcfpat${model.colorRegistry.index(formatting.shading.foregroundColorAlias)}`)
    }
    if (formatting.shading.backgroundColorAlias) {
      parts.push(`\\clcbpat${model.colorRegistry.index(formatting.shading.backgroundColorAlias)}`)
    }
  }

  // Cell padding
  if (formatting.padding !== undefined) {
    if (formatting.padding.top !== undefined) parts.push(`\\clpadt${toTwips(formatting.padding.top)}`)
    if (formatting.padding.bottom !== undefined) parts.push(`\\clpadb${toTwips(formatting.padding.bottom)}`)
    if (formatting.padding.left !== undefined) parts.push(`\\clpadl${toTwips(formatting.padding.left)}`)
    if (formatting.padding.right !== undefined) parts.push(`\\clpadr${toTwips(formatting.padding.right)}`)
  }
  return parts.join("")
}

/** Generate table row formatting control words */
export function generateTableRowFormatting(
  _model: RTFDocumentModel,
  tableFormatting: Partial<RTFTableFormatting>,
  formatting: Partial<RTFTableRowFormatting>
): string {
  const parts: string[] = []

  // Nesting level
  if (tableFormatting.nestedLevel) {
    parts.push(`\\itap${tableFormatting.nestedLevel}`)
  }

  // Row height and indents
  if (formatting.height) parts.push(`\\trrh${toTwips(formatting.height)}`)
  if (tableFormatting.leftIndent) parts.push(`\\trleft${toTwips(tableFormatting.leftIndent)}`)
  if (tableFormatting.rightIndent) parts.push(`\\trright${toTwips(tableFormatting.rightIndent)}`)

  // Row gaps - use row value or inherit from table cellSpacing
  const gap = formatting.cellSpacing || tableFormatting.cellSpacing
  if (gap) parts.push(`\\trgaph${toTwips(gap)}`)

  // Row alignment
  const alignMap: Record<RTFTableFormatting["align"], string> = {
    left: "\\trql",
    center: "\\trqc",
    right: "\\trqr",
  }

  parts.push(alignMap[tableFormatting.align || "left"])

  // Row flags
  const flagsMap: Record<RTFTableRowFlag, string> = {
    repeatHeader: "\\trhdr",
    keepTogether: "\\trkeep",
    lastRow: "\\lastrow",
  }
  const flags: RTFTableRowFlag[] = formatting.flags || []

  flags.forEach((flag) => parts.push(flagsMap[flag] || ""))
  return parts.join("")
}

/** Table geometry for layout calculations */
export type TableGeometry = {
  containerWidth: number
  columnWidths: number[]
}

/** Generate a table element */
export function generateTable(model: RTFDocumentModel, geometry: SectionGeometry, element: RTFTableElement): string {
  const formatting = element.formatting || {}
  const parts: string[] = []

  // Compute table layout
  const containerWidth = toTwips(formatting.width, geometry.contentWidth)
  const fixedCellWidth = element.columns.reduce((sum, column) => sum + toTwips(column.width, 0), 0)
  const flexibleColumns = element.columns.filter((column) => column.width === undefined)
  const flexibleWeight = flexibleColumns.reduce((sum, column) => sum + (column.weight || 1), 0)
  const flexibleWidth = containerWidth - fixedCellWidth
  const tableGeometry: TableGeometry = {
    containerWidth,
    columnWidths: element.columns.map((column) => {
      if (column.width !== undefined) {
        return toTwips(column.width, 0)
      }
      return flexibleWeight > 0 ? Math.floor(flexibleWidth * ((column.weight || 1) / flexibleWeight)) : 0
    }),
  }

  element.rows.forEach((row, index) => {
    const isFirstRow = index === 0
    const isLastRow = index === element.rows.length - 1

    // Pass table context to row generation
    parts.push(generateTableRow(model, geometry, tableGeometry, row, formatting, isFirstRow, isLastRow))
  })
  return parts.join("\n")
}

/** Generate a table row */
export function generateTableRow(
  model: RTFDocumentModel,
  geometry: SectionGeometry,
  tableGeometry: TableGeometry,
  row: RTFTableRow,
  table: Partial<RTFTableFormatting>,
  isFirstRow: boolean,
  isLastRow: boolean
): string {
  const parts: string[] = []

  // Table row preamble
  const rowFormattingData = generateTableRowFormatting(model, table, row.formatting || {})

  parts.push("{\\trowd")
  if (rowFormattingData.length > 0) {
    parts.push(rowFormattingData)
  }

  // Define cell boundaries and properties
  const formatting = row.formatting || {}
  const borders = mergeTableRowBorders(table.cellFormatting?.borders, formatting.cellFormatting?.borders, isFirstRow, isLastRow)
  let cellX = 0

  row.cells.forEach((cell, index) => {
    const isFirstCell = index === 0
    const isLastCell = index === row.cells!.length - 1
    const cellFormatting = cell.formatting || {}

    cellX += tableGeometry.columnWidths[index] || 0
    parts.push(
      generateTableCellFormatting(model, {
        ...cellFormatting,
        borders: mergeCellBorders(borders, cellFormatting.borders, isFirstCell, isLastCell),
        padding: cellFormatting.padding || formatting.cellFormatting?.padding || table.cellFormatting?.padding,
      })
    )
    parts.push(`\\cellx${cellX}`)
  })

  // Cell content
  for (const cell of row.cells) {
    const data = generateElements(model, geometry, cell.content, "", true)

    if (data.length > 0 && !data.startsWith("\\") && !data.startsWith("{")) {
      parts.push(" ")
    }
    parts.push(data)
    parts.push("\\cell")
  }

  parts.push("\\row}")
  return parts.join("")
}

/** Merge table and row borders for a row */
function mergeTableRowBorders(
  tableBorders: Partial<RTFTableBorders> = {},
  rowBorders: Partial<RTFTableBorders> = {},
  isFirstRow?: boolean,
  isLastRow?: boolean
) {
  const merged: typeof rowBorders = {}

  // Row borders take precedence over table borders
  if (rowBorders.top || (tableBorders.top && isFirstRow)) {
    merged.top = rowBorders.top || tableBorders.top
  }
  if (rowBorders.bottom || (tableBorders.bottom && isLastRow)) {
    merged.bottom = rowBorders.bottom || tableBorders.bottom
  }
  if (rowBorders.left || tableBorders.left) {
    merged.left = rowBorders.left || tableBorders.left
  }
  if (rowBorders.right || tableBorders.right) {
    merged.right = rowBorders.right || tableBorders.right
  }
  if (rowBorders.horizontal || tableBorders.horizontal) {
    merged.horizontal = rowBorders.horizontal || tableBorders.horizontal
  }
  if (rowBorders.vertical || tableBorders.vertical) {
    merged.vertical = rowBorders.vertical || tableBorders.vertical
  }
  return merged
}

/** Merge row and cell borders for a cell */
function mergeCellBorders(rowBorders: Partial<RTFTableBorders> = {}, cellBorders: Partial<RTFBorders> = {}, isFirstCell?: boolean, isLastCell?: boolean) {
  const merged: typeof cellBorders = {}

  // Cell borders take precedence over row borders
  // For cells, use horizontal borders from rows as top/bottom
  if (cellBorders.top || rowBorders.horizontal) {
    merged.top = cellBorders.top || rowBorders.horizontal
  }
  if (cellBorders.bottom || rowBorders.horizontal) {
    merged.bottom = cellBorders.bottom || rowBorders.horizontal
  }

  // Use vertical borders from rows for left/right on edge cells
  if (cellBorders.left || (isFirstCell && rowBorders.left) || (!isFirstCell && rowBorders.vertical)) {
    merged.left = cellBorders.left || (isFirstCell ? rowBorders.left : rowBorders.vertical)
  }
  if (cellBorders.right || (isLastCell && rowBorders.right) || (!isLastCell && rowBorders.vertical)) {
    merged.right = cellBorders.right || (isLastCell ? rowBorders.right : rowBorders.vertical)
  }
  return merged
}
