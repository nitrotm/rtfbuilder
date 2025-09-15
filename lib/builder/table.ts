import {
  RTFBorder,
  RTFCharacterFormatting,
  RTFColumnBreakElement,
  RTFElement,
  RTFPictureData,
  RTFPictureFormatting,
  RTFRect,
  RTFSize,
  RTFTableCell,
  RTFTableCellFormatting,
  RTFTableColumn,
  RTFTableElement,
  RTFTableFormatting,
  RTFTableRow,
  RTFTableRowFlag,
  RTFTableRowFormatting,
} from "../types"
import { pt } from "../utils"

import { RTFBuilder, RTFSpecialContent } from "./base"
import { ListBuilder } from "./list"
import { ParagraphBuilder } from "./paragraph"

export class TableBuilder extends RTFBuilder<RTFTableElement> {
  private readonly _children: TableRowBuilder[] = []
  private readonly _columns: Partial<RTFTableColumn>[] = []
  private readonly _formatting: Partial<RTFTableFormatting> = {}

  constructor(
    parent: RTFBuilder<unknown>,
    readonly nestedLevel: number
  ) {
    super(parent)
    this._formatting.nestedLevel = nestedLevel
  }

  get empty(): boolean {
    return !this._children.some((x) => !x.empty)
  }
  get rows(): TableRowBuilder[] {
    return this._children
  }

  column(index: number, width?: RTFSize, weight?: number): this {
    this._columns[index] ||= {}
    if (width !== undefined) this._columns[index].width = width
    if (weight !== undefined) this._columns[index].weight = weight
    return this
  }

  newRow(): TableRowBuilder {
    const builder = new TableRowBuilder(this, this, this._children.length)

    this._children.push(builder)
    return builder
  }
  withRow(f: (builder: TableRowBuilder) => void): this {
    f(this.newRow())
    return this
  }

  newHeaderRow(): TableRowBuilder {
    const builder = new TableRowBuilder(this, this, this._children.length, "repeatHeader")

    this._children.push(builder)
    return builder
  }
  withHeaderRow(f: (builder: TableRowBuilder) => void): this {
    f(this.newHeaderRow())
    return this
  }

  align(align: "left" | "center" | "right"): this {
    this._formatting.align = align
    return this
  }

  left(): this {
    return this.align("left")
  }

  center(): this {
    return this.align("center")
  }

  right(): this {
    return this.align("right")
  }

  width(size: RTFSize): this {
    this._formatting.width = size
    return this
  }

  leftIndent(size: RTFSize): this {
    this._formatting.leftIndent = size
    return this
  }

  rightIndent(size: RTFSize): this {
    this._formatting.rightIndent = size
    return this
  }

  border(side: "top" | "right" | "bottom" | "left" | "horizontal" | "vertical" | "all", value: Partial<RTFBorder> = { width: pt(1) }): this {
    this._formatting.borders ||= {}
    switch (side) {
      case "all":
        this._formatting.borders.top = value
        this._formatting.borders.right = value
        this._formatting.borders.bottom = value
        this._formatting.borders.left = value
        this._formatting.borders.vertical = value
        this._formatting.borders.horizontal = value
        break
      default:
        this._formatting.borders[side] = value
        break
    }
    return this
  }

  backgroundColor(backgroundColorAlias: string): this {
    this._formatting.backgroundColorAlias = backgroundColorAlias
    return this
  }

  cellSpacing(size: RTFSize): this {
    this._formatting.cellSpacing = size
    return this
  }

  cellPadding(padding: Partial<RTFRect>): this {
    if (!this._formatting.cellPadding) {
      this._formatting.cellPadding = {}
    }
    this._formatting.cellPadding = {
      ...this._formatting.cellPadding,
      ...padding,
    }
    return this
  }

  with(formatting: Partial<RTFTableFormatting>): this {
    Object.assign(this._formatting, formatting)
    return this
  }

  build(): RTFTableElement {
    return {
      type: "table",
      formatting: this._formatting,
      columns: this._columns,
      rows: this._children.map((x) => x.build()),
    }
  }
}

class TableRowBuilder extends RTFBuilder<RTFTableRow> {
  private readonly _children: TableCellBuilder[] = []
  private readonly _formatting: Partial<RTFTableRowFormatting> = {}

  constructor(
    parent: RTFBuilder<unknown>,
    readonly table: TableBuilder,
    readonly index: number,
    ...flags: RTFTableRowFlag[]
  ) {
    super(parent)
    this._formatting.flags = flags
  }

  get empty(): boolean {
    return !this._children.some((x) => !x.empty)
  }
  get cells(): TableCellBuilder[] {
    return this._children
  }

  newCell(): TableCellBuilder {
    const builder = new TableCellBuilder(this, this, this._children.length)

    this.table.column(this._children.length)
    this._children.push(builder)
    return builder
  }
  withCell(f: (builder: TableCellBuilder) => void): this {
    f(this.newCell())
    return this
  }

  height(size: RTFSize): this {
    this._formatting.height = size
    return this
  }

  border(side: "top" | "right" | "bottom" | "left" | "vertical" | "all", value: Partial<RTFBorder> = { width: pt(1) }): this {
    this._formatting.borders ||= {}
    switch (side) {
      case "all":
        this._formatting.borders.top = value
        this._formatting.borders.right = value
        this._formatting.borders.bottom = value
        this._formatting.borders.left = value
        this._formatting.borders.vertical = value
        break
      default:
        this._formatting.borders[side] = value
        break
    }
    return this
  }

  backgroundColor(backgroundColorAlias: string): this {
    this._formatting.backgroundColorAlias = backgroundColorAlias
    return this
  }

  flags(...flags: RTFTableRowFlag[]): this {
    this._formatting.flags ||= []
    this._formatting.flags.push(...flags)
    return this
  }

  with(formatting: Partial<RTFTableRowFormatting>): this {
    Object.assign(this._formatting, formatting)
    return this
  }

  build(): RTFTableRow {
    return {
      formatting: this._formatting,
      cells: this._children.map((x) => x.build()),
    }
  }
}

class TableCellBuilder extends RTFBuilder<RTFTableCell> {
  private readonly _children: RTFBuilder<RTFElement>[] = []
  private readonly _formatting: Partial<RTFTableCellFormatting> = {}
  private _lastParagraph: ParagraphBuilder | null = null

  constructor(
    parent: RTFBuilder<unknown>,
    readonly row: TableRowBuilder,
    readonly index: number
  ) {
    super(parent)
  }

  get table(): TableBuilder {
    return this.row.table
  }

  get empty(): boolean {
    return !this._children.some((x) => !x.empty)
  }
  get children(): RTFBuilder<RTFElement | RTFColumnBreakElement>[] {
    return this._children
  }
  get lastParagraph(): ParagraphBuilder {
    if (this._lastParagraph === null) {
      this._lastParagraph = this.newParagraph()
    }
    return this._lastParagraph
  }

  newParagraph(): ParagraphBuilder {
    const builder = new ParagraphBuilder(this)

    this._children.push(builder)
    this._lastParagraph = builder
    return builder
  }
  withText(...items: (string | RTFSpecialContent | Partial<RTFCharacterFormatting>)[]): this {
    this.lastParagraph.withText(...items)
    return this
  }
  withPicture(picture: RTFPictureData, formatting: Partial<RTFPictureFormatting> = {}): this {
    this.lastParagraph.withPicture(picture, formatting)
    return this
  }
  withFootnote(text: string, ...items: (string | Partial<RTFCharacterFormatting>)[]): this {
    this.lastParagraph.withFootnote(text, ...items)
    return this
  }
  withEndnote(text: string, ...items: (string | Partial<RTFCharacterFormatting>)[]): this {
    this.lastParagraph.withEndnote(text, ...items)
    return this
  }
  withBookmarkLink(anchor: string, text: string, formatting: Partial<RTFCharacterFormatting> = {}): this {
    this.lastParagraph.withBookmarkLink(anchor, text, formatting)
    return this
  }
  withExternalLink(url: string, text: string, formatting: Partial<RTFCharacterFormatting> = {}): this {
    this.lastParagraph.withExternalLink(url, text, formatting)
    return this
  }
  closeParagraph(): this {
    this._lastParagraph = null
    return this
  }

  withParagraph(f: (builder: ParagraphBuilder) => void): this {
    f(this.newParagraph())
    this._lastParagraph = null
    return this
  }

  newList(): ListBuilder {
    const builder = new ListBuilder(this)

    this._children.push(builder)
    this._lastParagraph = null
    return builder
  }
  withList(f: (builder: ListBuilder) => void): this {
    f(this.newList())
    return this
  }

  valign(align: "top" | "center" | "bottom"): this {
    this._formatting.valign = align
    return this
  }

  top(): this {
    return this.valign("top")
  }

  middle(): this {
    return this.valign("center")
  }

  bottom(): this {
    return this.valign("bottom")
  }

  hspan(value: "none" | "first" | "next" = "none"): this {
    this._formatting.hspan = value
    return this
  }

  vspan(value: "none" | "first" | "next" = "none"): this {
    this._formatting.vspan = value
    return this
  }

  border(side: "top" | "right" | "bottom" | "left" | "all", value: Partial<RTFBorder> = { width: pt(1) }): this {
    this._formatting.borders ||= {}
    switch (side) {
      case "all":
        this._formatting.borders.top = value
        this._formatting.borders.right = value
        this._formatting.borders.bottom = value
        this._formatting.borders.left = value
        break
      default:
        this._formatting.borders[side] = value
        break
    }
    return this
  }

  padding(padding: Partial<RTFRect>): this {
    if (!this._formatting.padding) {
      this._formatting.padding = {}
    }
    this._formatting.padding = {
      ...this._formatting.padding,
      ...padding,
    }
    return this
  }

  backgroundColor(alias: string): this {
    this._formatting.backgroundColorAlias = alias
    return this
  }

  with(formatting: Partial<RTFTableCellFormatting>): this {
    Object.assign(this._formatting, formatting)
    return this
  }

  build(): RTFTableCell {
    return {
      formatting: this._formatting,
      content: this._children.map((x) => x.build()),
    }
  }
}
