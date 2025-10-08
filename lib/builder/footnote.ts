import { RTFCharacterFormatting, RTFFootnoteElement, RTFPictureData, RTFPictureFormatting } from "../types"

import { RTFBuilder, RTFSpecialContent } from "./base"
import { CharacterBuilder } from "./character"
import { ParagraphBuilder } from "./paragraph"

export class FootnoteBuilder extends RTFBuilder<RTFFootnoteElement> {
  readonly paragraph: ParagraphBuilder = new ParagraphBuilder(this)
  private _customMark?: string

  constructor(
    parent: RTFBuilder<unknown>,
    private readonly _endnote: boolean
  ) {
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

  customMark(mark: string): this {
    this._customMark = mark
    return this
  }

  build(): RTFFootnoteElement | null {
    const content = this.paragraph.with({ footnoteMark: this._customMark || true }).build()

    if (!content) {
      return null
    }
    return {
      type: "footnote",
      customMark: this._customMark,
      endnote: this._endnote,
      content,
    }
  }
}
