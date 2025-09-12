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

      // "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
      "w:document": {
        "xmlns:w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        "xmlns:r"?: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
        children?: any
      }
      "w:body": { children?: any }
      "w:p": { children?: any }
      "w:pPr": { children?: any }
      "w:r": { children?: any }
      "w:rPr": { children?: any }
      "w:t": { "xml:space"?: string; children?: any }
      "w:jc": { "w:val"?: string }
      "w:spacing": { "w:before"?: string; "w:after"?: string; "w:line"?: string; "w:lineRule"?: string }
      "w:ind": { "w:left"?: string; "w:right"?: string; "w:firstLine"?: string }
      "w:pageBreakBefore": {}
      "w:b": {}
      "w:i": {}
      "w:u": { "w:val"?: string }
      "w:color": { "w:val"?: string }
      "w:sz": { "w:val"?: string }
      "w:szCs": { "w:val"?: string }
      "w:rFonts": { "w:ascii"?: string; "w:hAnsi"?: string }
      "w:br": { "w:type"?: string }
      "w:tab": {}
      "w:sectPr": { children?: any }
      "w:pgSz": { "w:w"?: string; "w:h"?: string }
      "w:pgMar": { "w:top"?: string; "w:right"?: string; "w:bottom"?: string; "w:left"?: string; "w:header"?: string; "w:footer"?: string; "w:gutter"?: string }

      // Tables
      "w:tbl": { children?: any }
      "w:tblPr": { children?: any }
      "w:tr": { children?: any }
      "w:tc": { children?: any }
      "w:tcPr": { children?: any }
      "w:tblW": { "w:type"?: string; "w:w"?: string }
      "w:tcW": { "w:type"?: string; "w:w"?: string }
      "w:gridSpan": { "w:val"?: string }
      "w:vMerge": { "w:val"?: string }
      "w:hMerge": { "w:val"?: string }
      "w:tblGrid": { children?: any }
      "w:gridCol": { "w:w"?: string }
      "w:trPr": { children?: any }
      "w:trHeight": { "w:val"?: string; "w:hRule"?: string }

      // Styles
      "w:styles": { "xmlns:w"?: string; children?: any }
      "w:style": { "w:type"?: string; "w:styleId"?: string; children?: any }
      "w:name": { "w:val"?: string }
      "w:qFormat": {}

      // Settings
      "w:settings": { "xmlns:w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"; children?: any }
      "w:zoom": { "w:percent": string }
      "w:view": { "w:val": string }
      "w:zoomPercent": { "w:val": string }
      "w:defaultTabStop": { "w:val": string }
      "w:noWidowControl": {}
      "w:autoHyphenation": { "w:val": string }
      "w:consecutiveHyphenLimit": { "w:val": string }
      "w:hyphenationZone": { "w:val": string }
      "w:contextualSpacing": { "w:val": string }
      "w:doNotHyphenateCaps": { "w:val": string }
      "w:compat": { children?: any }
      "w:compatSetting": { "w:name": string; "w:uri": string; "w:val": string }

      // Font table
      "w:fonts": {
        "xmlns:w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        "xmlns:r"?: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
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
