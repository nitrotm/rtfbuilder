import { RTFTableCell, RTFTableCellFormatting, RTFTableElement, RTFTableFormatting, RTFTableRow, RTFTableRowFormatting } from "../types"
import { mergeCellBorders, RTFRegistry, toTwip } from "../utils"

import { convertBorderProps, convertColorToHex, generateElements, OOXMLDocumentModel, OOXMLRelationship, SectionGeometry } from "./base"

/** Table geometry for layout calculations */
type TableGeometry = {
  containerWidth: number
  columnWidths: number[]
}

/** Generate table from RTFTableElement */
export function generateTable(
  model: OOXMLDocumentModel,
  relationshipRegistry: RTFRegistry<OOXMLRelationship>,
  geometry: SectionGeometry,
  element: RTFTableElement
): JSX.IntrinsicElements {
  const formattingChildren: JSX.IntrinsicElements[] = []
  const formatting = element.formatting || {}

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

  formattingChildren.push(<w:tblW w:type="dxa" w:w={tableGeometry.containerWidth} />)

  // Table alignment
  const alignMap: Record<RTFTableFormatting["align"], string> = {
    left: "start",
    center: "center",
    right: "end",
  }

  formattingChildren.push(<w:jc w:val={alignMap[formatting.align || "left"]} />)
  if (formatting.cellSpacing !== undefined) {
    formattingChildren.push(<w:tblCellSpacing w:type="dxa" w:w={toTwip(formatting.cellSpacing)} />)
  }
  formattingChildren.push(<w:tblInd w:type="dxa" w:w={toTwip(formatting.leftIndent) + toTwip(formatting.cellPadding?.left)} />)
  if (formatting.borders !== undefined) {
    formattingChildren.push(
      <w:tblBorders>
        {formatting.borders.top && <w:top {...convertBorderProps(model, formatting.borders.top)} />}
        {formatting.borders.left && <w:start {...convertBorderProps(model, formatting.borders.left)} />}
        {formatting.borders.bottom && <w:bottom {...convertBorderProps(model, formatting.borders.bottom)} />}
        {formatting.borders.right && <w:end {...convertBorderProps(model, formatting.borders.right)} />}
        {formatting.borders.horizontal && <w:insideH {...convertBorderProps(model, formatting.borders.horizontal)} />}
        {formatting.borders.vertical && <w:insideV {...convertBorderProps(model, formatting.borders.vertical)} />}
      </w:tblBorders>
    )
  }
  formattingChildren.push(<w:tblLayout w:type="fixed" />)
  formattingChildren.push(
    <w:tblCellMar>
      <w:top w:type="dxa" w:w={toTwip(formatting.cellPadding?.top)} />
      <w:start w:type="dxa" w:w={toTwip(formatting.cellPadding?.left)} />
      <w:bottom w:type="dxa" w:w={toTwip(formatting.cellPadding?.bottom)} />
      <w:end w:type="dxa" w:w={toTwip(formatting.cellPadding?.right)} />
    </w:tblCellMar>
  )

  // Generate table rows
  const children: JSX.IntrinsicElements[] = []

  if (element.columns && element.columns.length > 0) {
    const gridChildren: JSX.IntrinsicElements[] = []

    for (const width of tableGeometry.columnWidths) {
      gridChildren.push(<w:gridCol w:w={width} />)
    }
    children.push(<w:tblGrid>{gridChildren}</w:tblGrid>)
  }

  element.rows.forEach((row, index) => {
    const isFirstRow = index === 0
    const isLastRow = index === element.rows.length - 1

    children.push(generateTableRow(model, relationshipRegistry, geometry, tableGeometry, row, formatting, isFirstRow, isLastRow))
  })
  return (
    <w:tbl>
      <w:tblPr>{formattingChildren}</w:tblPr>
      {children}
    </w:tbl>
  )
}

/** Generate table row from RTFTableRow */
function generateTableRow(
  model: OOXMLDocumentModel,
  relationshipRegistry: RTFRegistry<OOXMLRelationship>,
  geometry: SectionGeometry,
  tableGeometry: TableGeometry,
  row: RTFTableRow,
  tableFormatting: Partial<RTFTableFormatting>,
  isFirstRow: boolean,
  isLastRow: boolean
): JSX.IntrinsicElements {
  const formattingChildren: JSX.IntrinsicElements[] = []
  const formatting = row.formatting || {}

  // Row height
  if (row.formatting.height !== undefined) {
    const heightTwips = toTwip(row.formatting.height)

    formattingChildren.push(<w:trHeight w:val={Math.abs(heightTwips)} w:hRule={heightTwips < 0 ? "exact" : "atLeast"} />)
  }

  if (row.formatting.flags?.includes("repeatHeader")) {
    formattingChildren.push(<w:tblHeader />)
  }

  // Generate table cells
  const children: JSX.IntrinsicElements[] = []
  let merged = false

  for (const [index, _width] of tableGeometry.columnWidths.entries()) {
    const isFirstCell = index === 0
    const isLastCell = index === row.cells!.length - 1
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
    children.push(
      generateTableCell(
        model,
        relationshipRegistry,
        geometry,
        tableGeometry,
        tableFormatting,
        formatting,
        cell,
        colSpan,
        isFirstRow,
        isLastRow,
        isFirstCell,
        isLastCell
      )
    )
  }
  return (
    <w:tr>
      {formattingChildren.length > 0 && <w:trPr>{formattingChildren}</w:trPr>}
      {children}
    </w:tr>
  )
}

/** Generate table cell from RTFTableCell */
function generateTableCell(
  model: OOXMLDocumentModel,
  relationshipRegistry: RTFRegistry<OOXMLRelationship>,
  geometry: SectionGeometry,
  _tableGeometry: TableGeometry,
  tableFormatting: Partial<RTFTableFormatting>,
  rowFormatting: Partial<RTFTableRowFormatting>,
  cell: RTFTableCell,
  colSpan: number,
  isFirstRow: boolean,
  isLastRow: boolean,
  isFirstCell: boolean,
  isLastCell: boolean
): JSX.IntrinsicElements {
  const formattingChildren: JSX.IntrinsicElements[] = []
  const formatting = cell.formatting || {}

  // Horizontal merge (colspan)
  if (colSpan > 1) {
    formattingChildren.push(<w:gridSpan w:val={colSpan} />)
  }

  // Vertical merge (rowspan)
  if (formatting.vspan) {
    switch (formatting.vspan) {
      case "first":
        formattingChildren.push(<w:vMerge w:val="restart" />)
        break
      case "next":
        formattingChildren.push(<w:vMerge w:val="continue" />)
        break
    }
  }

  // borders
  const borders = mergeCellBorders(tableFormatting.borders, rowFormatting.borders, formatting.borders, isFirstRow, isLastRow, isFirstCell, isLastCell)

  if (borders !== undefined && (borders.top || borders.left || borders.bottom || borders.right)) {
    formattingChildren.push(
      <w:tcBorders>
        {borders.top && <w:top {...convertBorderProps(model, borders.top)} />}
        {borders.left && <w:start {...convertBorderProps(model, borders.left)} />}
        {borders.bottom && <w:bottom {...convertBorderProps(model, borders.bottom)} />}
        {borders.right && <w:end {...convertBorderProps(model, borders.right)} />}
      </w:tcBorders>
    )
  }

  // Cell background color
  if (formatting.backgroundColorAlias !== undefined || rowFormatting.backgroundColorAlias !== undefined) {
    formattingChildren.push(
      <w:shd w:val="clear" w:fill={convertColorToHex(model.colorRegistry.get(formatting.backgroundColorAlias || rowFormatting.backgroundColorAlias).item)} />
    )
  }

  // Cell padding
  if (formatting.padding !== undefined) {
    formattingChildren.push(
      <w:tcMar>
        {formatting.padding.top !== undefined && <w:top w:type="dxa" w:w={toTwip(formatting.padding.top)} />}
        {formatting.padding.left !== undefined && <w:start w:type="dxa" w:w={toTwip(formatting.padding.left)} />}
        {formatting.padding.bottom !== undefined && <w:bottom w:type="dxa" w:w={toTwip(formatting.padding.bottom)} />}
        {formatting.padding.right !== undefined && <w:end w:type="dxa" w:w={toTwip(formatting.padding.right)} />}
      </w:tcMar>
    )
  }

  // Add alignment
  if (formatting.valign !== undefined) {
    const alignMap: Record<RTFTableCellFormatting["valign"], string> = {
      top: "top",
      center: "center",
      bottom: "bottom",
    }

    formattingChildren.push(<w:vAlign w:val={alignMap[formatting.valign]} />)
  }

  // Generate cell content
  const children: JSX.IntrinsicElements[] = []

  if (cell.content && cell.content.length > 0) {
    children.push(...generateElements(model, relationshipRegistry, geometry, cell.content))
  }
  if (children.length === 0) {
    children.push(<w:p></w:p>)
  }
  return (
    <w:tc>
      {formattingChildren.length > 0 && <w:tcPr>{formattingChildren}</w:tcPr>}
      {children}
    </w:tc>
  )
}
