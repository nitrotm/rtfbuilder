import {
  RTFCharacterContentElement,
  RTFCharacterElement,
  RTFCharacterFlag,
  RTFCharacterFormatting,
  RTFHyperlink,
  RTFPictureData,
  RTFPictureFormatting,
  RTFSize,
} from "../types"

import { RTFBuilder, SpecialContent } from "./base"
import { FootnoteBuilder } from "./footnote"

type InlineFactory = () => RTFCharacterContentElement

export class CharacterBuilder extends RTFBuilder<RTFCharacterElement> {
  private readonly _formatting: Partial<RTFCharacterFormatting> = {}
  private _bookmarkName?: string
  private _link?: RTFHyperlink
  private readonly _children: InlineFactory[] = []

  get empty(): boolean {
    return this._children.length === 0
  }
  get children(): InlineFactory[] {
    return this._children
  }

  text(text: string): this {
    if (text.length > 0) {
      this._children.push(() => ({ type: "text", text }))
    }
    return this
  }

  picture(picture: RTFPictureData, formatting: Partial<RTFPictureFormatting> = {}): this {
    this._children.push(() => ({
      type: "picture",
      picture,
      formatting,
    }))
    return this
  }

  newFootnote(): FootnoteBuilder {
    const builder = new FootnoteBuilder(this, false)

    this._children.push(() => builder.build())
    return builder
  }
  withFootnote(f: (builder: FootnoteBuilder) => void): this {
    f(this.newFootnote())
    return this
  }

  newEndnote(): FootnoteBuilder {
    const builder = new FootnoteBuilder(this, true)

    this._children.push(() => builder.build())
    return builder
  }
  withEndnote(f: (builder: FootnoteBuilder) => void): this {
    f(this.newEndnote())
    return this
  }

  withSpecial(code: SpecialContent): this {
    this._children.push(() => {
      if (code === "date" || code === "time") {
        return { type: "dateTime", field: code }
      } else {
        return { type: code }
      }
    })
    return this
  }

  style(alias: string): this {
    this._formatting.styleAlias = alias
    return this
  }

  language(lcid: number): this {
    this._formatting.language = lcid
    return this
  }

  font(alias: string): this {
    this._formatting.fontAlias = alias
    return this
  }

  fontSize(size: RTFSize): this {
    this._formatting.fontSize = size
    return this
  }

  kerning(size: RTFSize): this {
    this._formatting.kerning = size
    return this
  }

  characterSpacing(size: RTFSize): this {
    this._formatting.characterSpacing = size
    return this
  }

  horizontalScaling(percentage: number): this {
    this._formatting.horizontalScaling = percentage
    return this
  }

  bold(): this {
    this._formatting.bold = true
    return this
  }

  italic(): this {
    this._formatting.italic = true
    return this
  }

  underline(value: true | "double" | "dotted" | "dash" | "wave" = true): this {
    this._formatting.underline = value
    return this
  }

  strikethrough(value: true | "double" = true): this {
    this._formatting.strikethrough = value
    return this
  }

  color(alias: string): this {
    this._formatting.colorAlias = alias
    return this
  }

  highlightColor(alias: string): this {
    this._formatting.highlightColorAlias = alias
    return this
  }

  flags(...flags: RTFCharacterFlag[]): this {
    this._formatting.flags ||= []
    this._formatting.flags.push(...flags)
    return this
  }

  bookmark(name: string): this {
    this._bookmarkName = name
    return this
  }

  bookmarkLink(anchor: string): this {
    this._link = {
      type: "bookmark",
      bookmark: anchor,
    }
    return this
  }

  externalLink(url: string): this {
    this._link = {
      type: "external",
      url,
    }
    return this
  }

  emailLink(address: string, subject?: string, body?: string): this {
    this._link = {
      type: "email",
      email: { address, subject, body },
    }
    return this
  }

  with(formatting: Partial<RTFCharacterFormatting>): this {
    Object.assign(this._formatting, formatting)
    return this
  }

  build(): RTFCharacterElement {
    return {
      type: "character",
      formatting: this._formatting,
      bookmarkName: this._bookmarkName,
      link: this._link,
      content: this._children.map((x) => x()),
    }
  }
}
