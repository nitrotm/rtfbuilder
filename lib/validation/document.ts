import { RichTextDocumentModel } from "../document"
import { RTFColor, RTFDocumentInfo, RTFFont, RTFList, RTFListLevel, RTFPageSetup, RTFStyle, RTFTypographySettings, RTFViewSettings } from "../types"
import { toTwip } from "../utils"

import { INVALID_CTRL_CHARS, INVALID_NAME_CHARS, validateRTFRect, validateRTFSize } from "./base"
import { validateCharacterFormatting } from "./character"
import { validateParagraphFormatting } from "./paragraph"
import { validateSectionFormatting } from "./section"

/**
 * Validate document info
 */
export function validateDocumentInfo(_model: RichTextDocumentModel, value: Partial<RTFDocumentInfo>): void {
  // Check for reasonable length limits (based on common RTF reader limits)
  const maxLengths: Record<keyof RTFDocumentInfo, number> = {
    title: 255,
    subject: 255,
    author: 255,
    manager: 255,
    company: 255,
    operator: 255,
    category: 100,
    keywords: 500,
    comment: 1000,
    doccomm: 1000,
    hlinkbase: 500,
  }

  Object.entries(value).forEach(([key, value]) => {
    const field = key as keyof RTFDocumentInfo

    if (value === undefined || value === null) {
      return
    }

    if (value.length > (maxLengths[field] || 0)) {
      throw new Error(`Document info field "${field}" exceeds maximum length of ${maxLengths[field] || 0} characters`)
    }

    // Check for RTF control characters that could break the document
    if (INVALID_CTRL_CHARS.test(value)) {
      throw new Error(`Document info field "${field}" contains RTF control characters (\\, {, }) which are not allowed`)
    }

    // Special validation for keywords field
    if (field === "keywords" && value.includes(";")) {
      // Keywords should be semicolon-separated, but we'll allow it and provide guidance
      console.debug(`Keywords field contains semicolons. In RTF, keywords should be semicolon-separated like "keyword1;keyword2"`)
    }

    // Check for null bytes or other problematic characters
    if (value.includes("\0")) {
      throw new Error(`Document info field "${field}" contains null bytes which are not allowed`)
    }

    // Check for very long lines that might cause issues
    const lines = value.split("\n")
    const maxLineLength = 1000
    lines.forEach((line, index) => {
      if (line.length > maxLineLength) {
        throw new Error(`Document info field "${field}" line ${index + 1} exceeds maximum line length of ${maxLineLength} characters`)
      }
    })
  })
}

/**
 * Validate page setup
 */
export function validatePageSetup(_model: RichTextDocumentModel, value: Partial<RTFPageSetup>): void {
  validateRTFSize(value.paperWidth, "paperWidth")
  validateRTFSize(value.paperHeight, "paperHeight")
  validateRTFRect(value.margin, "margin")
  validateRTFSize(value.gutter, "gutter", true)

  // Validate ranges based on RTF specification and practical limits
  const paperWidth = toTwip(value.paperWidth)
  const paperHeight = toTwip(value.paperHeight)
  const top = toTwip(value.margin?.top)
  const right = toTwip(value.margin?.right)
  const bottom = toTwip(value.margin?.bottom)
  const left = toTwip(value.margin?.left)
  const gutter = toTwip(value.gutter)

  if (paperWidth < 1440 || paperWidth > 31680) {
    throw new Error(`Paper width must be between 1440 and 31680 twips (1-22 inches), got ${paperWidth}`)
  }
  if (paperHeight < 1440 || paperHeight > 48960) {
    throw new Error(`Paper height must be between 1440 and 48960 twips (1-34 inches), got ${paperHeight}`)
  }
  if (top > 7200 || right > 7200 || bottom > 7200 || left > 7200) {
    throw new Error(`Margins must be between 0 and 7200 twips (5 inches), got top=${top}, right=${right}, bottom=${bottom}, left=${left}`)
  }
  if (left + right >= paperWidth) {
    throw new Error(`Combined left and right margins (${left + right} twips) cannot be greater than or equal to paper width (${paperWidth} twips)`)
  }
  if (top + bottom >= paperHeight) {
    throw new Error(`Combined top and bottom margins (${top + bottom} twips) cannot be greater than or equal to paper height (${paperHeight} twips)`)
  }
  if (gutter > 2880) {
    throw new Error(`Gutter must be between 0 and 2880 twips (0-2 inches), got ${gutter}`)
  }

  // Validate gutter with facing pages
  if (value.facingPages) {
    if (gutter > 0) {
      console.debug("Gutter is set with facing pages enabled. Ensure this is intended for proper page layout.")
    }
  } else if (value.marginMirror) {
    console.debug("Margin mirroring is enabled but facing pages is disabled. Margin mirroring typically requires facing pages.")
  }
}

/**
 * Validate view settings
 */
export function validateViewSettings(_model: RichTextDocumentModel, value: Partial<RTFViewSettings>): void {
  // Validate specific fields based on RTF specification
  if (value.viewScale !== undefined) {
    // View zoom percentage - reasonable range for document viewing
    if (value.viewScale < 10 || value.viewScale > 500) {
      throw new Error(`viewScale must be between 10 and 500 percent, got ${value.viewScale}`)
    }

    // Provide warnings for extreme zoom levels
    if (value.viewScale < 25) {
      console.debug(`View scale ${value}% is very small and may be difficult to read`)
    } else if (value.viewScale > 300) {
      console.debug(`View scale ${value}% is very large and may cause display issues`)
    }
  }

  // If viewScale is being set with an automatic zoom kind
  if (value.viewZoomKind !== undefined && value.viewZoomKind !== "none" && value.viewScale !== undefined) {
    console.debug(`Custom viewScale=${value.viewScale} may be overridden by automatic viewZoomKind=${value.viewZoomKind}`)
  }

  // Warn about potentially problematic combinations
  if (value.viewKind === "outline" && value.viewScale && value.viewScale > 200) {
    console.debug("Outline view (viewKind=2) with high zoom scale may not display optimally")
  }
}

/**
 * Validate typography settings
 */
export function validateTypography(_model: RichTextDocumentModel, value: Partial<RTFTypographySettings>): void {
  validateRTFSize(value.hyphenationHotZone, "hyphenationHotZone", true)
  validateRTFSize(value.tabWidth, "tabWidth")

  // Validate specific fields based on RTF specification
  const hyphenationHotZone = toTwip(value.hyphenationHotZone)
  const tabWidth = toTwip(value.tabWidth)

  if (value.hyphenationHotZone !== undefined) {
    // Hot zone - reasonable range for hyphenation zone
    if (hyphenationHotZone > 1440) {
      throw new Error(`Hyphenation hot zone cannot exceed 1440 twips (1 inch), got ${hyphenationHotZone}`)
    }

    // Provide guidance on hot zone values
    if (hyphenationHotZone > 0 && hyphenationHotZone < 144) {
      console.debug(
        `Hyphenation hot zone ${hyphenationHotZone} twips (${Math.round((hyphenationHotZone / 144) * 100) / 100}" ) is very narrow and may cause excessive hyphenation`
      )
    } else if (hyphenationHotZone > 720) {
      console.debug(
        `Hyphenation hot zone ${hyphenationHotZone} twips (${Math.round((hyphenationHotZone / 144) * 100) / 100}") is very wide and may reduce hyphenation effectiveness`
      )
    }
  }
  if (value.tabWidth !== undefined) {
    // Tab width should be positive and reasonable (min 1/12" = 120 twips, max 2" = 2880 twips)
    if (tabWidth < 120) {
      throw new Error(`Default tab width too small (minimum 120 twips = 1/12 inch), got ${tabWidth}`)
    }
    if (tabWidth > 2880) {
      throw new Error(`Default tab width too large (maximum 2880 twips = 2 inches), got ${tabWidth}`)
    }
  }
  if (value.consecutiveHyphens !== undefined) {
    // Count of consecutive hyphens - RTF spec allows 0 = no limit
    if (value.consecutiveHyphens < 0) {
      throw new Error(`Consecutive hyphens count cannot be negative, got ${value.consecutiveHyphens}`)
    }
    if (value.consecutiveHyphens > 10) {
      throw new Error(`Consecutive hyphens count should not exceed 10 for readability, got ${value.consecutiveHyphens}`)
    }

    // Provide guidance on consecutive hyphen values
    if (value.consecutiveHyphens === 0) {
      console.debug("Consecutive hyphens set to 0 (no limit). This may result in poor readability with many consecutive hyphenated lines.")
    } else if (value.consecutiveHyphens === 1) {
      console.debug("Consecutive hyphens set to 1. This is very restrictive and may result in poor justification.")
    } else if (value.consecutiveHyphens >= 5) {
      console.debug(`Consecutive hyphens set to ${value}. Values above 3-4 may allow too many consecutive hyphenated lines.`)
    }
  }
  // Hyphenation settings should be compatible
  if (value.autoHyphenation === false) {
    if (value.hyphenationHotZone !== undefined && hyphenationHotZone > 0) {
      throw new Error("Auto hyphenation is disabled but hyphenation hot zone is set. Hot zone will have no effect without auto hyphenation.")
    }
    if (value.consecutiveHyphens !== undefined && value.consecutiveHyphens > 0) {
      throw new Error("Auto hyphenation is disabled but consecutive hyphens limit is set. This limit will have no effect without auto hyphenation.")
    }
  }
}

/**
 * Validate document variable
 */
export function validateVariableEntry(_model: RichTextDocumentModel, name: string, value: string): void {
  // Length validation
  if (name.length === 0 || name.length > 255) {
    throw new Error(`Variable name cannot be empty or exceed 255 characters, got ${name.length}`)
  }

  // Character validation - RTF-safe characters for DOCVARIABLE field names
  if (INVALID_NAME_CHARS.test(name)) {
    throw new Error(`Variable name contains invalid RTF characters ({}\\;"): "${name}"`)
  }

  // RTF variable name requirements - must be valid identifier
  const validNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/
  if (!validNamePattern.test(name)) {
    throw new Error(`Variable name "${name}" must start with a letter or underscore and contain only letters, numbers, and underscores`)
  }

  // Reserved variable names (common RTF/Word built-in variables)
  const reservedNames = [
    "PAGE",
    "NUMPAGES",
    "DATE",
    "TIME",
    "FILENAME",
    "FILESIZE",
    "AUTHOR",
    "TITLE",
    "SUBJECT",
    "KEYWORDS",
    "COMMENTS",
    "LASTSAVEDBY",
    "CREATEDATE",
    "SAVEDATE",
    "PRINTDATE",
  ]

  if (reservedNames.includes(name.toUpperCase())) {
    throw new Error(`Variable name "${name}" is reserved for built-in RTF/Word variables.`)
  }

  // Length validation - RTF has practical limits for variable content
  if (value.length > 32767) {
    throw new Error(`Variable value cannot exceed 32,767 characters, got ${value.length}`)
  }
}

/**
 * Validate color entry
 */
export function validateColorEntry(_model: RichTextDocumentModel, _alias: string, value: RTFColor): void {
  // Range validation (RTF specification: 0-255 for 8-bit RGB)
  if (value.red < 0 || value.red > 255 || value.green < 0 || value.green > 255 || value.blue < 0 || value.blue > 255) {
    throw new Error(`Color component must be between 0-255, got red=${value.red} green=${value.green} blue=${value.blue}`)
  }
}

/**
 * Validate font entry
 */
export function validateFontEntry(_model: RichTextDocumentModel, _alias: string, value: RTFFont): void {
  // Required name field validation
  if (value.name.length === 0 || value.name.length > 64) {
    throw new Error(`Font name cannot be empty string or exceed 64 characters, got ${(value.name || "").length}`)
  }

  // Font name character validation
  if (INVALID_NAME_CHARS.test(value.name)) {
    throw new Error(`Font name contains invalid RTF characters ({}\\;): "${value.name}"`)
  }

  // Character set validation
  if (value.charset !== undefined) {
    if (!Number.isInteger(value.charset)) {
      throw new Error(`Font charset must be an integer, got ${typeof value.charset}`)
    }

    if (value.charset < 0 || value.charset > 255) {
      throw new Error(`Font charset must be between 0-255, got ${value.charset}`)
    }
  }

  // Alternative font name validation (falt)
  if (value.falt !== undefined) {
    if (value.falt.length > 64) {
      throw new Error(`Font alternative name cannot exceed 64 characters, got ${value.falt.length}`)
    }

    if (INVALID_NAME_CHARS.test(value.falt)) {
      throw new Error(`Font alternative name contains invalid RTF characters ({}\\;): "${value.falt}"`)
    }
  }
}

/**
 * Validate style entry
 */
export function validateStyleEntry(model: RichTextDocumentModel, _alias: string, value: RTFStyle, pendingStyleAliases: string[]): void {
  // Style name validation (optional field)
  if (value.name !== undefined) {
    if (value.name.length === 0 || value.name.length > 253) {
      throw new Error(`Style name cannot be empty string or exceed 253 characters, got ${value.name.length}`)
    }

    // RTF-safe character validation for style names
    if (INVALID_NAME_CHARS.test(value.name)) {
      throw new Error(`Style name contains invalid RTF characters ({}\\;): "${value.name}"`)
    }
  }

  // Base style alias validation
  if (value.baseStyleAlias !== undefined && !model.styleRegistry.has(value.baseStyleAlias) && !pendingStyleAliases.includes(value.baseStyleAlias)) {
    throw new Error(`Base style alias "${value.baseStyleAlias}" not found.`)
  }

  // Next style alias validation
  if (value.nextStyleAlias !== undefined && !model.styleRegistry.has(value.nextStyleAlias) && !pendingStyleAliases.includes(value.nextStyleAlias)) {
    throw new Error(`Next style alias "${value.nextStyleAlias}" not found.`)
  }

  // Formatting validation (if provided)
  if (value.characterFormatting !== undefined) {
    validateCharacterFormatting(model, value.characterFormatting)
  }
  if (value.paragraphFormatting !== undefined) {
    validateParagraphFormatting(model, value.paragraphFormatting)
  }
  if (value.sectionFormatting !== undefined) {
    validateSectionFormatting(model, value.sectionFormatting)
  }
}

/**
 * Validate list entry
 */
export function validateListEntry(model: RichTextDocumentModel, alias: string, value: RTFList): void {
  // Critical validation: List must have at least one level defined
  if (value.levels.length === 0) {
    throw new Error(`List "${alias}" must have at least one level defined`)
  }

  // RTF spec allows up to 9 levels (0-8)
  if (value.levels.length > 9) {
    throw new Error(`List "${alias}" has ${value.levels.length} levels, but maximum is 9 (levels 0-8)`)
  }

  // Validate each level
  value.levels.forEach((level, index) => {
    if (level) {
      try {
        validateListLevelEntry(model, index, level)
      } catch (error) {
        throw new Error(`List "${alias}" level ${index}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  })

  // Check for level continuity (levels should be sequential from 0)
  for (let i = 0; i < value.levels.length; i++) {
    if (!value.levels[i] || Object.keys(value.levels[i]).length === 0) {
      console.debug(`Warning: List "${alias}" has undefined or empty level ${i}. Consider defining all levels sequentially.`)
    }
  }
}

/**
 * Validate list level entry
 */
export function validateListLevelEntry(_model: RichTextDocumentModel, level: number, value: RTFListLevel): void {
  // Validate startAt (must be positive integer)
  if (value.startAt !== undefined) {
    if (!Number.isInteger(value.startAt) || value.startAt < 0) {
      throw new Error(`Start number must be a non-negative integer, got ${value.startAt}`)
    }
    if (value.startAt > 32767) {
      throw new Error(`Start number ${value.startAt} exceeds maximum value of 32767`)
    }
  }

  // Validate restartAfterLevel
  if (value.restartAfterLevel !== undefined) {
    if (!Number.isInteger(value.restartAfterLevel) || value.restartAfterLevel < 0 || value.restartAfterLevel > 8) {
      throw new Error(`Restart after level must be between 0-8, got ${value.restartAfterLevel}`)
    }
    if (value.restartAfterLevel > level) {
      throw new Error(`Restart after level ${value.restartAfterLevel} cannot be greater than current level ${level}`)
    }
  }

  // Validate indentation and positioning
  validateRTFSize(value.leftIndent, `leftIndent`, true, true)
  validateRTFSize(value.firstLineIndent, `firstLineIndent`, true, true)
}
