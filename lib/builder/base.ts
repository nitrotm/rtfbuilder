import { DocumentBuilder } from "."
import { SectionBuilder } from "./section"

export type SpecialContent = "pageBreak" | "lineBreak" | "tab" | "nonBreakingSpace" | "nonBreakingHyphen" | "optionalHyphen" | "pageNumber" | "date" | "time"

export abstract class RTFBuilder<T> {
  abstract readonly empty: boolean

  constructor(private readonly _container: RTFBuilder<unknown> | null) {}

  get container(): RTFBuilder<unknown> {
    if (!this._container) {
      throw new Error("This builder has no container.")
    }
    return this._container
  }
  get document(): DocumentBuilder {
    return this.container.document
  }
  get section(): SectionBuilder {
    return this.container.section
  }

  abstract build(): T
}
