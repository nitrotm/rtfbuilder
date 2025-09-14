declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Test element
      test: {}

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
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main"
        "xmlns:r"?: "http://purl.oclc.org/ooxml/officeDocument/relationships"
        children?: any
      }
      "w:body": { children?: any }
      "w:p": { children?: any }
      "w:pPr": { children?: any }
      "w:r": { children?: any }
      "w:rPr": { children?: any }
      "w:t": { "xml:space"?: string; children?: any }
      "w:jc": { "w:val"?: string }
      "w:spacing": { "w:before"?: number; "w:after"?: number; "w:line"?: number; "w:lineRule"?: string }
      "w:ind": { "w:start"?: number; "w:end"?: number; "w:firstLine"?: number; "w:hanging"?: number }
      "w:pageBreakBefore": {}
      "w:hyphen": {}
      "w:b": {}
      "w:i": {}
      "w:u": { "w:val"?: string }
      "w:color": { "w:val"?: string }
      "w:sz": { "w:val"?: number }
      "w:szCs": { "w:val"?: number }
      "w:rFonts": { "w:ascii"?: string; "w:hAnsi"?: string }
      "w:br": { "w:type"?: string }
      "w:tab": {}
      "w:sectPr": { children?: any }
      "w:pgSz": { "w:w"?: number; "w:h"?: number }
      "w:pgMar": { "w:top"?: number; "w:right"?: number; "w:bottom"?: number; "w:left"?: number; "w:header"?: number; "w:footer"?: number; "w:gutter"?: number }

      // Tables
      "w:tbl": { children?: any }
      "w:tblPr": { children?: any }
      "w:tr": { children?: any }
      "w:tc": { children?: any }
      "w:tcPr": { children?: any }
      "w:tblW": { "w:type"?: string; "w:w"?: number }
      "w:tcW": { "w:type"?: string; "w:w"?: number }
      "w:gridSpan": { "w:val"?: number }
      "w:vMerge": { "w:val"?: string }
      "w:hMerge": { "w:val"?: string }
      "w:tblGrid": { children?: any }
      "w:gridCol": { "w:w"?: number }
      "w:trPr": { children?: any }
      "w:trHeight": { "w:val"?: number; "w:hRule"?: string }

      // Styles
      "w:styles": { "xmlns:w"?: "http://purl.oclc.org/ooxml/wordprocessingml/main"; children?: any }
      "w:style": { "w:type"?: string; "w:styleId"?: string; children?: any }
      "w:name": { "w:val"?: string }
      "w:qFormat": {}

      // Settings
      "w:settings": { "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main"; children?: any }
      "w:view": { "w:val": string }
      "w:zoom": { "w:val": "none" | "fullPage" | "bestFit" | "textFit"; "w:percent": string }
      "w:defaultTabStop": { "w:val": number }
      "w:noWidowControl": {}
      "w:autoHyphenation": {}
      "w:consecutiveHyphenLimit": { "w:val": number }
      "w:hyphenationZone": { "w:val": number }
      "w:contextualSpacing": {}
      "w:doNotHyphenateCaps": {}
      "w:compat": { children?: any }
      "w:compatSetting": { "w:name": string; "w:uri": string; "w:val": string }

      // Font table
      "w:fonts": {
        "xmlns:w": "http://purl.oclc.org/ooxml/wordprocessingml/main"
        "xmlns:r"?: "http://purl.oclc.org/ooxml/officeDocument/relationships"
        children?: any
      }
      "w:font": { "w:name"?: string; children?: any }
      "w:family": { "w:val"?: string }
      "w:pitch": { "w:val"?: string }
      "w:altName": { "w:val"?: string }
      // "w:sig": { "w:usb"?: string; "w:usb1"?: string; "w:usb2"?: string; "w:usb3"?: string; "w:csb0"?: string; "w:csb1"?: string }
    }
  }
}

export {}
