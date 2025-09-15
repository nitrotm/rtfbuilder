declare global {
  namespace JSX {
    interface IntrinsicElements {
      // "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
      "cp:coreProperties": {
        xmlns: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
        "xmlns:cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
        "xmlns:dc"?: "http://purl.org/dc/elements/1.1/"
        "xmlns:dcmitype"?: "http://purl.org/dc/dcmitype/"
        "xmlns:dcterms"?: "http://purl.org/dc/terms/"
        "xmlns:xsi"?: "http://www.w3.org/2001/XMLSchema-instance"
        children?: IntrinsicElements["dc:title"][]
      }
      "dc:creator": { children?: any }
      "dc:description": { children?: any }
      "dc:language": { children?: any }
      "dc:title": { children?: any }
      "dc:subject": { children?: any }
      "cp:keywords": { children?: any }
      "dcterms:created": { "xsi:type"?: string; children?: any }
      "dcterms:modified": { "xsi:type"?: string; children?: any }

      // "http://purl.oclc.org/ooxml/wordprocessingml/main"
      "w:document": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        "xmlns:r": "http://purl.oclc.org/ooxml/officeDocument/relationships" | "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        "xmlns:a"?: "http://purl.oclc.org/ooxml/drawingml/main"
        "xmlns:wp"?: "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing"
        "xmlns:pic"?: "http://purl.oclc.org/ooxml/drawingml/picture"
        children?: any
      }
      "w:hdr": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        "xmlns:r": "http://purl.oclc.org/ooxml/officeDocument/relationships" | "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        "xmlns:a"?: "http://purl.oclc.org/ooxml/drawingml/main"
        "xmlns:wp"?: "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing"
        "xmlns:pic"?: "http://purl.oclc.org/ooxml/drawingml/picture"
        children?: any
      }
      "w:ftr": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        "xmlns:r": "http://purl.oclc.org/ooxml/officeDocument/relationships" | "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        "xmlns:a"?: "http://purl.oclc.org/ooxml/drawingml/main"
        "xmlns:wp"?: "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing"
        "xmlns:pic"?: "http://purl.oclc.org/ooxml/drawingml/picture"
        children?: any
      }
      "w:b": {}
      "w:body": { children?: any }
      "w:bookmarkEnd": { "w:id": number }
      "w:bookmarkStart": { "w:id": number; "w:name": string }
      "w:bottom": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string } | { "w:type"?: string; "w:w"?: number }
      "w:br": { "w:type"?: string }
      "w:caps": { "w:val"?: boolean }
      "w:color": { "w:val"?: string }
      "w:cols": { "w:num"?: number; "w:sep"?: boolean; "w:space"?: number; "w:equalWidth"?: boolean }
      "w:contextualSpacing": { "w:val"?: boolean }
      "w:dstrike": { "w:val"?: boolean }
      "w:drawing": { children?: any }
      "w:end": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string } | { "w:type"?: string; "w:w"?: number }
      "w:endnoteReference": { "w:id": number; "w:customMarkFollows"?: boolean }
      "w:fldSimple": { "w:instr"?: string; children?: any }
      "w:footerReference": { "r:id": string; "w:type": string }
      "w:footnoteReference": { "w:id": number; "w:customMarkFollows"?: boolean }
      "w:gridCol": { "w:w"?: number }
      "w:gridSpan": { "w:val"?: number }
      "w:headerReference": { "r:id": string; "w:type": string }
      "w:highlight": { "w:val"?: string }
      "w:hMerge": { "w:val"?: string }
      "w:hyperlink": { "w:anchor"?: string; "r:id"?: string; children?: any }
      "w:i": {}
      "w:ilvl": { "w:val": number }
      "w:ind": { "w:start"?: number; "w:end"?: number; "w:firstLine"?: number; "w:hanging"?: number }
      "w:insideH": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string; "w:type"?: string; "w:w"?: number }
      "w:insideV": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string; "w:type"?: string; "w:w"?: number }
      "w:jc": { "w:val"?: string }
      "w:keepLines": { "w:val"?: boolean }
      "w:keepNext": { "w:val"?: boolean }
      "w:kern": { "w:val"?: number }
      "w:lang": { "w:val"?: string }
      "w:left": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string } | { "w:type"?: string; "w:w"?: number }
      "w:noBreakHyphen": {}
      "w:noProof": { "w:val"?: boolean }
      "w:numId": { "w:val": number }
      "w:numPr": { children?: any }
      "w:numRestart": { "w:val": string }
      "w:numStart": { "w:val": number }
      "w:p": { children?: any }
      "w:pageBreakBefore": {}
      "w:pBdr": { children?: any }
      "w:pgMar": { "w:top"?: number; "w:right"?: number; "w:bottom"?: number; "w:left"?: number; "w:header"?: number; "w:footer"?: number; "w:gutter"?: number }
      "w:pgNumType": { "w:fmt"?: string; "w:start"?: number }
      "w:pgSz": { "w:w"?: number; "w:h"?: number; "w:orient"?: string }
      "w:pos": { "w:val": ?string }
      "w:pPr": { children?: any }
      "w:pStyle": { "w:val": string }
      "w:r": { children?: any }
      "w:rFonts": { "w:ascii"?: string; "w:hAnsi"?: string; "w:cs"?: string; "w:eastAsia"?: string }
      "w:right": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string; "w:type"?: string; "w:w"?: number }
      "w:rPr": { children?: any }
      "w:rStyle": { "w:val": string }
      "w:sectPr": { children?: any }
      "w:shd": { "w:val": string; "w:color"?: string; "w:fill"?: string }
      "w:smallCaps": { "w:val"?: boolean }
      "w:softHyphen": {}
      "w:spacing": { "w:before"?: number; "w:after"?: number; "w:line"?: number; "w:lineRule"?: string } | { "w:val"?: number }
      "w:start": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string } | { "w:type"?: string; "w:w"?: number } | { "w:val"?: number }
      "w:strike": { "w:val"?: boolean }
      "w:suppressAutoHyphens": { "w:val"?: boolean }
      "w:suppressLineNumbers": { "w:val"?: boolean }
      "w:sz": { "w:val"?: number }
      "w:szCs": { "w:val"?: number }
      "w:t": { "xml:space"?: string; children?: any }
      "w:tab": {} | { "w:val": string; "w:pos": number }
      "w:tbl": { children?: any }
      "w:tblBorders": { children?: any }
      "w:tblCellMar": { children?: any }
      "w:tblCellSpacing": { "w:w": number; "w:type": string }
      "w:tblGrid": { children?: any }
      "w:tblHeader": { "w:val"?: boolean }
      "w:tblInd": { "w:w": number; "w:type": string }
      "w:tblLayout": { "w:type": string }
      "w:tblPr": { children?: any }
      "w:tblW": { "w:type"?: string; "w:w"?: number }
      "w:tc": { children?: any }
      "w:tcBorders": { children?: any }
      "w:tcMar": { children?: any }
      "w:tcPr": { children?: any }
      "w:tcW": { "w:type"?: string; "w:w"?: number }
      "w:titlePg": { "w:val"?: boolean }
      "w:top": { "w:val"?: string; "w:sz"?: number; "w:space"?: number; "w:color"?: string } | { "w:type"?: string; "w:w"?: number }
      "w:tr": { children?: any }
      "w:trHeight": { "w:val"?: number; "w:hRule"?: string }
      "w:trPr": { children?: any }
      "w:type": { "w:val"?: string }
      "w:u": { "w:val"?: string }
      "w:vAlign": { "w:val": string }
      "w:vanish": { "w:val"?: boolean }
      "w:vertAlign": { "w:val": string }
      "w:vMerge": { "w:val"?: string }
      "w:w": { "w:val"?: string | number }
      "w:widowControl": { "w:val"?: boolean }

      // Styles
      "w:styles": {
        "xmlns:w"?: "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        children?: any
      }
      "w:docDefaults": { children?: any }
      "w:rPrDefault": { children?: any }
      "w:pPrDefault": { children?: any }
      "w:style": { "w:type": string; "w:styleId": string; children?: any }
      "w:name": { "w:val": string }
      "w:basedOn": { "w:val": string }
      "w:next": { "w:val": string }
      "w:qFormat": {}

      // Settings
      "w:settings": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        children?: any
      }
      "w:view": { "w:val": string }
      "w:zoom": { "w:val": "none" | "fullPage" | "bestFit" | "textFit"; "w:percent": string }
      "w:defaultTabStop": { "w:val": number }
      "w:autoHyphenation": { "w:val"?: boolean }
      "w:consecutiveHyphenLimit": { "w:val": number }
      "w:evenAndOddHeaders": { "w:val"?: boolean }
      "w:hyphenationZone": { "w:val": number }
      "w:doNotHyphenateCaps": { "w:val"?: boolean }
      "w:mirrorMargins": { "w:val"?: boolean }
      "w:footnotePr": { children?: any }
      "w:endnotePr": { children?: any }
      "w:compat": { children?: any }
      "w:compatSetting": { "w:name": string; "w:uri": string; "w:val": string }

      // Font table
      "w:fonts": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        "xmlns:r"?: "http://purl.oclc.org/ooxml/officeDocument/relationships" | "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        children?: any
      }
      "w:font": { "w:name"?: string; children?: any }
      "w:family": { "w:val"?: string }
      "w:pitch": { "w:val"?: string }
      "w:altName": { "w:val"?: string }
      // "w:sig": { "w:usb"?: string; "w:usb1"?: string; "w:usb2"?: string; "w:usb3"?: string; "w:csb0"?: string; "w:csb1"?: string }

      // Numberings
      "w:numbering": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        "xmlns:r"?: "http://purl.oclc.org/ooxml/officeDocument/relationships" | "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        children?: any
      }
      "w:abstractNum": { "w:abstractNumId": number; children?: any }
      "w:lvl": { "w:ilvl": number; children?: any }
      "w:start": { "w:val": number }
      "w:numFmt": { "w:val": string }
      "w:lvlText": { "w:val": string }
      "w:lvlJc": { "w:val": string }
      "w:num": { "w:numId": number; children?: any }
      "w:abstractNumId": { "w:val": number }
      "w:tabs": { children?: any }

      // Footnotes / Endnotes
      "w:footnotes": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        children?: any
      }
      "w:footnote": { "w:id": number; "w:type"?: string; children?: any }
      "w:footnoteRef": {}
      "w:endnotes": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main" | "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        children?: any
      }
      "w:endnote": { "w:id": number; "w:type"?: string; children?: any }
      "w:endnoteRef": {}

      // "http://purl.oclc.org/ooxml/drawingml/main"
      "a:graphic": { "xmlns:a": "http://purl.oclc.org/ooxml/drawingml/main" | "http://schemas.openxmlformats.org/drawingml/2006/main"; children?: any }
      "a:graphicData": { uri: string; children?: any }
      "a:blip": { "r:embed"?: string }
      "a:srcRect": { l?: string; t?: string; r?: string; b?: string }
      "a:stretch": { children?: any }
      "a:fillRect": {}
      "a:picLocks": { noChangeAspect?: string; noChangeArrowheads?: string }
      "a:xfrm": { children?: any }
      "a:off": { x: number; y: number }
      "a:ext": { cx: number; cy: number }
      "a:prstGeom": { prst: string; children?: any }
      "a:avLst": {}
      "a:noFill": {}

      // "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing"
      "wp:inline": {
        "xmlns:wp": "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing" | "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
        distT?: number
        distB?: number
        distL?: number
        distR?: number
        children?: any
      }
      "wp:extent": { cx: number; cy: number }
      "wp:effectExtent": { l: number; t: number; r: number; b: number }
      "wp:docPr": { id: number; name: string; descr: string; title: string }

      // "http://purl.oclc.org/ooxml/drawingml/picture"
      "pic:pic": { "xmlns:pic": "http://purl.oclc.org/ooxml/drawingml/picture" | "http://schemas.openxmlformats.org/drawingml/2006/picture"; children?: any }
      "pic:nvPicPr": { children?: any }
      "pic:cNvPr": { id: number; name: string; descr: string; title: string }
      "pic:cNvPicPr": { children?: any }
      "pic:blipFill": { children?: any }
      "pic:spPr": { bwMode?: string; children?: any }
    }
  }
}

export {}
