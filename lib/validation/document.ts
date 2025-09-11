import { RTFDocumentModel } from "lib/document"
import {
  RTFColor,
  RTFDocumentInfo,
  RTFFont,
  RTFList,
  RTFListLevel,
  RTFListOverride,
  RTFPageSetup,
  RTFStyle,
  RTFTypographySettings,
  RTFViewSettings,
} from "lib/types"
import { toTwips } from "lib/utils"

import { INVALID_CTRL_CHARS, INVALID_NAME_CHARS, validateRTFRect, validateRTFSize } from "./base"
import { validateCharacterFormatting } from "./character"
import { validateParagraphFormatting } from "./paragraph"
import { validateSectionFormatting } from "./section"

/**
 * Validate document info
 */
export function validateDocumentInfo(_model: RTFDocumentModel, value: Partial<RTFDocumentInfo>): void {
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
export function validatePageSetup(_model: RTFDocumentModel, value: Partial<RTFPageSetup>): void {
  validateRTFSize(value.paperWidth, "paperWidth")
  validateRTFSize(value.paperHeight, "paperHeight")
  validateRTFRect(value.margin, "margin")
  validateRTFSize(value.gutter, "gutter", true)

  // Validate ranges based on RTF specification and practical limits
  const paperWidth = toTwips(value.paperWidth)
  const paperHeight = toTwips(value.paperHeight)
  const top = toTwips(value.margin?.top)
  const right = toTwips(value.margin?.right)
  const bottom = toTwips(value.margin?.bottom)
  const left = toTwips(value.margin?.left)
  const gutter = toTwips(value.gutter)

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
export function validateViewSettings(_model: RTFDocumentModel, value: Partial<RTFViewSettings>): void {
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
export function validateTypography(_model: RTFDocumentModel, value: Partial<RTFTypographySettings>): void {
  validateRTFSize(value.hyphenationHotZone, "hyphenationHotZone", true)
  validateRTFSize(value.defaultTabWidth, "defaultTabWidth")

  // Validate specific fields based on RTF specification
  const hyphenationHotZone = toTwips(value.hyphenationHotZone)
  const defaultTabWidth = toTwips(value.defaultTabWidth)

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
  if (value.defaultTabWidth !== undefined) {
    // Tab width should be positive and reasonable (min 1/12" = 120 twips, max 2" = 2880 twips)
    if (defaultTabWidth < 120) {
      throw new Error(`Default tab width too small (minimum 120 twips = 1/12 inch), got ${defaultTabWidth}`)
    }
    if (defaultTabWidth > 2880) {
      throw new Error(`Default tab width too large (maximum 2880 twips = 2 inches), got ${defaultTabWidth}`)
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

  // Widow control guidance
  if (value.widowControl === false) {
    console.debug("Widow control is disabled. This may result in single lines at the top or bottom of pages, reducing readability.")
  }
}

/**
 * Validate document variable
 */
export function validateVariableEntry(_model: RTFDocumentModel, name: string, value: string): void {
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
export function validateColorEntry(_model: RTFDocumentModel, _alias: string, value: RTFColor): void {
  // Range validation (RTF specification: 0-255 for 8-bit RGB)
  if (value.red < 0 || value.red > 255 || value.green < 0 || value.green > 255 || value.blue < 0 || value.blue > 255) {
    throw new Error(`Color component must be between 0-255, got red=${value.red} green=${value.green} blue=${value.blue}`)
  }
}

/**
 * Validate font entry
 */
export function validateFontEntry(_model: RTFDocumentModel, _alias: string, value: Partial<RTFFont>): void {
  // Required name field validation
  if (!value.name || value.name.length === 0 || value.name.length > 64) {
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
export function validateStyleEntry(model: RTFDocumentModel, _alias: string, value: Partial<RTFStyle>, pendingStyleAliases: string[]): void {
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
export function validateListEntry(model: RTFDocumentModel, alias: string, value: Partial<RTFList>): void {
  // Critical validation: List must have at least one level defined
  if (!value.levels || value.levels.length === 0) {
    throw new Error(`List "${alias}" must have at least one level defined`)
  }

  // RTF spec allows up to 9 levels (0-8)
  if (value.levels.length > 9) {
    throw new Error(`List "${alias}" has ${value.levels.length} levels, but maximum is 9 (levels 0-8)`)
  }

  // Validate list type
  if (value.type !== undefined) {
    const validTypes = ["simple", "multi", "hybrid"]
    if (!validTypes.includes(value.type)) {
      throw new Error(`List "${alias}" has invalid type "${value.type}". Must be one of: ${validTypes.join(", ")}`)
    }

    // Simple lists should only have one level
    if (value.type === "simple" && value.levels.length > 1) {
      console.debug(`Warning: List "${alias}" is marked as simple but has ${value.levels.length} levels. Simple lists typically have only one level.`)
    }
  }

  // Validate each level
  value.levels.forEach((level, index) => {
    if (level) {
      try {
        validateListLevelEntry(model, alias, index, level)
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
export function validateListLevelEntry(_model: RTFDocumentModel, listAlias: string, level: number, value: Partial<RTFListLevel>): void {
  // Validate level number range
  if (level < 0 || level > 8) {
    throw new Error(`List level must be between 0-8, got ${level}`)
  }

  // Validate number format
  if (value.numberFormat !== undefined) {
    const validFormats = ["arabic", "upperRoman", "lowerRoman", "upperLetter", "lowerLetter", "ordinal", "cardinal", "ordinalText", "bullet", "none"]
    if (!validFormats.includes(value.numberFormat)) {
      throw new Error(`Invalid number format "${value.numberFormat}". Must be one of: ${validFormats.join(", ")}`)
    }
  }

  // Validate justification
  if (value.justification !== undefined) {
    const validJustifications = ["left", "center", "right"]
    if (!validJustifications.includes(value.justification)) {
      throw new Error(`Invalid justification "${value.justification}". Must be one of: ${validJustifications.join(", ")}`)
    }
  }

  // Validate follow character
  if (value.followChar !== undefined) {
    const validFollowChars = ["tab", "space", "nothing"]
    if (!validFollowChars.includes(value.followChar)) {
      throw new Error(`Invalid follow character "${value.followChar}". Must be one of: ${validFollowChars.join(", ")}`)
    }
  }

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
  validateRTFSize(value.leftIndent, `list[${listAlias}].level[${level}].leftIndent`, true, true)
  validateRTFSize(value.firstLineIndent, `list[${listAlias}].level[${level}].firstLineIndent`, true, true)
  validateRTFSize(value.tabPosition, `list[${listAlias}].level[${level}].tabPosition`, true)
  validateRTFSize(value.numberPosition, `list[${listAlias}].level[${level}].numberPosition`, true)
  validateRTFSize(value.textPosition, `list[${listAlias}].level[${level}].textPosition`, true)

  // Validate level text (custom number/bullet text)
  if (value.levelText !== undefined) {
    if (value.levelText.length > 255) {
      throw new Error(`Level text cannot exceed 255 characters, got ${value.levelText.length}`)
    }

    // Check for RTF control characters that could break the document
    if (INVALID_CTRL_CHARS.test(value.levelText)) {
      throw new Error(`Level text contains RTF control characters (\\, {, }) which must be properly escaped`)
    }
  }

  // Validate level numbers format
  if (value.levelNumbers !== undefined) {
    if (value.levelNumbers.length > 255) {
      throw new Error(`Level numbers format cannot exceed 255 characters, got ${value.levelNumbers.length}`)
    }
  }

  // Logical validations
  if (value.numberFormat === "bullet" || value.numberFormat === "none") {
    if (value.startAt !== undefined && value.startAt !== 1) {
      console.debug(`Warning: Start number ${value.startAt} has no effect for number format "${value.numberFormat}"`)
    }
  }

  // Hanging indent validation (first line indent should typically be negative for lists)
  const firstLineIndent = toTwips(value.firstLineIndent)
  const leftIndent = toTwips(value.leftIndent)
  if (firstLineIndent > 0 && leftIndent > 0) {
    console.debug(`Warning: List level ${level} has positive first line indent. Lists typically use negative first line indent for hanging indentation.`)
  }
  if (firstLineIndent < 0 && Math.abs(firstLineIndent) > leftIndent) {
    console.debug(`Warning: List level ${level} has first line indent that extends beyond left margin. This may cause rendering issues.`)
  }
}

/**
 * Validate list override entry
 */
export function validateListOverrideEntry(model: RTFDocumentModel, alias: string, value: Partial<RTFListOverride>): void {
  // Critical validation: List override must reference an existing list
  if (!value.listAlias) {
    throw new Error(`List override "${alias}" must reference a list via listAlias`)
  }

  if (!model.listRegistry.has(value.listAlias)) {
    throw new Error(`List override "${alias}" references non-existent list "${value.listAlias}"`)
  }

  // Get the referenced list for validation
  const referencedListEntry = model.listRegistry.get(value.listAlias)
  const referencedList = referencedListEntry?.item
  const maxLevel = referencedList?.levels ? referencedList.levels.length - 1 : 8

  // Validate level overrides
  if (value.levelOverrides && value.levelOverrides.length > 0) {
    const overriddenLevels = new Set<number>()

    value.levelOverrides.forEach((override, index) => {
      if (!override) return

      // Validate level number
      if (override.level !== undefined) {
        if (!Number.isInteger(override.level) || override.level < 0 || override.level > 8) {
          throw new Error(`List override "${alias}" level override ${index}: level must be between 0-8, got ${override.level}`)
        }

        if (override.level > maxLevel) {
          throw new Error(`List override "${alias}" level override ${index}: level ${override.level} exceeds maximum level ${maxLevel} in referenced list`)
        }

        // Check for duplicate level overrides
        if (overriddenLevels.has(override.level)) {
          throw new Error(`List override "${alias}" has multiple overrides for level ${override.level}`)
        }
        overriddenLevels.add(override.level)
      }

      // Validate startAt override
      if (override.startAt !== undefined) {
        if (!Number.isInteger(override.startAt) || override.startAt < 0) {
          throw new Error(`List override "${alias}" level override ${index}: startAt must be a non-negative integer, got ${override.startAt}`)
        }
        if (override.startAt > 32767) {
          throw new Error(`List override "${alias}" level override ${index}: startAt ${override.startAt} exceeds maximum value of 32767`)
        }
      }

      // Validate override properties if provided
      if (override.override) {
        try {
          validateListLevelEntry(model, `${alias}(override)`, override.level || 0, override.override)
        } catch (error) {
          throw new Error(`List override "${alias}" level ${override.level}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    })
  }
}
