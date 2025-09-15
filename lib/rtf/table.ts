import { RichTextDocumentModel } from "../document"
import { RTFTableCellFormatting, RTFTableElement, RTFTableFormatting, RTFTableRow, RTFTableRowFlag, RTFTableRowFormatting } from "../types"
import { mergeCellBorders, toTwip } from "../utils"

import { generateBorderStyle, generateElements, SectionGeometry } from "./base"

/** Generate table cell formatting control words */
export function generateTableCellFormatting(model: RichTextDocumentModel, formatting: Partial<RTFTableCellFormatting>): string {
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
  if (formatting.backgroundColorAlias !== undefined) {
    parts.push(`\\clcbpat${model.colorRegistry.index(formatting.backgroundColorAlias)}`)
  }

  // Cell padding
  if (formatting.padding !== undefined) {
    if (formatting.padding.top !== undefined) parts.push(`\\clpadt${toTwip(formatting.padding.top)}`)
    if (formatting.padding.bottom !== undefined) parts.push(`\\clpadb${toTwip(formatting.padding.bottom)}`)
    if (formatting.padding.left !== undefined) parts.push(`\\clpadl${toTwip(formatting.padding.left)}`)
    if (formatting.padding.right !== undefined) parts.push(`\\clpadr${toTwip(formatting.padding.right)}`)
  }
  return parts.join("")
}

/** Generate table row formatting control words */
export function generateTableRowFormatting(
  _model: RichTextDocumentModel,
  tableFormatting: Partial<RTFTableFormatting>,
  formatting: Partial<RTFTableRowFormatting>
): string {
  const parts: string[] = []

  // Nesting level
  if (tableFormatting.nestedLevel) {
    parts.push(`\\itap${tableFormatting.nestedLevel}`)
  }

  // Row height and indents
  if (formatting.height) parts.push(`\\trrh${toTwip(formatting.height)}`)
  if (tableFormatting.leftIndent) parts.push(`\\trleft${toTwip(tableFormatting.leftIndent)}`)
  if (tableFormatting.rightIndent) parts.push(`\\trright${toTwip(tableFormatting.rightIndent)}`)

  // Row gaps - use row value or inherit from table cellSpacing
  const gap = tableFormatting.cellSpacing
  if (gap) parts.push(`\\trgaph${toTwip(gap)}`)

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
type TableGeometry = {
  containerWidth: number
  columnWidths: number[]
}

/** Generate a table element */
export function generateTable(model: RichTextDocumentModel, geometry: SectionGeometry, element: RTFTableElement): string {
  const parts: string[] = []
  const formatting = element.formatting

  // Compute table layout
  const containerWidth = toTwip(formatting.width, geometry.contentWidth)
  const fixedCellWidth = element.columns.reduce((sum, column) => sum + toTwip(column.width, 0), 0)
  const flexibleColumns = element.columns.filter((column) => column.width === undefined)
  const flexibleWeight = flexibleColumns.reduce((sum, column) => sum + (column.weight || 1), 0)
  const flexibleWidth = containerWidth - fixedCellWidth
  const tableGeometry: TableGeometry = {
    containerWidth,
    columnWidths: element.columns.map((column) => {
      if (column.width !== undefined) {
        return toTwip(column.width, 0)
      }
      return flexibleWeight > 0 ? Math.floor(flexibleWidth * ((column.weight || 1) / flexibleWeight)) : 0
    }),
  }

  element.rows.forEach((row, index) => {
    const isFirstRow = index === 0
    const isLastRow = index === element.rows.length - 1

    // Pass table context to row generation
    parts.push(generateTableRow(model, geometry, tableGeometry, formatting, row, isFirstRow, isLastRow))
  })
  return parts.join("\n")
}

/** Generate a table row */
export function generateTableRow(
  model: RichTextDocumentModel,
  geometry: SectionGeometry,
  tableGeometry: TableGeometry,
  tableFormatting: Partial<RTFTableFormatting>,
  row: RTFTableRow,
  isFirstRow: boolean,
  isLastRow: boolean
): string {
  const parts: string[] = []
  const formatting = row.formatting

  // Table row preamble
  const rowFormattingData = generateTableRowFormatting(model, tableFormatting, formatting)

  parts.push("{\\trowd")
  if (rowFormattingData.length > 0) {
    parts.push(rowFormattingData)
  }

  // Define cell boundaries and properties
  let cellX = 0

  row.cells.forEach((cell, index) => {
    const isFirstCell = index === 0
    const isLastCell = index === row.cells!.length - 1
    const cellFormatting = cell.formatting || {}
    const borders = mergeCellBorders(tableFormatting.borders, formatting.borders, cellFormatting.borders, isFirstRow, isLastRow, isFirstCell, isLastCell)
    const borderX = (toTwip(borders?.left?.width) + toTwip(borders?.right?.width)) / 2

    cellX += Math.max(0, (tableGeometry.columnWidths[index] || 0) - borderX)
    parts.push(
      generateTableCellFormatting(model, {
        ...cellFormatting,
        borders,
        backgroundColorAlias: cellFormatting.backgroundColorAlias || formatting.backgroundColorAlias || tableFormatting.backgroundColorAlias,
        padding: cellFormatting.padding || tableFormatting.cellPadding,
      })
    )
    parts.push(`\\cellx${cellX}`)
  })

  // Cell content
  for (const [index, _column] of tableGeometry.columnWidths.entries()) {
    const cell = index < row.cells.length ? row.cells[index] : undefined
    const data = generateElements(model, geometry, cell?.content || [], "", true)

    if (data.length > 0 && !data.startsWith("\\") && !data.startsWith("{")) {
      parts.push(" ")
    }
    parts.push(data)
    parts.push("\\cell")
  }

  parts.push("\\row}")
  return parts.join("")
}
