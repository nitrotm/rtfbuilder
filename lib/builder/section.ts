import {
  RTFCharacterFormatting,
  RTFColumnBreakElement,
  RTFContainerElement,
  RTFElement,
  RTFPictureData,
  RTFPictureFormatting,
  RTFRect,
  RTFSection,
  RTFSectionFormatting,
  RTFSize,
} from "lib/types"
import { pt, toTwips } from "lib/utils"

import { DocumentBuilder } from "."
import { RTFBuilder, SpecialContent } from "./base"
import { ParagraphBuilder } from "./paragraph"
import { TableBuilder } from "./table"
import { ListBuilder } from "./list"

const HEADING_SPACING_BEFORE = [15, 20, 15, 10]
const HEADING_SPACING_AFTER = [30, 10, 8, 6]
const HEADING_FONT_SIZES = [26, 24, 20, 18]

class StaticBuilder<T> extends RTFBuilder<T> {
  readonly empty = false

  constructor(
    container: RTFBuilder<unknown> | null,
    readonly value: T
  ) {
    super(container)
  }

  override build(): T {
    return this.value
  }
}

class SectionContentBuilder extends RTFBuilder<RTFContainerElement> {
  private readonly _children: RTFBuilder<RTFElement | RTFColumnBreakElement>[] = []
  private _lastParagraph: ParagraphBuilder | null = null

  constructor(readonly _section: SectionBuilder) {
    super(null)
  }

  get document(): DocumentBuilder {
    return this.section.document
  }
  get section(): SectionBuilder {
    return this._section
  }

  get empty(): boolean {
    return this._children.length === 0
  }
  get children(): RTFBuilder<RTFElement | RTFColumnBreakElement>[] {
    return this._children
  }
  get lastChild(): RTFBuilder<RTFElement | RTFColumnBreakElement> | null {
    return this._children.length > 0 ? this._children[this._children.length - 1] : null
  }
  get lastParagraph(): ParagraphBuilder {
    if (this._lastParagraph === null) {
      this._lastParagraph = this.newParagraph()
    }
    return this._lastParagraph
  }

  newParagraph(): ParagraphBuilder {
    const builder = new ParagraphBuilder(this)

    // if (this.lastChild) {
    //   builder.spaceBefore(pt(5))
    // }
    this._children.push(builder)
    this._lastParagraph = builder
    return builder
  }
  withText(...items: (string | Partial<RTFCharacterFormatting>)[]): this {
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
  withSpecial(code: SpecialContent): this {
    this.lastParagraph.withSpecial(code)
    return this
  }
  closeParagraph(): this {
    this._lastParagraph = null
    return this
  }

  withTitle(text: string, bookmark?: string, f?: (builder: ParagraphBuilder) => void): this {
    return this.withHeading(text, 0, bookmark, f)
  }
  withHeading(text: string, level: 0 | 1 | 2 | 3 = 1, bookmark?: string, f?: (builder: ParagraphBuilder) => void): this {
    const paragraph = this.newParagraph().spaceBefore(pt(HEADING_SPACING_BEFORE[level])).spaceAfter(pt(HEADING_SPACING_AFTER[level]))

    if (level === 0) {
      paragraph.center()
    }

    const chunk = paragraph.newChunk()

    if (bookmark) {
      chunk.bookmark(bookmark)
    }
    chunk.text(text).bold().fontSize(pt(HEADING_FONT_SIZES[level]))
    if (f) {
      f(paragraph)
    }
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

    // if (this.lastChild instanceof ParagraphBuilder) {
    //   this.lastChild.spaceAfter(pt(5))
    // }
    this._children.push(builder)
    this._lastParagraph = null
    return builder
  }
  withList(f: (builder: ListBuilder) => void): this {
    f(this.newList())
    return this
  }

  newTable(): TableBuilder {
    const builder = new TableBuilder(this, 0)

    // if (this.lastChild instanceof ParagraphBuilder) {
    //   this.lastChild.spaceAfter(pt(5))
    // }
    this._children.push(builder)
    this._lastParagraph = null
    return builder
  }
  withTable(f: (builder: TableBuilder) => void): this {
    f(this.newTable())
    return this
  }
  withSimpleTable(headers: string[], rows: string[][]): this {
    const builder = this.newTable()

    if (headers.length > 0) {
      builder.withHeaderRow((row) => {
        headers.forEach((text) => {
          row.newCell().withText(text, { bold: true })
        })
      })
    }
    for (const item of rows) {
      builder.withRow((row) => {
        item.forEach((text) => {
          row.newCell().withText(text)
        })
      })
    }
    return this
  }

  columnBreak(): this {
    this._children.push(new StaticBuilder(this, { type: "columnBreak" }))
    this._lastParagraph = null
    return this
  }

  build(): RTFContainerElement {
    return {
      type: "container",
      content: this._children.map((b) => b.build()) as RTFElement[],
    }
  }
}

export class SectionBuilder {
  private _formatting: Partial<RTFSectionFormatting> = {}
  readonly body: SectionContentBuilder = new SectionContentBuilder(this)
  readonly header: SectionContentBuilder = new SectionContentBuilder(this)
  readonly evenHeader: SectionContentBuilder = new SectionContentBuilder(this)
  readonly firstHeader: SectionContentBuilder = new SectionContentBuilder(this)
  readonly footer: SectionContentBuilder = new SectionContentBuilder(this)
  readonly evenFooter: SectionContentBuilder = new SectionContentBuilder(this)
  readonly firstFooter: SectionContentBuilder = new SectionContentBuilder(this)

  constructor(readonly document: DocumentBuilder) {}

  get empty(): boolean {
    return !(
      this.body.empty &&
      this.header.empty &&
      this.evenHeader.empty &&
      this.firstHeader.empty &&
      this.footer.empty &&
      this.evenFooter.empty &&
      this.firstFooter.empty
    )
  }

  get computedPageWidth(): number {
    return toTwips(
      this._formatting.pageWidth,
      this._formatting.landscape !== this.document.landscape ? this.document.computedPageHeight : this.document.computedPageWidth
    )
  }
  get computedMarginLeft(): number {
    return toTwips(this._formatting.margin?.left, this.document.computedMarginLeft)
  }
  get computedMarginRight(): number {
    return toTwips(this._formatting.margin?.right, this.document.computedMarginRight)
  }
  get computedContentWidth(): number {
    return this.computedPageWidth - this.computedMarginLeft - this.computedMarginRight
  }

  get computedPageHeight(): number {
    return toTwips(
      this._formatting.pageWidth,
      this._formatting.landscape !== this.document.landscape ? this.document.computedPageWidth : this.document.computedPageHeight
    )
  }
  get computedMarginTop(): number {
    return toTwips(this._formatting.margin?.top, this.document.computedMarginTop)
  }
  get computedMarginBottom(): number {
    return toTwips(this._formatting.margin?.bottom, this.document.computedMarginBottom)
  }
  get computedContentHeight(): number {
    return this.computedPageHeight - this.computedMarginTop - this.computedMarginBottom
  }

  style(alias: string): this {
    this._formatting.styleAlias = alias
    return this
  }

  pageWidth(size: RTFSize): this {
    this._formatting.pageWidth = size
    return this
  }

  pageHeight(size: RTFSize): this {
    this._formatting.pageHeight = size
    return this
  }

  landscape(): this {
    this._formatting.landscape = true
    return this
  }

  margin(margin: Partial<RTFRect>): this {
    if (!this._formatting.margin) {
      this._formatting.margin = {}
    }
    this._formatting.margin = { ...this._formatting.margin, ...margin }
    return this
  }

  gutter(size: RTFSize): this {
    this._formatting.gutter = size
    return this
  }

  valign(align: "top" | "center" | "bottom" | "justified"): this {
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

  justified(): this {
    return this.valign("justified")
  }

  titlePage(): this {
    this._formatting.titlePage = true
    return this
  }

  headerDistance(size: RTFSize): this {
    this._formatting.headerDistance = size
    return this
  }

  footerDistance(size: RTFSize): this {
    this._formatting.footerDistance = size
    return this
  }

  columns(count: number): this {
    this._formatting.columnCount = count
    return this
  }

  columnSpacing(size: RTFSize): this {
    this._formatting.columnSpacing = size
    return this
  }

  with(formatting: Partial<RTFSectionFormatting>): this {
    Object.assign(this._formatting, formatting)
    return this
  }

  build(): RTFSection {
    return {
      formatting: this._formatting,
      content: this.body.build().content,
      header: this.header.empty ? undefined : this.header.build().content,
      evenHeader: !this.document.facingPages || this.evenHeader.empty ? undefined : this.evenHeader.build().content,
      firstHeader: !this.titlePage || this.firstHeader.empty ? undefined : this.firstHeader.build().content,
      footer: this.footer.empty ? undefined : this.footer.build().content,
      evenFooter: !this.document.facingPages || this.evenFooter.empty ? undefined : this.evenFooter.build().content,
      firstFooter: !this.titlePage || this.firstFooter.empty ? undefined : this.firstFooter.build().content,
    }
  }
}
