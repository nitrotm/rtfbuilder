import { RTFCharacterFormatting, RTFFootnoteElement, RTFPictureData, RTFPictureFormatting } from "lib/types"

import { RTFBuilder, SpecialContent } from "./base"
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

  withText(...items: (string | Partial<RTFCharacterFormatting>)[]): this {
    let last: CharacterBuilder | null = null

    for (const item of items) {
      if (typeof item === "string") {
        if (!last) {
          last = this.newChunk()
        }
        last.text(item)
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
  withSpecial(code: SpecialContent): this {
    this.newChunk().withSpecial(code)
    return this
  }

  customMark(mark: string): this {
    this._customMark = mark
    return this
  }

  build(): RTFFootnoteElement {
    return {
      type: "footnote",
      customMark: this._customMark,
      endnote: this._endnote,
      content: this.paragraph.build(),
    }
  }
}
