import { RichTextDocumentValidator } from "lib/document"
import {
  validateColorEntry,
  validateCommentEntry,
  validateDocumentInfo,
  validateFontEntry,
  validateListEntry,
  validatePageSetup,
  validateStyleEntry,
  validateTypography,
  validateVariableEntry,
  validateViewSettings,
} from "./document"
import { validateSection } from "./section"

export const RTF_DOCUMENT_VALIDATOR: RichTextDocumentValidator = {
  validateDocumentInfo,
  validatePageSetup,
  validateViewSettings,
  validateTypography,
  validateVariableEntry,
  validateColorEntry,
  validateFontEntry,
  validateStyleEntry,
  validateListEntry,
  validateCommentEntry,
  validateSection,
}
