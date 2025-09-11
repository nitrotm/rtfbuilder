import {
  validateColorEntry,
  validateDocumentInfo,
  validateFontEntry,
  validateListEntry,
  validateListOverrideEntry,
  validatePageSetup,
  validateStyleEntry,
  validateTypography,
  validateVariableEntry,
  validateViewSettings,
} from "./document"
import { validateSection } from "./section"

export const RTF_DOCUMENT_VALIDATOR = {
  validateDocumentInfo,
  validatePageSetup,
  validateViewSettings,
  validateTypography,
  validateVariableEntry,
  validateColorEntry,
  validateFontEntry,
  validateStyleEntry,
  validateListEntry,
  validateListOverrideEntry,
  validateSection,
}
