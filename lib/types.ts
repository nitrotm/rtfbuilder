/**
 * RTF Type Definitions
 */

// ============================================================================
// Document Properties
// ============================================================================

/** Character set options */
export type RTFCharset = "ansi" | "mac" | "pc" | "pca"

/** User-settable document information - use Partial<RTFDocumentInfo> when optional */
export type RTFDocumentInfo = {
  title: string // \title
  subject: string // \subject
  author: string // \author
  manager: string // \manager
  company: string // \company
  operator: string // \operator
  category: string // \category
  keywords: string // \keywords
  comment: string // \comment
  doccomm: string // \doccomm
  hlinkbase: string // \hlinkbase
}

/** Page setup and margins - use Partial<RTFPageSetup> when optional */
export type RTFPageSetup = {
  paperWidth: RTFSize // \paperwN - paper size
  paperHeight: RTFSize // \paperhN - paper size
  margin: Partial<RTFRect> // \marglN \margrN \margtN \margbN - page margins
  gutter: RTFSize // \gutterN - gutter size
  landscape: boolean // \landscape - landscape orientation
  facingPages: boolean // \facingp - enable facing pages
  marginMirror: boolean // \margmirror - mirror margins for facing pages

  // Footnotes
  footnotePosition: "bottom" | "beneath" | "section" | "document" // \ftnbj, \ftntj, \endnotes, \enddoc
  footnoteNumbering: "arabic" | "lowercase" | "uppercase" | "roman-lower" | "roman-upper" | "chicago" // \ftnnar, \ftnnalc, etc.
  endnoteNumbering: "arabic" | "lowercase" | "uppercase" | "roman-lower" | "roman-upper" | "chicago" // \aftnnar, \aftnnalc, etc.
  footnoteRestart: "page" | "section" | "continuous" // \ftnrstpg, \ftnrestart, \ftnrstcont
  footnoteStartNumber: number // \ftnstartN
  endnoteStartNumber: number // \aftnstart
}

/** Document view settings - use Partial<RTFViewSettings> when optional */
export type RTFViewSettings = {
  viewKind: "none" | "pageLayout" | "outline" | "masterDocument" | "normal" | "online" // \viewkindN
  viewScale: number // \viewscaleN
  viewZoomKind: "none" | "fullPage" | "bestFit" | "textWidth" // \viewzkN - 0=none, 1=full page, 2=best fit, 3=text width
}

/** Typography settings - use Partial<RTFTypographySettings> when optional */
export type RTFTypographySettings = {
  widowControl: boolean // \widowctrl
  autoHyphenation: boolean // \hyphauto
  hyphenationHotZone: RTFSize // \hyphhotzN
  consecutiveHyphens: number // \hyphconsecN
  contextualSpacing: boolean // \contextualspace
  defaultTabWidth: RTFSize // \deftabN
  hyphenateCaps: boolean // \hyphcaps
}

// ============================================================================
// Basic Types
// ============================================================================

/** Size specification - either twips (number) or with explicit unit */
export type RTFSize =
  | number
  | {
      unit: "mm" | "cm" | "pt" | "in" | "px"
      value: number
    }

/** Margin or padding definition - use Partial<RTFRect> when optional */
export type RTFRect = {
  top: RTFSize
  right: RTFSize
  bottom: RTFSize
  left: RTFSize
}

/** Border definition - use Partial<RTFBorder> when optional */
export type RTFBorder = {
  style: "single" | "double" | "dotted" | "dashed" | "triple" | "wave" | "none" // Border style
  width: RTFSize // Border width
  colorAlias: string // Reference to color by alias
  spacing: RTFSize // Space from text
}

/** Collection of borders for all four sides */
export type RTFBorders = {
  top: Partial<RTFBorder>
  right: Partial<RTFBorder>
  bottom: Partial<RTFBorder>
  left: Partial<RTFBorder>
}

/** Table border properties including horizontal and vertical inside borders */
export type RTFTableBorders = RTFBorders & {
  horizontal: Partial<RTFBorder>
  vertical: Partial<RTFBorder>
}

/** Shading pattern types */
export type RTFShadingPattern =
  | "horizontal" // \bghoriz - horizontal lines
  | "vertical" // \bgvert - vertical lines
  | "forwardDiagonal" // \bgfdiag - forward diagonal (\\\\)
  | "backwardDiagonal" // \bgbdiag - backward diagonal (////)
  | "cross" // \bgcross - cross pattern
  | "diagonalCross" // \bgdcross - diagonal cross
  | "darkHorizontal" // \bgdkhoriz - dark horizontal lines
  | "darkVertical" // \bgdkvert - dark vertical lines
  | "darkForwardDiagonal" // \bgdkfdiag - dark forward diagonal
  | "darkBackwardDiagonal" // \bgdkbdiag - dark backward diagonal
  | "darkCross" // \bgdkcross - dark cross pattern
  | "darkDiagonalCross" // \bgdkdcross - dark diagonal cross

/** Shading definition */
export type RTFShading = {
  ratio: number // \shadingN - Shading ratio (0.0 to 1.0)
  pattern: RTFShadingPattern // \bgtblrsN - Shading pattern
  foregroundColorAlias: string // \chcfpatN - Pattern foreground color
  backgroundColorAlias: string // \chcbpatN - Pattern background color
}

// ============================================================================
// Registries
// ============================================================================

/** Style definition */
export type RTFStyle = {
  type: "character" | "paragraph" | "section" // \cs, \s or \ds
  baseStyleAlias: string // Reference to base style by alias
  nextStyleAlias: string // Reference to next style by alias
  name: string // RTF style name shown to user (defaults to alias if not provided)
  characterFormatting: Partial<RTFCharacterFormatting>
  paragraphFormatting: Partial<RTFParagraphFormatting>
  sectionFormatting: Partial<RTFSectionFormatting>
}

/** Color definition */
export type RTFColor = {
  red: number // 0-255
  green: number // 0-255
  blue: number // 0-255
}

/** Font definition */
export type RTFFont = {
  name: string // Font name (e.g., "Arial")
  family: "roman" | "swiss" | "modern" | "script" | "decor" | "tech" | "nil" // Font family
  charset: number // Font charset code (e.g., 0=ANSI, 1=Default, 2=Symbol, etc.)
  pitch: "fixed" | "variable" | "default" // Font pitch
  falt?: string // Font alternate name
}

/** List numbering format types */
export type RTFListNumberFormat =
  | "arabic" // 0 - Arabic numerals (1, 2, 3)
  | "upperRoman" // 1 - Upper Roman (I, II, III)
  | "lowerRoman" // 2 - Lower Roman (i, ii, iii)
  | "upperLetter" // 3 - Upper letters (A, B, C)
  | "lowerLetter" // 4 - Lower letters (a, b, c)
  | "ordinal" // 5 - Ordinal numbers (1st, 2nd, 3rd)
  | "cardinal" // 6 - Cardinal text (One, Two, Three)
  | "ordinalText" // 7 - Ordinal text (First, Second, Third)
  | "bullet" // 23 - Bullet point
  | "none" // 255 - No number/bullet

/** List level definition - use Partial<RTFListLevelSettings> when optional */
export type RTFListLevel = {
  // Level numbering
  numberFormat: RTFListNumberFormat // \levelnfcN - Number format
  justification: "left" | "center" | "right" // \leveljcN - Number/bullet alignment (0=left, 1=center, 2=right)
  followChar: "tab" | "space" | "nothing" // \levelfollowN - What follows number (0=tab, 1=space, 2=nothing)
  startAt: number // \levelstartatN - Starting number for this level (default: 1)
  restartAfterLevel: number // \levelrestartN - Restart numbering after this level (0=none, 1=level 1, etc.)

  // Indentation and spacing
  leftIndent: RTFSize // \liN - Left indent for paragraph
  firstLineIndent: RTFSize // \fiN - First line indent (usually negative for hanging)
  tabPosition: RTFSize // \txN - Tab position after number
  numberPosition: RTFSize // \levelnfcN - Position of number/bullet
  textPosition: RTFSize // \leveltext - Position of text after number/bullet

  // Advanced properties
  levelText: string // \leveltext - Custom number/bullet text (use \u8226 for bullet)
  levelNumbers: string // \levelnumbers - Custom level number format (e.g., "1.2.3")
  noRestart: boolean // \levelnorestart - Don't restart numbering
}

/** List definition in list table - use Partial<RTFListDefinition> when optional */
export type RTFList = {
  type: "simple" | "multi" | "hybrid" // \listsimpleN - Simple list (1) or multilevel (0),  \listhybrid - Hybrid list
  restartEachSection: boolean // \listrestarthdnN - Restart numbering each section

  // List levels (up to 9 levels, 0-8)
  levels: Partial<RTFListLevel>[] // \listlevel definitions
}

/** List override for specific instance - use Partial<RTFListOverrideDefinition> when optional */
export type RTFListOverride = {
  listAlias: string // \listidN - Reference to list definition

  // Level overrides
  levelOverrides: Partial<{
    level: number // Which level to override (0-8)
    startAt: number // \levelstartatN - Override start number
    override: Partial<RTFListLevel> // Override properties
  }>[]
}

// ============================================================================
// Paragraphs and Characters
// ============================================================================

/** Supported picture types - \emfblip, \pngblip, \jpegblip, \wmetafileN, \dibitmapN, \wbitmapN, \macpict */
export type RTFPictureType = "emf" | "png" | "jpeg" | "wmetafile" | "dibitmap" | "wbitmap" | "macpict"

/** Picture data with format and dimensions */
export type RTFPictureData = {
  format: RTFPictureType // Picture format
  data: Uint8Array // Binary image data
  width: number // \picwN - original width in pixels
  height: number // \pichN - original height in pixels
}

/** Picture properties */
export type RTFPictureFormatting = {
  displayWidth: RTFSize // \picwgoalN - desired display width
  displayHeight: RTFSize // \pichgoalN - desired display height
  scaleX: number // \picscalexN - horizontal scaling ratio (default 1.0)
  scaleY: number // \picscaleyN - vertical scaling ratio (default 1.0)
  cropTop: number // \piccroptN - pixels to crop from top
  cropBottom: number // \piccropbN - pixels to crop from bottom
  cropLeft: number // \piccroplN - pixels to crop from left
  cropRight: number // \piccroprN - pixels to crop from right
}

/** Raw text element */
export type RTFTextElement = { type: "text"; text: string }

/** Footnote or endnote element - \footnote and \chftn */
export type RTFFootnoteElement = {
  type: "footnote"
  customMark?: string // Custom mark like *, †, ‡, etc.
  endnote?: boolean // \ftnalt
  content: RTFParagraphElement // Content of the footnote
}

/** Picture element with image data and formatting - \pict */
export type RTFPictureElement = {
  type: "picture"
  picture: RTFPictureData
  formatting: Partial<RTFPictureFormatting>
}

/** Page break element - \page */
export type RTFPageBreakElement = { type: "pageBreak" }

/** Line break element - \line */
export type RTFLineBreakElement = { type: "lineBreak" }

/** Tab character element - \tab */
export type RTFTabElement = { type: "tab" }

/** Non-breaking space element - \~ */
export type RTFNonBreakingSpaceElement = { type: "nonBreakingSpace" }

/** Non-breaking hyphen element - \_ */
export type RTFNonBreakingHyphenElement = { type: "nonBreakingHyphen" }

/** Optional hyphen element - \- */
export type RTFOptionalHyphenElement = { type: "optionalHyphen" }

/** Page number element - \chpgn */
export type RTFPageNumberElement = { type: "pageNumber" }

/** Date or time element - \chdate, \chtime */
export type RTFDateTimeElement = { type: "dateTime"; field: "date" | "time" }

/** Character-level flags: \super \sub \scaps \caps \v \noproof */
export type RTFCharacterFlag = "superscript" | "subscript" | "smallCaps" | "allCaps" | "hidden" | "noProof"

/** Inline content elements - Union of all possible text elements */
export type RTFCharacterContentElement =
  | RTFTextElement
  | RTFFootnoteElement
  | RTFPictureElement
  | RTFPageBreakElement
  | RTFLineBreakElement
  | RTFTabElement
  | RTFNonBreakingSpaceElement
  | RTFNonBreakingHyphenElement
  | RTFOptionalHyphenElement
  | RTFPageNumberElement
  | RTFDateTimeElement

/** Character-level formatting properties */
export type RTFCharacterFormatting = {
  styleAlias: string // \csN - Reference to character style by alias
  language: number // \langN - Language ID (e.g., 1033 for US English)

  // Font styles & decorations
  fontAlias: string // \fN - Reference to font by alias
  fontSize: RTFSize // \fsN - Font size in half-points (e.g., 24 = 12pt)
  kerning: RTFSize // \kerningN - Minimum font size for kerning in half-points (0=off)
  characterSpacing: RTFSize // \expndtwN - Character spacing (positive expands, negative compresses)
  horizontalScaling: number // \charscalexN - Character width scaling percentage (default 100)
  colorAlias: string // \cfN - Reference to text color by alias
  highlightColorAlias: string // \highlightN - Reference to highlight color by alias
  bold: boolean // \b
  italic: boolean // \i
  underline: boolean | "double" | "dotted" | "dash" | "wave" // \ul, \ulnone, \ulc, \uldb, \uld, \uldash, \ulw
  strikethrough: boolean | "double" // \strike or \striked - single or double strikethrough

  // Advanced text properties
  flags: RTFCharacterFlag[]
}

/** Hyperlink definition - supports external URLs, internal bookmarks, email, and file links */
export type RTFHyperlink = {
  // Hyperlink types
  type: "bookmark" | "external" | "email"
  tooltip?: string // \o

  // Target of the hyperlink
  bookmark?: string // For internal document navigation (\l "bookmark")
  url?: string // For http:// or https:// or file:/// links
  email?: {
    address: string
    subject?: string
    body?: string
  }
}

/** Character element with inline content and formatting */
export type RTFCharacterElement = {
  type: "character"
  formatting: Partial<RTFCharacterFormatting>
  bookmarkName?: string
  link?: RTFHyperlink
  content: RTFCharacterContentElement[]
} // Plain text with formatting

/** Paragraph flags: \keep \keepn \pagebb \noline \nosupersub \contextualspace \hyphpar \nowidctlpar */
export type RTFParagraphFlag =
  | "keepLines"
  | "keepNext"
  | "pageBreakBefore"
  | "noLineNumber"
  | "suppressLineNumbers"
  | "contextualSpacing"
  | "suppressHyphenation"
  | "noWidowControl"

/** Paragraph-level formatting properties */
export type RTFParagraphFormatting = {
  styleAlias: string // \sN - Reference to paragraph style by alias
  align: "left" | "center" | "right" | "justify" | "distribute" // \ql, \qc, \qr, \qj, \qd

  // Spacing & indentation
  lineSpacing: RTFSize // \slN
  lineSpacingRule: "single" | "onehalf" | "double" | "multiple" | "exact" | "atleast" // \slmultN
  firstLineIndent: RTFSize // \fiN
  leftIndent: RTFSize // \liN
  rightIndent: RTFSize // \riN
  spaceBefore: RTFSize // \sbN
  spaceAfter: RTFSize // \saN

  // Style & effects
  borders: Partial<RTFBorders> // \brdrt, \brdrl, \brdrb, \brdrr
  shading: Partial<RTFShading> // \shadingN, \chshdngN, \chcbpatN, \chcfpatN

  // Advanced paragraph properties
  flags: RTFParagraphFlag[]

  // List formatting (internal use only - set automatically when list item)
  listOverrideAlias: string // \lsN - Reference to list override by alias
  listItem: boolean // if true, this paragraph is a list item
  listLevel: number // \ilvl - List level (0-8)
  listText: string // \pntext - Actual list number/bullet text for this item
}

/** Paragraph element with inline text content and formatting */
export type RTFParagraphElement = { type: "paragraph"; formatting: Partial<RTFParagraphFormatting>; content: RTFCharacterElement[] } // \pard with formatting

// ============================================================================
// Tables
// ============================================================================

/** Complete table properties - use Partial<RTFTable> when optional */
export type RTFTableFormatting = {
  // Table type and alignment
  align: "left" | "center" | "right" // \trqc, \trql, \trqr - Table alignment
  nestedLevel: number // \itapN - Nesting level (0=document, 1=table, 2=nested, etc.)
  // tableCaption: string // \tblcaption - Table caption
  // tableDescription: string // \tbldescription - Table description

  // Table dimensions and sizing
  width: RTFSize // fixed table width
  leftIndent: RTFSize // \trleftN - row left position
  rightIndent: RTFSize // \trrightN - row right position

  // Table style
  cellSpacing: RTFSize // \trspdbN - space between cells
  cellFormatting: Partial<RTFTableCellFormatting>
}

/** Table column properties */
export type RTFTableColumn = {
  width: RTFSize // \cellxN - Cell width
  weight: number // for auto table layout - relative weight of this cell vs others
}

/** Table row flags: \trhdr \trkeep \trlastrow */
export type RTFTableRowFlag = "repeatHeader" | "keepTogether" | "lastRow"

/** Table row properties */
export type RTFTableRowFormatting = {
  // Row dimensions and sizing
  height: RTFSize // \trrhN - row height (negative for exact height)

  // Row style
  cellSpacing: RTFSize // \trspdbN - space between cells
  cellFormatting: Partial<RTFTableCellFormatting>

  // Advanced row properties
  flags: RTFTableRowFlag[]
}

/** Table row properties */
export type RTFTableRow = {
  formatting: Partial<RTFTableRowFormatting>
  cells: RTFTableCell[]
}

/** Table-level formatting properties */
export type RTFTableCellFormatting = {
  // Cell spans
  hspan: "none" | "first" | "next" // \clmgf, \clmrg - Cell merge (1=first in merge, 2+=merged)
  vspan: "none" | "first" | "next" // \clvmgf, \clvmrg - Vertical cell merge (1=first in merge, 2+=merged)

  // Content alignment
  valign: "top" | "center" | "bottom" // \clvertalt, \clvertalc, \clvertalb

  // Style & effects
  borders: Partial<RTFTableBorders> // \clbrdrt, \clbrdrl, \clbrdrb, \clbrdrr, \clbrdrh, \clbrdrv - Cell borders
  padding: Partial<RTFRect> // \clpadlN, \clpadtN, \clpadrN, \clpadbN - Cell padding
  shading: Partial<RTFShading> // \clshdngN, \chshdngN, \chcbpatN, \chcfpatN - Cell shading
  backgroundColorAlias: string // \clcbpatN - Cell background color
  foregroundColorAlias: string // \clcfpatN - Cell foreground color
}

/** Table row properties */
export type RTFTableCell = {
  formatting: Partial<RTFTableCellFormatting>
  content: RTFElement[]
}

/** Table element with rows and columns */
export type RTFTableElement = { type: "table"; formatting: Partial<RTFTableFormatting>; columns: Partial<RTFTableColumn>[]; rows: RTFTableRow[] } // \trowd with table definition

// ============================================================================
// Sections
// ============================================================================

/** Section-level settings */
export type RTFSectionFormatting = {
  styleAlias: string // \dsN - section style number
  sectionBreak: "none" | "column" | "nextPage" | "evenPage" | "oddPage" // \sbknone, \sbkpage, \sbkeven, \sbkodd - section break type
  pageWidth: RTFSize // \pgwsxnN
  pageHeight: RTFSize // \pghsxnN
  margin: Partial<RTFRect> // \marglsxN \margrsxn \margtsxn \margbsxn - section margins
  gutter: RTFSize // \guttersxn - gutter size
  landscape: boolean // \lndscpsxn - landscape orientation
  valign: "top" | "center" | "bottom" | "justified" // \vertalt, \vertalc, \vertalb, \vertalj

  // Header/footer distances
  titlePage: boolean // \titlepg - first page has special format
  marginMirror: boolean // \margmirsxn - mirror margins for facing pages
  headerDistance: RTFSize // \headeryN - header distance from top (default: 720)
  footerDistance: RTFSize // \footeryN - footer distance from bottom (default: 720)

  // Column layout
  columnCount: number // \colsN - number of columns (default: 1)
  columnSpacing: RTFSize // \colsxN - space between columns (default: 720 twips)
  lineBetweenColumns: boolean // \linebetcol - draw line between columns

  // Page numbering
  pageNumberPosition: { x: RTFSize; y: RTFSize } // \pgnxN, \pgnyN - position of page number
  pageNumberStart: number // \pgnstartsN - starting page number (default: 1)
  pageNumberRestart: boolean // \pgnrestart - restart numbering each section (vs \pgncont)
  pageNumberFormat: "decimal" | "upperRoman" | "lowerRoman" | "upperLetter" | "lowerLetter" // \pgndec, \pgnucrm, \pgnlcrm, \pgnucltr, \pgnlcltr
  endnotesHere: boolean // \endnhere - include endnotes in this section
  suppressEndnotes: boolean // \noendnotes - suppress endnotes in this section
}

/** Column break element */
export type RTFColumnBreakElement = { type: "columnBreak" } // \column

/** Container element for grouping other elements */
export type RTFContainerElement = { type: "container"; content: RTFElement[] }

/** Content element types - Union of all possible content */
export type RTFElement = RTFParagraphElement | RTFContainerElement | RTFTableElement

/** Complete section definition */
export type RTFSection = {
  // Section-level formatting
  formatting: Partial<RTFSectionFormatting>

  // Main content
  content: (RTFElement | RTFColumnBreakElement)[]

  // Headers
  header?: RTFElement[] // Default header
  evenHeader?: RTFElement[] // Even page header (optional)
  firstHeader?: RTFElement[] // First page header (optional)

  // Footers
  footer?: RTFElement[] // Default footer
  evenFooter?: RTFElement[] // Even page footer (optional)
  firstFooter?: RTFElement[] // First page header (optional)
}
