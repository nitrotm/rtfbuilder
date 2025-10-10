/**
 * RichTextDocument - Complete RTF document state management.
 */

import {
  RTFCharset,
  RTFColor,
  RTFComment,
  RTFDocumentInfo,
  RTFFont,
  RTFList,
  RTFPageSetup,
  RTFSection,
  RTFStyle,
  RTFTypographySettings,
  RTFViewSettings,
} from "./types"
import { deepCopy, deepEqual, inch, pt, RTFRegistry } from "./utils"

/** Default tab width */
export const DEFAULT_TAB_WIDTH = inch(0.5)

/** Default color aliases */
export const DEFAULT_COLOR_ALIAS = "auto"
export const SHADING_COLOR_ALIAS = "shadingbg"

/** Default font alias for Times New Roman */
export const DEFAULT_FONT_ALIAS = "default"

/** Default paragraph style alias */
export const DEFAULT_PARAGRAPH_STYLE_ALIAS = "default"

/** Footnote mark color aliases */
export const FOOTNOTE_COLOR_ALIAS = "footnotefg"
export const FOOTNOTE_BACKGROUND_COLOR_ALIAS = "footnotebg"

/** Internal document model */
export type RichTextDocumentModel = {
  // Document metadata and settings
  charset: RTFCharset
  info: Partial<RTFDocumentInfo>
  pageSetup: Partial<RTFPageSetup>
  viewSettings: Partial<RTFViewSettings>
  typography: Partial<RTFTypographySettings>

  // Document variables and fields
  variables: Record<string, string>

  // Document registries for named resources
  colorRegistry: RTFRegistry<RTFColor>
  fontRegistry: RTFRegistry<RTFFont>
  styleRegistry: RTFRegistry<RTFStyle>
  listRegistry: RTFRegistry<RTFList>
  bookmarkRegistry: RTFRegistry<string>
  commentRegistry: RTFRegistry<RTFComment>

  // Document sections
  sections: RTFSection[]
}

/** Interface for document validators */
export type RichTextDocumentValidator = {
  validateDocumentInfo(model: RichTextDocumentModel, value: Partial<RTFDocumentInfo>): void
  validatePageSetup(model: RichTextDocumentModel, value: Partial<RTFPageSetup>): void
  validateViewSettings(model: RichTextDocumentModel, value: Partial<RTFViewSettings>): void
  validateTypography(model: RichTextDocumentModel, value: Partial<RTFTypographySettings>): void
  validateVariableEntry(model: RichTextDocumentModel, name: string, value: string): void
  validateColorEntry(model: RichTextDocumentModel, alias: string, value: RTFColor): void
  validateFontEntry(model: RichTextDocumentModel, alias: string, value: RTFFont): void
  validateStyleEntry(model: RichTextDocumentModel, alias: string, value: RTFStyle, pendingStyleAliases: string[]): void
  validateListEntry(model: RichTextDocumentModel, alias: string, value: RTFList): void
  validateCommenEntry(model: RichTextDocumentModel, alias: string, value: RTFComment): void
  validateSection(model: RichTextDocumentModel, value: Partial<RTFSection>): void
}

/** RTF document constructor options */
export type RichTextDocumentOptions = {
  defaultFont: RTFFont // Default font (default: Times New Roman)
  defaultStyleName: string // Default paragraph style name (default: RTF)
  variables: Record<string, string> // Initial document variables
  colors: Record<string, RTFColor> // Initial color registry entries
  fonts: Record<string, RTFFont> // Initial font registry entries
  styles: Record<string, RTFStyle> // Initial style registry entries
  validator: RichTextDocumentValidator // Optional validator
}

/** RTF document interface */
export interface RichTextDocument<T> {
  /**
   * Render the document to the desired output format
   */
  render(): T

  /**
   * Copy all content and settings from another document
   */
  copyFrom(other: RichTextDocument<unknown>): this

  /**
   * Set document charset
   */
  charset(charset: RTFCharset): this

  /**
   * Set document information properties
   */
  info(info: Partial<RTFDocumentInfo>): this

  /**
   * Set page setup properties
   */
  pageSetup(setup: Partial<RTFPageSetup>): this

  /**
   * Set view settings
   */
  viewSettings(settings: Partial<RTFViewSettings>): this

  /**
   * Set typography settings
   */
  typography(settings: Partial<RTFTypographySettings>): this

  /**
   * Add multiple document variables (fluent interface)
   */
  variables(items: Record<string, string>): this

  /**
   * Add colors to the color table (fluent interface)
   */
  colors(items: Record<string, RTFColor>): this

  /**
   * Add fonts to the font table (fluent interface)
   */
  fonts(items: Record<string, RTFFont>): this

  /**
   * Add styles to the stylesheet (fluent interface)
   */
  styles(items: Record<string, RTFStyle>): this

  /**
   * Register lists with alias
   */
  lists(items: Record<string, RTFList>): this

  /**
   * Register bookmarks
   */
  bookmarks(names: Record<string, string>): this

  /**
   * Register comments with alias
   */
  comments(items: Record<string, RTFComment>): this

  /**
   * Add a new section to the document
   */
  sections(...sections: RTFSection[]): this
}

/** RTF document with state management */
export abstract class AbstractRichTextDocument<T> implements RichTextDocument<T> {
  // Internal document model
  protected readonly model: RichTextDocumentModel = {
    charset: "ansi",
    info: {},
    pageSetup: {
      margin: {
        top: inch(1),
        right: inch(1.25),
        bottom: inch(1),
        left: inch(1.25),
      },
    },
    viewSettings: {
      viewKind: "pageLayout",
      viewScale: 100, // 100% zoom
    },
    typography: {
      autoHyphenation: false,
      tabWidth: DEFAULT_TAB_WIDTH,
    },
    variables: {},
    colorRegistry: new RTFRegistry<RTFColor>({ eq: deepEqual, prefix: "c" }),
    fontRegistry: new RTFRegistry<RTFFont>({ eq: deepEqual, prefix: "f" }),
    styleRegistry: new RTFRegistry<RTFStyle>({ eq: deepEqual, prefix: "s" }),
    listRegistry: new RTFRegistry<RTFList>({ eq: () => false, prefix: "l", startAt: 1 }),
    bookmarkRegistry: new RTFRegistry<string>({ eq: (a, b) => a === b, prefix: "bk" }),
    commentRegistry: new RTFRegistry<RTFComment>({ eq: () => false, prefix: "cm", startAt: 1 }),
    sections: [],
  }

  // Optional validator
  private readonly validator?: RichTextDocumentValidator

  /** Create a new document with optional initial settings */
  protected constructor(options: Partial<RichTextDocumentOptions> = {}) {
    // Add default color/font
    const {
      defaultFont = {
        name: "Times New Roman",
        family: "roman",
        charset: 0,
        pitch: "variable",
      },
      defaultStyleName = "RTF",
    } = options

    this.model.colorRegistry.register({ red: 0, green: 0, blue: 0 }, DEFAULT_COLOR_ALIAS)
    this.model.colorRegistry.register({ red: 128, green: 128, blue: 128 }, SHADING_COLOR_ALIAS)
    this.model.colorRegistry.register({ red: 80, green: 80, blue: 80 }, FOOTNOTE_COLOR_ALIAS)
    this.model.colorRegistry.register({ red: 240, green: 240, blue: 240 }, FOOTNOTE_BACKGROUND_COLOR_ALIAS)
    this.model.fontRegistry.register(defaultFont, DEFAULT_FONT_ALIAS)
    this.model.styleRegistry.register(
      {
        type: "paragraph",
        name: defaultStyleName,
        characterFormatting: {
          fontAlias: DEFAULT_FONT_ALIAS,
          fontSize: pt(12),
        },
      },
      DEFAULT_PARAGRAPH_STYLE_ALIAS
    )

    // Add initial content
    this.variables(options.variables || {})
    this.colors(options.colors || {})
    this.fonts(options.fonts || {})
    this.styles(options.styles || {})

    // Set validator if provided
    this.validator = options.validator
  }

  abstract render(): T

  copyFrom(other: AbstractRichTextDocument<unknown>): this {
    // Deep copy all properties directly
    this.model.info = deepCopy(other.model.info)
    this.model.charset = other.model.charset
    this.model.pageSetup = deepCopy(other.model.pageSetup)
    this.model.viewSettings = deepCopy(other.model.viewSettings)
    this.model.typography = deepCopy(other.model.typography)

    // Deep copy variables and fields
    this.model.variables = deepCopy(other.model.variables)

    // Deep copy registries
    this.model.colorRegistry.copyFrom(other.model.colorRegistry)
    this.model.fontRegistry.copyFrom(other.model.fontRegistry)
    this.model.styleRegistry.copyFrom(other.model.styleRegistry)
    this.model.listRegistry.copyFrom(other.model.listRegistry)
    this.model.bookmarkRegistry.copyFrom(other.model.bookmarkRegistry)
    this.model.commentRegistry.copyFrom(other.model.commentRegistry)

    // Deep copy content using deepCopy
    this.model.sections = deepCopy(other.model.sections)
    return this
  }

  charset(charset: RTFCharset): this {
    this.model.charset = charset
    return this
  }

  info(info: Partial<RTFDocumentInfo>): this {
    const updated = { ...this.model.info, ...info }

    this.validator?.validateDocumentInfo(this.model, updated)
    this.model.info = updated
    return this
  }

  pageSetup(setup: Partial<RTFPageSetup>): this {
    const updated = { ...this.model.pageSetup, ...setup }

    this.validator?.validatePageSetup(this.model, updated)
    this.model.pageSetup = updated
    return this
  }

  viewSettings(settings: Partial<RTFViewSettings>): this {
    const updated = { ...this.model.viewSettings, ...settings }

    this.validator?.validateViewSettings(this.model, updated)
    this.model.viewSettings = updated
    return this
  }

  typography(settings: Partial<RTFTypographySettings>): this {
    const updated = { ...this.model.typography, ...settings }

    this.validator?.validateTypography(this.model, updated)
    this.model.typography = updated
    return this
  }

  variables(items: Record<string, string>): this {
    for (const [name, value] of Object.entries(items)) {
      this.validator?.validateVariableEntry(this.model, name, value)
      this.model.variables[name] = value
    }
    return this
  }

  colors(items: Record<string, RTFColor>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateColorEntry(this.model, alias, value)
      this.model.colorRegistry.register(value, alias)
    }
    return this
  }

  fonts(items: Record<string, RTFFont>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateFontEntry(this.model, alias, value)
      this.model.fontRegistry.register(value, alias)
    }
    return this
  }

  styles(items: Record<string, RTFStyle>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateStyleEntry(this.model, alias, value, Object.keys(items))
      this.model.styleRegistry.register(value, alias)
    }
    return this
  }

  lists(items: Record<string, RTFList>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateListEntry(this.model, alias, value)
      this.model.listRegistry.register(value, alias)
    }
    return this
  }

  bookmarks(items: Record<string, string>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.model.bookmarkRegistry.register(value, alias)
    }
    return this
  }

  comments(items: Record<string, RTFComment>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateCommenEntry(this.model, alias, value)
      this.model.commentRegistry.register(value, alias)
    }
    return this
  }

  sections(...sections: RTFSection[]): this {
    for (const section of sections) {
      this.validator?.validateSection(this.model, section)
      this.model.sections.push(section)
    }
    return this
  }
}
