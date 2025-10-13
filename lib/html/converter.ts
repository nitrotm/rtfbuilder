import { SectionBuilder } from "../builder/section"
import { RichTextDocumentBuilder } from "../builder"
import { ListItemBuilder } from "../builder/list"
import { ParagraphBuilder } from "../builder/paragraph"
import { TableBuilder, TableRowBuilder } from "../builder/table"
import { RTFCharacterFormatting } from "../types"
import { createPictureDataFromImage, pt } from "../utils"

// paragraph styles
export const HTML_STYLE_H1 = "heading 1"
export const HTML_STYLE_H2 = "heading 2"
export const HTML_STYLE_H3 = "heading 3"
export const HTML_STYLE_H4 = "heading 4"
export const HTML_STYLE_H5 = "heading 5"
export const HTML_STYLE_H6 = "heading 6"
export const HTML_STYLE_NORMAL = "normal"
export const HTML_STYLE_CODE = "code"
export const HTML_STYLE_QUOTE = "quote"
export const HTML_STYLE_LIST = "list"
export const HTML_STYLE_TABLE = "table"
export const HTML_STYLE_COMMENT = "comment"

// character styles
export const HTML_STYLE_HYPERLINK = "hyperlink"

// dom node types
const ELEMENT_NODE = 1
const TEXT_NODE = 3

export async function createBuilderFromSimpleHtml(source: Document): Promise<RichTextDocumentBuilder> {
  const body = source.getElementsByTagName("body").item(0)
  const builder = new RichTextDocumentBuilder()
  const section = builder.newSection()

  builder.withColor("hyperlink", { red: 0, green: 0, blue: 255 })
  builder.withStyle(HTML_STYLE_H1, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(24), spaceAfter: pt(12) },
    characterFormatting: { fontSize: pt(24), bold: true },
  })
  builder.withStyle(HTML_STYLE_H2, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(20), spaceAfter: pt(12) },
    characterFormatting: { fontSize: pt(20), bold: true },
  })
  builder.withStyle(HTML_STYLE_H3, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(16), spaceAfter: pt(12) },
    characterFormatting: { fontSize: pt(16), bold: true },
  })
  builder.withStyle(HTML_STYLE_H4, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(14), spaceAfter: pt(12) },
    characterFormatting: { fontSize: pt(14), bold: true },
  })
  builder.withStyle(HTML_STYLE_H5, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(13), spaceAfter: pt(12) },
    characterFormatting: { fontSize: pt(13), bold: true },
  })
  builder.withStyle(HTML_STYLE_H6, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(12), spaceAfter: pt(12) },
    characterFormatting: { fontSize: pt(12), bold: true },
  })
  builder.withStyle(HTML_STYLE_NORMAL, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(12), spaceAfter: pt(12) },
    characterFormatting: { fontAlias: "default", fontSize: pt(12) },
  })
  builder.withStyle(HTML_STYLE_CODE, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(12), spaceAfter: pt(12), leftIndent: pt(12), borders: { left: { style: "single", width: pt(1) } } },
    characterFormatting: { fontSize: pt(10) },
  })
  builder.withStyle(HTML_STYLE_QUOTE, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(12), spaceAfter: pt(12), leftIndent: pt(12), borders: { left: { style: "single", width: pt(2) } } },
    characterFormatting: { italic: true },
  })
  builder.withStyle(HTML_STYLE_LIST, {
    type: "paragraph",
    paragraphFormatting: { spaceBefore: pt(6), spaceAfter: pt(6) },
  })
  builder.withStyle(HTML_STYLE_TABLE, {
    type: "paragraph",
  })
  builder.withStyle(HTML_STYLE_COMMENT, {
    type: "character",
    characterFormatting: { fontSize: pt(9) },
  })
  builder.withStyle(HTML_STYLE_HYPERLINK, {
    type: "character",
    characterFormatting: { colorAlias: "hyperlink", underline: true },
  })
  if (body) {
    for (const child of iterator(body.childNodes)) {
      await visitRootNode(child, section)
    }
  }
  return builder
}

async function visitRootNode(node: ChildNode, section: SectionBuilder) {
  if (node.nodeType === ELEMENT_NODE) {
    switch (node.nodeName.toLowerCase()) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        await visitParagraphElement(
          node,
          section.body.newParagraph().with({ styleAlias: `heading${parseInt(node.nodeName.substring(1))}` }),
          {},
          { trimBefore: true, trimAfter: true }
        )
        break
      case "p":
      case "a":
      case "span":
        await visitParagraphElement(node, section.body.newParagraph().with({ styleAlias: HTML_STYLE_NORMAL }), {}, { trimBefore: true, trimAfter: true })
        break
      case "pre":
        await visitParagraphElement(node, section.body.newParagraph().with({ styleAlias: HTML_STYLE_CODE }), {}, { trimBefore: true, trimAfter: true })
        break
      case "blockquote":
        await visitParagraphElement(node, section.body.newParagraph().with({ styleAlias: HTML_STYLE_QUOTE }), {}, { trimBefore: true, trimAfter: true })
        break
      case "ul":
      case "ol":
        const list = section.body.newList().level(0, { format: node.nodeName.toLowerCase() === "ul" ? "bullet" : "decimal" })

        for (const itemEl of iterator(node.childNodes)) {
          if (itemEl.nodeType !== ELEMENT_NODE || itemEl.nodeName.toLowerCase() !== "li") {
            continue
          }
          await visitListItemElement(itemEl as HTMLLIElement, list.newItem())
        }
        break
      case "table":
        await visitTableElement(node as HTMLTableElement, section.body.newTable())
        break
      case "hr":
        section.body.withParagraph((p) =>
          p.with({ spaceBefore: pt(16), spaceAfter: pt(16), borders: { bottom: { style: "single", width: pt(1), colorAlias: "hr" } } })
        )
        break
      case "br":
        section.body.withText({ special: "lineBreak" })
        break
      case "cite":
        // ignore at top-level
        break
      default:
        for (const child of iterator(node.childNodes)) {
          await visitRootNode(child, section)
        }
        break
    }
  } else if (node.nodeType === TEXT_NODE) {
    await visitParagraphElement(node, section.body.lastParagraph, {}, { trimBefore: true, trimAfter: true })
  }
}

async function visitListItemElement(el: HTMLLIElement, item: ListItemBuilder) {
  const children = Array.from(el.childNodes)
  let trimBefore = true

  for (let i = 0; i < children.length; i++) {
    const childEl = children[i]

    if (childEl.nodeType === ELEMENT_NODE && ["ul", "ol"].includes(childEl.nodeName.toLowerCase())) {
      // note: currently only one style per level is supported
      item.list.level(item.level + 1, { format: childEl.nodeName.toLowerCase() === "ul" ? "bullet" : "decimal" })
      for (const itemEl of iterator(childEl.childNodes)) {
        if (itemEl.nodeType !== ELEMENT_NODE || itemEl.nodeName.toLowerCase() !== "li") {
          continue
        }
        await visitListItemElement(itemEl as HTMLLIElement, item.newItem())
      }
      trimBefore = true
      continue
    }

    await visitParagraphElement(
      childEl,
      item.lastParagraph,
      { styleAlias: HTML_STYLE_LIST },
      {
        trimBefore,
        trimAfter: i < children.length - 1 && (children[i + 1].nodeType !== ELEMENT_NODE || !["ul", "ol"].includes(children[i + 1].nodeName.toLowerCase())),
      }
    )
    trimBefore = false
  }
}

async function visitTableElement(el: HTMLTableElement | HTMLTableSectionElement, table: TableBuilder) {
  for (const childEl of iterator(el.childNodes)) {
    if (childEl.nodeType !== ELEMENT_NODE) {
      continue
    }
    switch (childEl.nodeName.toLowerCase()) {
      case "thead":
        for (const rowEl of iterator(childEl.childNodes)) {
          if (rowEl instanceof HTMLTableRowElement) {
            await visitTableRowElement(rowEl, table.newHeaderRow())
          }
        }
        break
      case "tbody":
      case "tfoot":
        if (childEl instanceof HTMLTableSectionElement) {
          await visitTableElement(childEl, table)
        }
        break
      case "tr":
        if (childEl instanceof HTMLTableRowElement) {
          visitTableRowElement(childEl, table.newRow())
        }
        break
      case "caption":
        // TODO:
        break
    }
  }
}

async function visitTableRowElement(el: HTMLTableRowElement, row: TableRowBuilder) {
  for (const childEl of iterator(el.childNodes)) {
    if (childEl.nodeType !== ELEMENT_NODE || !(childEl.nodeName.toLowerCase() === "th" || childEl.nodeName.toLowerCase() === "td")) {
      continue
    }
    await visitParagraphElement(childEl, row.newCell().newParagraph(), { styleAlias: HTML_STYLE_TABLE }, { trimBefore: true, trimAfter: true })
  }
}

async function visitParagraphElement(
  node: ChildNode,
  paragraph: ParagraphBuilder,
  formatting: Partial<RTFCharacterFormatting>,
  options: Partial<{
    bookmarkAlias: string
    externalUrl: string
    footnote: string
    trimBefore: boolean
    trimAfter: boolean
  }>
) {
  if (node.nodeType === ELEMENT_NODE) {
    const el = node as Element
    const childFormatting = { ...formatting }
    const childBookmarkAlias = el.getAttribute("id") || options.bookmarkAlias
    const childExternalUrl = el.nodeName.toLowerCase() === "a" ? el.getAttribute("href") || options.externalUrl : options.externalUrl
    let childParagraph = paragraph

    switch (el.nodeName.toLowerCase()) {
      case "br":
        paragraph.withText({ special: "lineBreak" })
        break
      case "b":
      case "strong":
        childFormatting.bold = true
        break
      case "i":
      case "em":
        childFormatting.italic = true
        break
      case "u":
        childFormatting.underline = true
        break
      case "s":
        childFormatting.strikethrough = true
        break
      case "sub":
        childFormatting.flags = (childFormatting.flags || []).concat("subscript").filter((flag) => flag !== "superscript")
        break
      case "sup":
        childFormatting.flags = (childFormatting.flags || []).concat("superscript").filter((flag) => flag !== "subscript")
        break
      case "a":
        childFormatting.styleAlias = "hyperlink"
        break
      case "img":
        if (node.nodeName.toLowerCase() === "img") {
          paragraph.withPicture(await createPictureDataFromImage(node as HTMLImageElement, "jpeg"))
        }
        break
      case "cite":
        childFormatting.styleAlias = HTML_STYLE_COMMENT
        childParagraph = paragraph.lastChunk.comment.paragraph.with({ styleAlias: HTML_STYLE_COMMENT })
        break
    }

    let i = 0

    for (const child of iterator(node.childNodes)) {
      await visitParagraphElement(child, childParagraph, childFormatting, {
        bookmarkAlias: childBookmarkAlias,
        externalUrl: childExternalUrl,
        trimBefore: options.trimBefore && i > 0,
        trimAfter: options.trimAfter && i < node.childNodes.length - 1,
      })
      i += 1
    }
  } else if (node.nodeType === TEXT_NODE) {
    const content = normalizeText(node.textContent || "", options.trimBefore, options.trimAfter)

    if (content.length === 0) {
      return
    }
    if (options.bookmarkAlias) {
      paragraph.newChunk().bookmark(options.bookmarkAlias)
    }
    if (options.externalUrl) {
      if (options.externalUrl.startsWith("#")) {
        paragraph.withBookmarkLink(options.externalUrl.substring(1), content, formatting)
      } else {
        paragraph.withExternalLink(options.externalUrl, content, formatting)
      }
    } else {
      paragraph.withText(formatting, content)
    }
  }
}

function normalizeText(text: string, trimBefore?: boolean, trimAfter?: boolean): string {
  let value = text.replace(/\s+/g, " ")

  if (trimBefore) {
    value = value.replace(/^\s+/, "")
  }
  if (trimAfter) {
    value = value.replace(/\s+$/, "")
  }
  return value
}

function* iterator<T>(source: { length: number; item(i: number): T }): Iterable<T> {
  let i = 0

  while (i < source.length) {
    yield source.item(i)
    i += 1
  }
}
