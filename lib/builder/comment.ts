import { RTFCharacterFormatting, RTFComment, RTFPictureData, RTFPictureFormatting } from "../types"

import { RTFBuilder, RTFSpecialContent } from "./base"
import { CharacterBuilder } from "./character"
import { ParagraphBuilder } from "./paragraph"

export class CommentBuilder extends RTFBuilder<RTFComment> {
  readonly paragraph: ParagraphBuilder = new ParagraphBuilder(this).lazy()
  private _timestamp?: Date
  private _author?: string
  private _highlight: "firstWord" | "all" = "all"

  constructor(parent: RTFBuilder<unknown>) {
    super(parent)
  }

  get empty(): boolean {
    return this.paragraph.empty
  }

  newChunk(): CharacterBuilder {
    return this.paragraph.newChunk()
  }
  withChunk(f: (builder: CharacterBuilder) => void): this {
    f(this.newChunk())
    return this
  }

  withText(...items: (string | RTFSpecialContent | Partial<RTFCharacterFormatting>)[]): this {
    this.paragraph.withText(...items)
    return this
  }
  withPicture(picture: RTFPictureData, formatting: Partial<RTFPictureFormatting> = {}): this {
    this.paragraph.withPicture(picture, formatting)
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
    const content = this.paragraph.build()

    if (!content) {
      return null
    }

    const data = {
      timestamp: this._timestamp,
      author: this._author,
      highlight: this._highlight,
      content,
    }

    return {
      alias: this.document.newComment(data),
      ...data,
    }
  }
}
