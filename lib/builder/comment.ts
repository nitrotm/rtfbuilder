import { RTFCharacterFormatting, RTFComment, RTFPictureData, RTFPictureFormatting } from "../types"

import { RTFBuilder, RTFSpecialContent } from "./base"
import { ParagraphBuilder } from "./paragraph"

export class CommentBuilder extends RTFBuilder<RTFComment> {
  private readonly _children: ParagraphBuilder[] = []
  private _timestamp?: Date
  private _author?: string
  private _highlight: "firstWord" | "all" = "all"
  private _lastParagraph: ParagraphBuilder | null = null

  constructor(parent: RTFBuilder<unknown>) {
    super(parent)
  }

  get empty(): boolean {
    return !this._children.some((x) => !x.empty)
  }
  get children(): ParagraphBuilder[] {
    return this._children
  }
  get lastParagraph(): ParagraphBuilder {
    if (this._lastParagraph === null) {
      this._lastParagraph = this.newParagraph().lazy()
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

  timestamp(timestamp: Date): this {
    this._timestamp = timestamp
    return this
  }

  author(author: string): this {
    this._author = author
    return this
  }

  highlight(mode: "firstWord" | "all"): this {
    this._highlight = mode
    return this
  }

  build(): RTFComment | null {
    const data = {
      timestamp: this._timestamp,
      author: this._author,
      highlight: this._highlight,
      content: this._children.map((x) => x.build()).filter((x) => x !== null),
    }

    if (data.content.length === 0) {
      return null
    }
    return {
      alias: this.document.newComment(data),
      ...data,
    }
  }
}
