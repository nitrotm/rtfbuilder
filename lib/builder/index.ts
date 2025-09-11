import { AbstractDocument } from "lib/document"
import {
  RTFCharset,
  RTFColor,
  RTFDocumentInfo,
  RTFFont,
  RTFList,
  RTFListOverride,
  RTFPageSetup,
  RTFStyle,
  RTFTypographySettings,
  RTFViewSettings,
} from "lib/types"
import { mm, toTwips } from "lib/utils"
import { SectionBuilder } from "./section"

export class DocumentBuilder {
  // Document metadata and settings
  private _charset: RTFCharset = "ansi"
  private _info: Partial<RTFDocumentInfo> = {}
  private _pageSetup: Partial<RTFPageSetup> = {
    // Set page size: A4
    paperWidth: mm(210),
    paperHeight: mm(297),
    // Set margins
    margin: {
      top: mm(20),
      right: mm(20),
      bottom: mm(20),
      left: mm(20),
    },
  }
  private _viewSettings: Partial<RTFViewSettings> = {}
  private _typography: Partial<RTFTypographySettings> = {}

  // Document variables and fields
  private _variables: Record<string, string> = {}

  // Document registries for named resources
  private _colors: Record<string, RTFColor> = {}
  private _fonts: Record<string, Partial<RTFFont>> = {}
  private _styles: Record<string, Partial<RTFStyle>> = {}
  private _lists: Record<string, Partial<RTFList>> = {}
  private _listOverrides: Record<string, Partial<RTFListOverride>> = {}

  // Sections
  private _sections: SectionBuilder[] = []

  get empty(): boolean {
    return this._sections.length === 0 || this._sections.every((s) => s.empty)
  }

  get facingPages(): boolean {
    return this._pageSetup.facingPages === true
  }
  get landscape(): boolean {
    return this._pageSetup.landscape === true
  }

  get computedPageWidth(): number {
    return toTwips(this._pageSetup.paperWidth, 0)
  }
  get computedMarginLeft(): number {
    return toTwips(this._pageSetup.margin?.left, 0)
  }
  get computedMarginRight(): number {
    return toTwips(this._pageSetup.margin?.right, 0)
  }
  get computedContentWidth(): number {
    return this.computedPageWidth - this.computedMarginLeft - this.computedMarginRight
  }

  get computedPageHeight(): number {
    return toTwips(this._pageSetup.paperHeight, 0)
  }
  get computedMarginTop(): number {
    return toTwips(this._pageSetup.margin?.top, 0)
  }
  get computedMarginBottom(): number {
    return toTwips(this._pageSetup.margin?.bottom, 0)
  }
  get computedContentHeight(): number {
    return this.computedPageHeight - this.computedMarginTop - this.computedMarginBottom
  }

  info(info: Partial<RTFDocumentInfo>): this {
    this._info = { ...this._info, ...info }
    return this
  }
  charset(charset: RTFCharset): this {
    this._charset = charset
    return this
  }
  pageSetup(setup: Partial<RTFPageSetup>): this {
    if (!this.empty) {
      throw new Error("Page setup must be defined before adding content")
    }
    this._pageSetup = { ...this._pageSetup, ...setup }
    return this
  }
  viewSettings(settings: Partial<RTFViewSettings>): this {
    this._viewSettings = { ...this._viewSettings, ...settings }
    return this
  }
  typography(settings: Partial<RTFTypographySettings>): this {
    if (!this.empty) {
      throw new Error("Typography settings must be defined before adding content")
    }
    this._typography = { ...this._typography, ...settings }
    return this
  }

  newVariable(value: string): string {
    const name = `v${Object.keys(this._variables).length + 1}`

    this._variables[name] = value
    return name
  }
  withVariable(name: string, value: string): this {
    this._variables[name] = value
    return this
  }

  newColor(value: RTFColor): string {
    const alias = `c${Object.keys(this._colors).length + 1}`

    this._colors[alias] = value
    return alias
  }
  withColor(alias: string, value: RTFColor): this {
    this._colors[alias] = value
    return this
  }

  newFont(value: RTFFont): string {
    const alias = `f${Object.keys(this._fonts).length + 1}`

    this._fonts[alias] = value
    return alias
  }
  withFont(alias: string, value: RTFFont): this {
    this._fonts[alias] = value
    return this
  }

  newStyle(value: RTFStyle): string {
    const alias = `s${Object.keys(this._styles).length + 1}`

    this._styles[alias] = value
    return alias
  }
  withStyle(alias: string, value: RTFStyle): this {
    this._styles[alias] = value
    return this
  }

  newSection(): SectionBuilder {
    const builder = new SectionBuilder(this)

    this._sections.push(builder)
    return builder
  }
  withSection(f: (section: SectionBuilder) => void): this {
    f(this.newSection())
    return this
  }

  newList(): string {
    const listAlias = `li${Object.keys(this._lists).length + 1}`
    const overrideAlias = `lo${Object.keys(this._listOverrides).length + 1}`

    this._lists[listAlias] = {}
    this._listOverrides[overrideAlias] = { listAlias }
    return overrideAlias
  }
  updateList(alias: string, list: Partial<RTFList>, listOverride: Partial<RTFListOverride>): this {
    if (!this._listOverrides[alias]) {
      throw new Error(`List override with alias '${alias}' does not exist`)
    }
    const listAlias = this._listOverrides[alias].listAlias
    if (!listAlias || !this._lists[listAlias]) {
      throw new Error(`List for override alias '${alias}' does not exist`)
    }
    this._lists[listAlias] = { ...this._lists[listAlias], ...list }
    this._listOverrides[alias] = { ...this._listOverrides[alias], ...listOverride, listAlias }
    return this
  }

  buildInto<T extends AbstractDocument<unknown>>(document: T): T {
    document
      .charset(this._charset)
      .info(this._info)
      .pageSetup(this._pageSetup)
      .viewSettings(this._viewSettings)
      .typography(this._typography)
      .variables(this._variables)
      .colors(this._colors)
      .fonts(this._fonts)
      .styles(this._styles)
      .lists(this._lists)
      .listOverrides(this._listOverrides)
      .sections(...this._sections.map((s) => s.build()))
    return document
  }
}
