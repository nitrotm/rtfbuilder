import {
  RTFBorder,
  RTFCharacterFormatting,
  RTFParagraphElement,
  RTFParagraphFlag,
  RTFParagraphFormatting,
  RTFPictureData,
  RTFPictureFormatting,
  RTFSize,
} from "../types"

import { RTFBuilder, RTFSpecialContent } from "./base"
import { CharacterBuilder } from "./character"
import { pt } from "../utils"

export class ParagraphBuilder extends RTFBuilder<RTFParagraphElement> {
  private readonly _children: CharacterBuilder[] = []
  private readonly _formatting: Partial<RTFParagraphFormatting> = {}

  get empty(): boolean {
    return !this._children.some((x) => !x.empty)
  }

  newChunk(): CharacterBuilder {
    const builder = new CharacterBuilder(this)

    this._children.push(builder)
    return builder
  }
  withChunk(f: (builder: CharacterBuilder) => void): this {
    f(this.newChunk())
    return this
  }
  withText(...items: (string | RTFSpecialContent | Partial<RTFCharacterFormatting>)[]): this {
    let last: CharacterBuilder | null = null

    for (const item of items) {
      if (typeof item === "string") {
        if (!last) {
          last = this.newChunk()
        }
        last.text(item)
      } else if ("special" in item) {
        if (!last) {
          last = this.newChunk()
        }
        last.special(item.special)
      } else {
        last = this.newChunk().with(item)
      }
    }
    return this
  }
  withPicture(picture: RTFPictureData, formatting: Partial<RTFPictureFormatting> = {}): this {
    this.newChunk().picture(picture, formatting)
    return this
  }
  withFootnote(text: string, ...items: (string | Partial<RTFCharacterFormatting>)[]): this {
    this.newChunk()
      .text(text)
      .newFootnote()
      .withText(...items)
    return this
  }
  withEndnote(text: string, ...items: (string | Partial<RTFCharacterFormatting>)[]): this {
    this.newChunk()
      .text(text)
      .newEndnote()
      .withText(...items)
    return this
  }
  withBookmarkLink(anchor: string, text: string, formatting: Partial<RTFCharacterFormatting> = {}): this {
    this.newChunk().bookmarkLink(anchor).with(formatting).text(text)
    return this
  }
  withExternalLink(url: string, text: string, formatting: Partial<RTFCharacterFormatting> = {}): this {
    this.newChunk().externalLink(url).with(formatting).text(text)
    return this
  }

  style(alias: string): this {
    this._formatting.styleAlias = alias
    return this
  }

  align(align: "left" | "center" | "right" | "justify" | "distribute"): this {
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

  justify(): this {
    return this.align("justify")
  }

  distribute(): this {
    return this.align("distribute")
  }

  lineSpacing(size: RTFSize): this {
    this._formatting.lineSpacing = size
    return this
  }

  lineSpacingRule(rule: "exact" | "auto"): this {
    this._formatting.lineSpacingRule = rule
    return this
  }

  firstLineIndent(size: RTFSize): this {
    this._formatting.firstLineIndent = size
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

  indent(first: RTFSize, left?: RTFSize, right?: RTFSize): this {
    this._formatting.firstLineIndent = first
    if (left !== undefined) this._formatting.leftIndent = left
    if (right !== undefined) this._formatting.rightIndent = right
    return this
  }

  spaceBefore(size: RTFSize): this {
    this._formatting.spaceBefore = size
    return this
  }

  spaceAfter(size: RTFSize): this {
    this._formatting.spaceAfter = size
    return this
  }

  spacing(size: RTFSize): this {
    this._formatting.spaceBefore = size
    this._formatting.spaceAfter = size
    return this
  }

  border(side: "top" | "right" | "bottom" | "left" | "vertical" | "horizontal" | "all", value: Partial<RTFBorder> = { width: pt(1) }): this {
    if (!this._formatting.borders) {
      this._formatting.borders = {}
    }
    switch (side) {
      case "vertical":
        this._formatting.borders.top = value
        this._formatting.borders.bottom = value
        break
      case "horizontal":
        this._formatting.borders.left = value
        this._formatting.borders.right = value
        break
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

  backgroundColor(backgroundColorAlias: string): this {
    this._formatting.backgroundColorAlias = backgroundColorAlias
    return this
  }

  flags(...flags: RTFParagraphFlag[]): this {
    this._formatting.flags ||= []
    this._formatting.flags.push(...flags)
    return this
  }

  with(formatting: Partial<RTFParagraphFormatting>): this {
    Object.assign(this._formatting, formatting)
    return this
  }

  build(): RTFParagraphElement {
    return {
      type: "paragraph",
      formatting: this._formatting,
      content: this._children.map((x) => x.build()),
    }
  }
}
