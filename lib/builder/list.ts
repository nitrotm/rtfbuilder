import {
  RTFCharacterFormatting,
  RTFContainerElement,
  RTFElement,
  RTFList,
  RTFListLevel,
  RTFListNumberFormat,
  RTFListOverride,
  RTFPictureData,
  RTFPictureFormatting,
} from "lib/types"

import { RTFBuilder, SpecialContent } from "./base"
import { ParagraphBuilder } from "./paragraph"

export class ListBuilder extends RTFBuilder<RTFContainerElement> {
  private readonly _children: ListItemBuilder[] = []
  private readonly _formatting: Partial<RTFList> = {}
  private readonly _override: Partial<RTFListOverride> = {}
  readonly listOverrideAlias: string

  constructor(parent: RTFBuilder<unknown>) {
    super(parent)
    this.listOverrideAlias = this.document.newList()
    this.simple()
  }

  get empty(): boolean {
    return !this._children.some((x) => !x.empty)
  }
  get children(): ListItemBuilder[] {
    return this._children
  }

  newItem(): ListItemBuilder {
    const builder = new ListItemBuilder(this, this)

    this._children.push(builder)
    return builder
  }
  withItem(f: (builder: ListItemBuilder) => void): this {
    f(this.newItem())
    return this
  }

  type(type: "simple" | "multi" | "hybrid"): this {
    this._formatting.type = type
    this.document.updateList(this.listOverrideAlias, this._formatting, this._override)
    return this
  }

  restartEachSection(): this {
    this._formatting.restartEachSection = true
    this.document.updateList(this.listOverrideAlias, this._formatting, this._override)
    return this
  }

  levels(...levels: Partial<RTFListLevel>[]): this {
    if (this._children.length > 0) {
      throw new Error("List levels must be defined before adding list items.")
    }
    if (!this._formatting.levels) {
      this._formatting.levels = []
    }
    this._formatting.levels = levels
    this.document.updateList(this.listOverrideAlias, this._formatting, this._override)
    return this
  }

  levelOverride(level: number, startAt?: number, override?: Partial<RTFListLevel>): this {
    if (this._children.length > 0) {
      throw new Error("List levels must be defined before adding list items.")
    }
    if (!this._override.levelOverrides) {
      this._override.levelOverrides = []
    }
    this._override.levelOverrides.push({
      level,
      startAt,
      override,
    })
    this.document.updateList(this.listOverrideAlias, this._formatting, this._override)
    return this
  }

  simple(numberFormat: RTFListNumberFormat = "bullet", levels: number = 9): this {
    this.type("multi").levels(
      ...[...Array(levels).keys()].map(() => ({
        numberFormat,
      }))
    )
    return this
  }

  with(formatting: Partial<RTFList> = {}, override: Partial<RTFListOverride> = {}): this {
    Object.assign(this._formatting, formatting)
    Object.assign(this._override, override)
    this.document.updateList(this.listOverrideAlias, this._formatting, this._override)
    return this
  }

  build(): RTFContainerElement {
    return {
      type: "container",
      content: this._children.flatMap((x) => x.build().content),
    }
  }
}

class ListItemBuilder extends RTFBuilder<RTFContainerElement> {
  private readonly _children: (ParagraphBuilder | ListItemBuilder)[] = []
  private _paragraph: ParagraphBuilder | null = null
  private _lastParagraph: ParagraphBuilder | null = null

  constructor(
    parent: RTFBuilder<unknown>,
    readonly list: ListBuilder,
    readonly level: number = 0
  ) {
    super(parent)
  }

  get empty(): boolean {
    return !this._children.some((x) => !x.empty)
  }
  get children(): (ParagraphBuilder | ListItemBuilder)[] {
    return this._children
  }
  get lastParagraph(): ParagraphBuilder {
    if (this._lastParagraph === null) {
      this._lastParagraph = this.newParagraph()
    }
    return this._lastParagraph
  }

  newParagraph(): ParagraphBuilder {
    const builder = new ParagraphBuilder(this).with({
      listOverrideAlias: this.list.listOverrideAlias,
      listLevel: this.level,
      listItem: this._paragraph === null,
    })

    if (this._paragraph === null) {
      this._paragraph = builder
      this._children.unshift(builder)
    } else {
      this._children.push(builder)
    }
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

  withParagraph(f: (builder: ParagraphBuilder) => void): this {
    f(this.newParagraph())
    this._lastParagraph = null
    return this
  }

  newItem(): ListItemBuilder {
    const builder = new ListItemBuilder(this, this.list, this.level + 1)

    this._children.push(builder)
    this._lastParagraph = null
    return builder
  }
  withItem(f: (builder: ListItemBuilder) => void): this {
    f(this.newItem())
    return this
  }

  build(): RTFContainerElement {
    return {
      type: "container",
      content: this._children.map((child) => child.build()) as RTFElement[],
    }
  }
}
