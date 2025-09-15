import { RTFCharacterElement, RTFCharacterFormatting } from "../types"
import { toHalfPoint, toTwip } from "../utils"

import {
  convertColorToHex,
  DRAWINGML_MAIN_NS,
  DRAWINGML_PICTURE_NS,
  OOXMLDocumentModel,
  RELATIONSHIP_TYPE_IMAGE,
  SectionGeometry,
  DRAWINGML_WORDPROCESSING_NS,
} from "./base"

function wrapHyperlink(model: OOXMLDocumentModel, element: RTFCharacterElement, children: JSX.IntrinsicElements[]): JSX.IntrinsicElements[] {
  switch (element.link?.type) {
    case "bookmark":
      return [<w:hyperlink w:anchor={model.bookmarkRegistry.get(element.link.bookmarkAlias).item}>{children}</w:hyperlink>]
    case "external":
      return [
        <w:hyperlink
          r:id={model.relationshipRegistry.register({
            type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
            target: element.link.url,
            targetMode: "External",
          })}
        >
          {children}
        </w:hyperlink>,
      ]
  }
  return children
}

/** Generate run from RTFCharacterElement */
export function generateCharacterElement(
  model: OOXMLDocumentModel,
  _geometry: SectionGeometry,
  baseFormatting: Partial<RTFCharacterFormatting>,
  element: RTFCharacterElement
): JSX.IntrinsicElements[] {
  const formattingChildren: JSX.IntrinsicElements[] = []
  let style = element.formatting.styleAlias !== undefined ? model.styleRegistry.get(element.formatting.styleAlias) : undefined
  let formatting = { ...baseFormatting, ...(style?.item?.characterFormatting || {}), ...element.formatting, styleAlias: undefined }

  while (style?.item?.baseStyleAlias !== undefined && style.item.baseStyleAlias !== style.name) {
    style = model.styleRegistry.get(style.item.baseStyleAlias)
    formatting = { ...(style.item.characterFormatting || {}), ...formatting, styleAlias: undefined }
  }
  if (element.formatting.styleAlias !== undefined) {
    formattingChildren.push(<w:rStyle w:val={element.formatting.styleAlias} />)
  }

  const flags = formatting.flags || []

  if (formatting.fontAlias !== undefined) {
    const fontEntry = model.fontRegistry.get(formatting.fontAlias)
    const fontName = fontEntry?.item.name || "Times New Roman"

    formattingChildren.push(<w:rFonts w:ascii={fontName} w:hAnsi={fontName} />)
  }
  if (formatting.bold) {
    formattingChildren.push(<w:b />)
  }
  if (formatting.italic) {
    formattingChildren.push(<w:i />)
  }
  if (flags.includes("allCaps")) {
    formattingChildren.push(<w:caps />)
  }
  if (flags.includes("smallCaps")) {
    formattingChildren.push(<w:smallCaps />)
  }
  if (formatting.strikethrough) {
    if (formatting.strikethrough === "double") {
      formattingChildren.push(<w:dstrike />)
    } else {
      formattingChildren.push(<w:strike />)
    }
  }
  if (flags.includes("noProof")) {
    formattingChildren.push(<w:noProof />)
  }
  if (flags.includes("hidden")) {
    formattingChildren.push(<w:vanish />)
  }
  if (formatting.colorAlias !== undefined) {
    formattingChildren.push(<w:color w:val={convertColorToHex(model.colorRegistry.get(formatting.colorAlias).item)} />)
  }
  if (formatting.characterSpacing !== undefined) {
    formattingChildren.push(<w:spacing w:val={toTwip(formatting.characterSpacing)} />)
  }
  if (formatting.horizontalScaling !== undefined) {
    formattingChildren.push(<w:w w:val={`${formatting.horizontalScaling * 100}%`} />)
  }
  if (formatting.kerning !== undefined) {
    formattingChildren.push(<w:kern w:val={toHalfPoint(formatting.kerning)} />)
  }
  if (formatting.fontSize !== undefined) {
    formattingChildren.push(<w:sz w:val={toHalfPoint(formatting.fontSize)} />)
    formattingChildren.push(<w:szCs w:val={toHalfPoint(formatting.fontSize)} />)
  }
  if (formatting.highlightColorAlias !== undefined) {
    formattingChildren.push(<w:shd w:val="clear" w:fill={convertColorToHex(model.colorRegistry.get(formatting.highlightColorAlias).item)} />)
  }
  if (formatting.underline) {
    const underlineVal = typeof formatting.underline === "string" ? formatting.underline : "single"

    formattingChildren.push(<w:u w:val={underlineVal} />)
  }
  if (flags.includes("subscript")) {
    formattingChildren.push(<w:vertAlign w:val="subscript" />)
  } else if (flags.includes("superscript")) {
    formattingChildren.push(<w:vertAlign w:val="superscript" />)
  }

  // Process content elements
  const children: JSX.IntrinsicElements[] = []
  let lastRun: JSX.IntrinsicElements[] = []
  const flushLastRun = () => {
    if (lastRun.length > 0) {
      children.push(
        <w:r>
          {formattingChildren.length > 0 && <w:rPr>{formattingChildren}</w:rPr>}
          {lastRun}
        </w:r>
      )
      lastRun = []
    }
  }

  for (const item of element.content) {
    switch (item.type) {
      case "text":
        lastRun.push(<w:t xml:space="preserve">{item.text}</w:t>)
        break
      case "footnote":
        if (item.endnote) {
          lastRun.push(<w:endnoteReference w:id={model.endnoteRegistry.registerAsIndex(item)} w:customMarkFollows={item.customMark !== undefined} />)
        } else {
          lastRun.push(<w:footnoteReference w:id={model.footnoteRegistry.registerAsIndex(item)} w:customMarkFollows={item.customMark !== undefined} />)
        }
        if (item.customMark !== undefined) {
          lastRun.push(<w:t>{item.customMark}</w:t>)
        }
        flushLastRun()
        break
      case "picture":
        const pictureId = model.relationshipRegistry.register({
          type: RELATIONSHIP_TYPE_IMAGE,
          target: `media/image${model.relationshipRegistry.size}${item.picture.format === "png" ? ".png" : item.picture.format === "jpeg" ? ".jpg" : ".dat"}`,
          data: item.picture.data,
        })

        lastRun.push(
          <w:drawing>
            <wp:inline xmlns:wp={DRAWINGML_WORDPROCESSING_NS} distT={0} distB={0} distL={0} distR={0}>
              <wp:extent cx={toTwip(item.formatting.displayWidth) * 635} cy={toTwip(item.formatting.displayHeight) * 635} />
              <wp:effectExtent l={0} t={0} r={0} b={0} />
              <wp:docPr id={1} name="Image" descr="" title="" />
              <a:graphic xmlns:a={DRAWINGML_MAIN_NS}>
                <a:graphicData uri={DRAWINGML_PICTURE_NS}>
                  <pic:pic xmlns:pic={DRAWINGML_PICTURE_NS}>
                    <pic:nvPicPr>
                      <pic:cNvPr id={1} name="Image" descr="" title="" />
                      <pic:cNvPicPr>
                        <a:picLocks noChangeAspect="1" noChangeArrowheads="1" />
                      </pic:cNvPicPr>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed={pictureId} />
                      <a:srcRect
                        l={`${item.formatting.cropLeft !== undefined && item.picture.width > 0 ? item.formatting.cropLeft / item.picture.width : 0}%`}
                        r={`${item.formatting.cropRight !== undefined && item.picture.width > 0 ? item.formatting.cropRight / item.picture.width : 0}%`}
                        t={`${item.formatting.cropTop !== undefined && item.picture.height > 0 ? item.formatting.cropTop / item.picture.height : 0}%`}
                        b={`${item.formatting.cropBottom !== undefined && item.picture.height > 0 ? item.formatting.cropBottom / item.picture.height : 0}%`}
                      />
                      <a:stretch>
                        <a:fillRect />
                      </a:stretch>
                    </pic:blipFill>
                    <pic:spPr bwMode="auto">
                      <a:xfrm>
                        <a:off x={0} y={0} />
                        <a:ext cx={toTwip(item.formatting.displayWidth) * 635} cy={toTwip(item.formatting.displayHeight) * 635} />
                      </a:xfrm>
                      <a:prstGeom prst="rect">
                        <a:avLst />
                      </a:prstGeom>
                      <a:noFill />
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        )
        break
      case "pageBreak":
        lastRun.push(<w:br w:type="page" />)
        break
      case "lineBreak":
        lastRun.push(<w:br />)
        break
      case "tab":
        lastRun.push(<w:tab />)
        break
      case "nonBreakingSpace":
        lastRun.push(<w:t xml:space="preserve">&#160;</w:t>)
        break
      case "nonBreakingHyphen":
        lastRun.push(<w:noBreakHyphen />)
        break
      case "optionalHyphen":
        lastRun.push(<w:softHyphen />)
        break
      case "pageNumber":
        flushLastRun()
        children.push(
          <w:fldSimple w:instr="PAGE">
            <w:r>
              <w:t>1</w:t>
            </w:r>
          </w:fldSimple>
        )
        break
      case "totalPages":
        flushLastRun()
        children.push(
          <w:fldSimple w:instr="NUMPAGES">
            <w:r>
              <w:t>1</w:t>
            </w:r>
          </w:fldSimple>
        )
        break
      case "date":
        flushLastRun()
        children.push(
          <w:fldSimple w:instr="DATE">
            <w:r>
              <w:t>{(item.value || new Date()).toDateString()}</w:t>
            </w:r>
          </w:fldSimple>
        )
        break
      case "time":
        flushLastRun()
        children.push(
          <w:fldSimple w:instr="TIME">
            <w:r>
              <w:t>{(item.value || new Date()).toDateString()}</w:t>
            </w:r>
          </w:fldSimple>
        )
        break
      default:
        throw new Error(`Unknown character content type: ${(item as any).type}`)
    }
  }
  flushLastRun()

  const run = wrapHyperlink(model, element, children)

  return element.bookmarkAlias !== undefined
    ? [
        <w:bookmarkStart w:id={model.bookmarkRegistry.index(element.bookmarkAlias)} w:name={model.bookmarkRegistry.get(element.bookmarkAlias).item} />,
        ...run,
        <w:bookmarkEnd w:id={model.bookmarkRegistry.index(element.bookmarkAlias)} />,
      ]
    : run
}
