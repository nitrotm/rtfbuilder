import { RichTextDocumentModel } from "../document"
import { RTFTableCell, RTFTableElement, RTFTableRow } from "../types"
import { toTwips } from "../utils"

import { generateElements, SectionGeometry } from "./base"

/** Table geometry for layout calculations */
type TableGeometry = {
  containerWidth: number
  columnWidths: number[]
}

/** Generate table from RTFTableElement */
export function generateTable(model: RichTextDocumentModel, geometry: SectionGeometry, table: RTFTableElement): JSX.IntrinsicElements {
  const tblChildren: JSX.IntrinsicElements[] = []

  // Compute table layout
  const containerWidth = toTwips(table.formatting.width, geometry.contentWidth)
  const fixedCellWidth = table.columns.reduce((sum, column) => sum + toTwips(column.width, 0), 0)
  const flexibleColumns = table.columns.filter((column) => column.width === undefined)
  const flexibleWeight = flexibleColumns.reduce((sum, column) => sum + (column.weight || 1), 0)
  const flexibleWidth = containerWidth - fixedCellWidth
  const tableGeometry: TableGeometry = {
    containerWidth,
    columnWidths: table.columns.map((column) => {
      if (column.width !== undefined) {
        return toTwips(column.width, 0)
      }
      return flexibleWeight > 0 ? Math.floor(flexibleWidth * ((column.weight || 1) / flexibleWeight)) : 0
    }),
  }

  // Generate table properties
  const tblPrChildren: JSX.IntrinsicElements[] = []

  // Table alignment
  if (table.formatting.align) {
    const alignMap: Record<typeof table.formatting.align, string> = {
      left: "start",
      center: "center",
      right: "end",
    }

    tblPrChildren.push(<w:jc w:val={alignMap[table.formatting.align]} />)
  }

  tblChildren.push(<w:tblPr>{tblPrChildren}</w:tblPr>)

  // Generate table grid (column definitions)
  if (table.columns && table.columns.length > 0) {
    const tblGridChildren: JSX.IntrinsicElements[] = []

    for (const width of tableGeometry.columnWidths) {
      tblGridChildren.push(<w:gridCol w:w={width} />)
    }
    tblChildren.push(<w:tblGrid>{tblGridChildren}</w:tblGrid>)
  }

  // Generate table rows
  for (const row of table.rows) {
    tblChildren.push(generateTableRow(model, geometry, tableGeometry, row))
  }
  return <w:tbl>{tblChildren}</w:tbl>
}

/** Generate table row from RTFTableRow */
function generateTableRow(model: RichTextDocumentModel, geometry: SectionGeometry, tableGeometry: TableGeometry, row: RTFTableRow): JSX.IntrinsicElements {
  const trChildren: JSX.IntrinsicElements[] = []

  // Generate row properties if present
  if (row.formatting && Object.keys(row.formatting).length > 0) {
    const trPrChildren: JSX.IntrinsicElements[] = []

    // Row height
    if (row.formatting.height !== undefined) {
      const heightTwips = toTwips(row.formatting.height)
      // Negative height means exact height, positive means minimum height
      const heightVal = heightTwips < 0 ? Math.abs(heightTwips) : heightTwips
      const heightRule = heightTwips < 0 ? "exact" : "atLeast"

      trPrChildren.push(<w:trHeight w:val={heightVal} w:hRule={heightRule} />)
    }
    if (trPrChildren.length > 0) {
      trChildren.push(<w:trPr>{trPrChildren}</w:trPr>)
    }
  }

  // Generate table cells
  let merged = false

  for (const [index, _width] of tableGeometry.columnWidths.entries()) {
    const cell = index < row.cells.length ? row.cells[index] : { formatting: {}, content: [] }
    let colSpan = 1

    if (merged) {
      if (cell.formatting.hspan === "next") {
        continue
      }
      merged = false
    } else if (cell.formatting.hspan === "first") {
      merged = true
      while (index + colSpan < tableGeometry.columnWidths.length && row.cells[index + colSpan].formatting.hspan === "next") {
        colSpan++
      }
    }
    trChildren.push(generateTableCell(model, geometry, tableGeometry, cell, colSpan))
  }
  return <w:tr>{trChildren}</w:tr>
}

/** Generate table cell from RTFTableCell */
function generateTableCell(
  model: RichTextDocumentModel,
  geometry: SectionGeometry,
  _tableGeometry: TableGeometry,
  cell: RTFTableCell,
  colSpan: number
): JSX.IntrinsicElements {
  const tcChildren: JSX.IntrinsicElements[] = []

  // Generate cell properties if present
  const tcPrChildren: JSX.IntrinsicElements[] = []

  // Horizontal merge (colspan)
  if (colSpan > 1) {
    tcPrChildren.push(<w:gridSpan w:val={colSpan} />)
  }

  // Vertical merge (rowspan)
  if (cell.formatting.vspan) {
    switch (cell.formatting.vspan) {
      case "first":
        tcPrChildren.push(<w:vMerge w:val="restart" />)
        break
      case "next":
        tcPrChildren.push(<w:vMerge w:val="continue" />)
        break
    }
  }

  if (tcPrChildren.length > 0) {
    tcChildren.push(<w:tcPr>{tcPrChildren}</w:tcPr>)
  }

  // Generate cell content
  if (cell.content && cell.content.length > 0) {
    tcChildren.push(...generateElements(model, geometry, cell.content))
  } else {
    // Empty cell - add empty paragraph
    tcChildren.push(<w:p></w:p>)
  }
  return <w:tc>{tcChildren}</w:tc>
}
