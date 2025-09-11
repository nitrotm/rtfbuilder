/*!
 * RTFDocument - Complete RTF document state management
 *
 * This class maintains all state necessary to generate RTF documents,
 * designed around the complete RTF specification.
 */

import {
  RTFCharset,
  RTFColor,
  RTFDocumentInfo,
  RTFFont,
  RTFList,
  RTFListOverride,
  RTFPageSetup,
  RTFSection,
  RTFStyle,
  RTFTypographySettings,
  RTFViewSettings,
} from "./types"
import { deepCopy, deepEqual, inch, RTFRegistry } from "./utils"

/** Default color alias for automatic/black color */
export const DEFAULT_COLOR_ALIAS = "auto"

/** Default font alias for Times New Roman */
export const DEFAULT_FONT_ALIAS = "default"

/** Default paragraph style alias */
export const DEFAULT_PARAGRAPH_STYLE_ALIAS = "default"

/** Footnote mark color aliases */
export const FOOTNOTE_COLOR_ALIAS = "footnotefg"
export const FOOTNOTE_BACKGROUND_COLOR_ALIAS = "footnotebg"

/** RTF document constructor options */
export type DocumentOptions = {
  defaultFont: Partial<RTFFont> // Default font (default: Times New Roman)
  variables: Record<string, string> // Initial document variables
  colors: Record<string, RTFColor> // Initial color registry entries
  fonts: Record<string, Partial<RTFFont>> // Initial font registry entries
  styles: Record<string, Partial<RTFStyle>> // Initial style registry entries
  validator: RTFDocumentValidator // Optional validator
}

/** Internal document model */
export type RTFDocumentModel = {
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
  listOverrideRegistry: RTFRegistry<RTFListOverride>

  // Document sections
  sections: RTFSection[]
}

/** Interface for document validators */
export type RTFDocumentValidator = {
  validateDocumentInfo(model: RTFDocumentModel, value: Partial<RTFDocumentInfo>): void
  validatePageSetup(model: RTFDocumentModel, value: Partial<RTFPageSetup>): void
  validateViewSettings(model: RTFDocumentModel, value: Partial<RTFViewSettings>): void
  validateTypography(model: RTFDocumentModel, value: Partial<RTFTypographySettings>): void
  validateVariableEntry(model: RTFDocumentModel, name: string, value: string): void
  validateColorEntry(model: RTFDocumentModel, alias: string, value: RTFColor): void
  validateFontEntry(model: RTFDocumentModel, alias: string, value: Partial<RTFFont>): void
  validateStyleEntry(model: RTFDocumentModel, alias: string, value: Partial<RTFStyle>, pendingStyleAliases: string[]): void
  validateListEntry(model: RTFDocumentModel, alias: string, value: Partial<RTFList>): void
  validateListOverrideEntry(model: RTFDocumentModel, alias: string, value: Partial<RTFListOverride>): void
  validateSection(model: RTFDocumentModel, value: Partial<RTFSection>): void
}

/** Complete RTF document state management */
export abstract class AbstractDocument<T> {
  // Internal document model
  protected readonly model: RTFDocumentModel = {
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
      widowControl: true,
      autoHyphenation: false,
      defaultTabWidth: inch(0.5),
    },
    variables: {},
    colorRegistry: new RTFRegistry<RTFColor>(deepEqual),
    fontRegistry: new RTFRegistry<RTFFont>(deepEqual),
    styleRegistry: new RTFRegistry<RTFStyle>(deepEqual),
    listRegistry: new RTFRegistry<RTFList>(),
    listOverrideRegistry: new RTFRegistry<RTFListOverride>((a, b) => a.listAlias === b.listAlias),
    sections: [],
  }

  // Optional validator
  private readonly validator?: RTFDocumentValidator

  /** Create a new RTF document with optional initial settings */
  constructor(options: Partial<DocumentOptions> = {}) {
    // Add default color/font
    const {
      defaultFont = {
        name: "Times New Roman",
        family: "roman",
        charset: 0,
        pitch: "variable",
      },
    } = options

    this.model.colorRegistry.register({ red: 0, green: 0, blue: 0 }, DEFAULT_COLOR_ALIAS)
    this.model.colorRegistry.register({ red: 80, green: 80, blue: 80 }, FOOTNOTE_COLOR_ALIAS)
    this.model.colorRegistry.register({ red: 240, green: 240, blue: 240 }, FOOTNOTE_BACKGROUND_COLOR_ALIAS)
    this.model.fontRegistry.register(defaultFont, DEFAULT_FONT_ALIAS)
    this.model.styleRegistry.register(
      {
        type: "paragraph",
        name: "RTF",
        characterFormatting: {
          fontAlias: DEFAULT_FONT_ALIAS,
          fontSize: 24, // 12pt
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

  /**
   * Render the document to the desired output format
   */
  abstract render(): T

  /**
   * Copy all content and settings from another document
   */
  copyFrom(other: AbstractDocument<unknown>): this {
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
    this.model.listOverrideRegistry.copyFrom(other.model.listOverrideRegistry)

    // Deep copy content using deepCopy
    this.model.sections = deepCopy(other.model.sections)
    return this
  }

  /**
   * Set document charset
   */
  charset(charset: RTFCharset): this {
    this.model.charset = charset
    return this
  }

  /**
   * Set document information properties
   */
  info(info: Partial<RTFDocumentInfo>): this {
    const updated = { ...this.model.info, ...info }

    this.validator?.validateDocumentInfo(this.model, updated)
    this.model.info = updated
    return this
  }

  /**
   * Set page setup properties
   */
  pageSetup(setup: Partial<RTFPageSetup>): this {
    const updated = { ...this.model.pageSetup, ...setup }

    this.validator?.validatePageSetup(this.model, updated)
    this.model.pageSetup = updated
    return this
  }

  /**
   * Set view settings
   */
  viewSettings(settings: Partial<RTFViewSettings>): this {
    const updated = { ...this.model.viewSettings, ...settings }

    this.validator?.validateViewSettings(this.model, updated)
    this.model.viewSettings = updated
    return this
  }

  /**
   * Set typography settings
   */
  typography(settings: Partial<RTFTypographySettings>): this {
    const updated = { ...this.model.typography, ...settings }

    this.validator?.validateTypography(this.model, updated)
    this.model.typography = updated
    return this
  }

  /**
   * Add multiple document variables (fluent interface)
   */
  variables(items: Record<string, string>): this {
    for (const [name, value] of Object.entries(items)) {
      this.validator?.validateVariableEntry(this.model, name, value)
      this.model.variables[name] = value
    }
    return this
  }

  /**
   * Add a color to the color table (fluent interface)
   */
  colors(items: Record<string, RTFColor>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateColorEntry(this.model, alias, value)
      this.model.colorRegistry.register(value, alias)
    }
    return this
  }

  /**
   * Add a font to the font table (fluent interface)
   */
  fonts(items: Record<string, Partial<RTFFont>>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateFontEntry(this.model, alias, value)
      this.model.fontRegistry.register(value, alias)
    }
    return this
  }

  /**
   * Add a style to the stylesheet (fluent interface)
   */
  styles(items: Record<string, Partial<RTFStyle>>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateStyleEntry(this.model, alias, value, Object.keys(items))
      this.model.styleRegistry.register(value, alias)
    }
    return this
  }

  /**
   * Register a list with an alias
   */
  lists(items: Record<string, Partial<RTFList>>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateListEntry(this.model, alias, value)
      this.model.listRegistry.register(value, alias)
    }
    return this
  }

  /**
   * Register a list override with an alias
   */
  listOverrides(items: Record<string, Partial<RTFListOverride>>): this {
    for (const [alias, value] of Object.entries(items)) {
      this.validator?.validateListOverrideEntry(this.model, alias, value)
      this.model.listOverrideRegistry.register(value, alias)
    }
    return this
  }

  /**
   * Add a new section to the document
   */
  sections(...sections: RTFSection[]): this {
    for (const section of sections) {
      this.validator?.validateSection(this.model, section)
      this.model.sections.push(section)
    }
    return this
  }
}
