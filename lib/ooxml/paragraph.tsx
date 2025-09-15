import { DEFAULT_PARAGRAPH_STYLE_ALIAS, DEFAULT_TAB_WIDTH } from "../document"
import { RTFCharacterFormatting, RTFParagraphElement, RTFParagraphFormatting } from "../types"
import { toTwip } from "../utils"

import { convertBorderProps, convertColorToHex, OOXMLDocumentModel, SectionGeometry } from "./base"
import { generateCharacterElement } from "./character"

/** Generate paragraph from RTFParagraphElement */
export function generateParagraph(model: OOXMLDocumentModel, geometry: SectionGeometry, element: RTFParagraphElement): JSX.IntrinsicElements {
  const formattingChildren: JSX.IntrinsicElements[] = []
  let style = model.styleRegistry.get(element.formatting.styleAlias || DEFAULT_PARAGRAPH_STYLE_ALIAS)
  let formatting = { ...(style.item.paragraphFormatting || {}), ...element.formatting, styleAlias: undefined }
  let characterFormatting: Partial<RTFCharacterFormatting> = { ...(style.item.characterFormatting || {}), styleAlias: undefined }

  while (style.item.baseStyleAlias !== undefined && style.item.baseStyleAlias !== style.name) {
    style = model.styleRegistry.get(style.item.baseStyleAlias)
    formatting = { ...(style.item.paragraphFormatting || {}), ...formatting, styleAlias: undefined }
    characterFormatting = { ...(style.item.characterFormatting || {}), ...characterFormatting, styleAlias: undefined }
  }
  formattingChildren.push(<w:pStyle w:val={element.formatting.styleAlias || DEFAULT_PARAGRAPH_STYLE_ALIAS} />)

  const flags = formatting.flags || []
  let firstLineIndent = formatting.firstLineIndent !== undefined ? toTwip(formatting.firstLineIndent) : undefined
  let leftIndent = formatting.leftIndent !== undefined ? toTwip(formatting.leftIndent) : undefined

  if (flags.includes("keepLines")) {
    formattingChildren.push(<w:keepLines />)
  }
  if (flags.includes("keepNext")) {
    formattingChildren.push(<w:keepNext />)
  }
  if (flags.includes("pageBreakBefore")) {
    formattingChildren.push(<w:pageBreakBefore />)
  }
  if (flags.includes("noWidowControl")) {
    formattingChildren.push(<w:widowControl w:val={false} />)
  }
  if (element.formatting.listAlias !== undefined) {
    const list = model.listRegistry.get(element.formatting.listAlias)
    const listLevel = formatting.listLevel || 0
    const levels = list.item.levels || []
    const level = listLevel < levels.length ? levels[listLevel] : undefined
    const tabWidth = toTwip(model.typography.tabWidth || DEFAULT_TAB_WIDTH)

    leftIndent = (leftIndent || 0) + toTwip(level?.leftIndent, tabWidth * (1 + listLevel / 2))
    if (formatting.listItem) {
      formattingChildren.push(
        <w:numPr>
          <w:ilvl w:val={element.formatting.listLevel || 0} />
          <w:numId w:val={list.index} />
        </w:numPr>
      )
      firstLineIndent = (firstLineIndent || 0) - toTwip(tabWidth / 2)
    } else {
      firstLineIndent = undefined
    }
  }
  if (flags.includes("suppressLineNumbers")) {
    formattingChildren.push(<w:suppressLineNumbers />)
  }

  if (formatting.borders !== undefined) {
    formattingChildren.push(
      <w:pBdr>
        {formatting.borders.top && <w:top {...convertBorderProps(model, formatting.borders.top)} />}
        {formatting.borders.left && <w:left {...convertBorderProps(model, formatting.borders.left)} />}
        {formatting.borders.bottom && <w:bottom {...convertBorderProps(model, formatting.borders.bottom)} />}
        {formatting.borders.right && <w:right {...convertBorderProps(model, formatting.borders.right)} />}
      </w:pBdr>
    )
  }

  if (formatting.backgroundColorAlias !== undefined) {
    formattingChildren.push(<w:shd w:val="clear" w:fill={convertColorToHex(model.colorRegistry.get(formatting.backgroundColorAlias).item)} />)
  }

  if (flags.includes("suppressHyphenation")) {
    formattingChildren.push(<w:suppressAutoHyphens />)
  }

  // Add spacing
  const spacingAttrs: Partial<Exclude<JSX.IntrinsicElements["w:spacing"], { "w:val"?: number }>> = {}

  if (formatting.spaceBefore !== undefined) {
    spacingAttrs["w:before"] = toTwip(formatting.spaceBefore)
  }
  if (formatting.spaceAfter !== undefined) {
    spacingAttrs["w:after"] = toTwip(formatting.spaceAfter)
  }
  if (formatting.lineSpacing !== undefined) {
    spacingAttrs["w:line"] = toTwip(formatting.lineSpacing)
    spacingAttrs["w:lineRule"] = formatting.lineSpacingRule || "exact"
  }
  if (Object.keys(spacingAttrs).length > 0) {
    formattingChildren.push(<w:spacing {...spacingAttrs} />)
  }

  // Add indentation
  const indAttrs: Partial<JSX.IntrinsicElements["w:ind"]> = {}

  if (leftIndent !== undefined) {
    indAttrs["w:start"] = leftIndent
  }
  if (firstLineIndent !== undefined) {
    if (firstLineIndent < 0) {
      indAttrs["w:hanging"] = Math.abs(firstLineIndent)
    } else {
      indAttrs["w:firstLine"] = firstLineIndent
    }
  }
  if (formatting.rightIndent !== undefined) {
    indAttrs["w:end"] = toTwip(formatting.rightIndent)
  }
  if (Object.keys(indAttrs).length > 0) {
    formattingChildren.push(<w:ind {...indAttrs} />)
  }
  if (flags.includes("contextualSpacing")) {
    formattingChildren.push(<w:contextualSpacing />)
  }

  // Add alignment
  if (formatting.align !== undefined) {
    const alignMap: Record<RTFParagraphFormatting["align"], string> = {
      left: "start",
      center: "center",
      right: "end",
      justify: "both",
      distribute: "distribute",
    }

    formattingChildren.push(<w:jc w:val={alignMap[formatting.align]} />)
  }

  // Process character elements
  const children: JSX.IntrinsicElements[] = []

  for (const child of element.content) {
    children.push(...generateCharacterElement(model, geometry, characterFormatting, child))
  }
  return (
    <w:p>
      {formattingChildren.length > 0 && <w:pPr>{formattingChildren}</w:pPr>}
      {formatting.footnoteMark && (
        <>
          {formatting.footnoteMark === true && (
            <w:r>{typeof formatting.footnoteMark === "string" ? <w:t>{formatting.footnoteMark}</w:t> : <w:footnoteRef />}</w:r>
          )}
          <w:r>
            <w:tab />
          </w:r>
        </>
      )}
      {children}
    </w:p>
  )
}
