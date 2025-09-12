# Graphics & Media

This section covers OOXML graphics and media integration including images, shapes, charts, and drawing objects.

## Overview

OOXML graphics support in RTFBuilder focuses on:

- **Images** - Embedded picture files in various formats
- **Basic positioning** - Inline and simple floating images

Graphics in OOXML use the **English Metric Unit (EMU)** where 1 inch = 914400 EMUs.

## Image Embedding

### Basic Image Structure

```xml
<w:p>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="3048000" cy="2286000"/>  <!-- 3.33" x 2.5" -->
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="1" name="Picture 1"/>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic>
              <pic:nvPicPr>
                <pic:cNvPr id="0" name="image1.png"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="rId4"/>
                <a:stretch>
                  <a:fillRect/>
                </a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm>
                  <a:off x="0" y="0"/>
                  <a:ext cx="3048000" cy="2286000"/>
                </a:xfrm>
                <a:prstGeom prst="rect"/>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
```

### Image Relationship

Add to `word/_rels/document.xml.rels`:

```xml
<Relationship Id="rId4" 
              Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" 
              Target="media/image1.png"/>
```

### Supported Image Formats

- **PNG** - `image/png`
- **JPEG** - `image/jpeg`  
- **GIF** - `image/gif`
- **BMP** - `image/bmp`
- **TIFF** - `image/tiff`
- **WMF** - `image/x-wmf`
- **EMF** - `image/x-emf`

### Floating Images

```xml
<w:p>
  <w:r>
    <w:drawing>
      <wp:anchor distT="0" distB="0" distL="114300" distR="114300" 
                 relativeHeight="251658240" behindDoc="0" locked="0" 
                 layoutInCell="1" allowOverlap="1">
        <wp:simplePos x="0" y="0"/>
        <wp:positionH relativeFrom="column">
          <wp:posOffset>1905000</wp:posOffset>
        </wp:positionH>
        <wp:positionV relativeFrom="paragraph">
          <wp:posOffset>635000</wp:posOffset>
        </wp:positionV>
        <wp:extent cx="2286000" cy="1714500"/>
        <wp:wrapSquare wrapText="bothSides"/>
        <!-- Graphic content same as inline -->
      </wp:anchor>
    </w:drawing>
  </w:r>
</w:p>
```


## Text Wrapping

### Wrapping Types

**Square wrapping:**
```xml
<wp:wrapSquare wrapText="bothSides" distT="0" distB="0" distL="114300" distR="114300"/>
```

**Tight wrapping:**
```xml
<wp:wrapTight wrapText="bothSides" distL="114300" distR="114300">
  <wp:wrapPolygon edited="0">
    <wp:start x="0" y="0"/>
    <wp:lineTo x="21600" y="0"/>
    <wp:lineTo x="21600" y="21600"/>
    <wp:lineTo x="0" y="21600"/>
    <wp:lineTo x="0" y="0"/>
  </wp:wrapPolygon>
</wp:wrapTight>
```

**Through wrapping:**
```xml
<wp:wrapThrough wrapText="bothSides" distL="114300" distR="114300">
  <wp:wrapPolygon edited="0">
    <!-- Polygon points -->
  </wp:wrapPolygon>
</wp:wrapThrough>
```

**Top and bottom:**
```xml
<wp:wrapTopAndBottom distT="114300" distB="114300"/>
```

**Behind/In front of text:**
```xml
<wp:wrapNone/>
<!-- Set behindDoc="1" for behind text, behindDoc="0" for in front -->
```


## Implementation Guidelines

### Image Management:

1. **File organization**: Store images in `word/media/` directory
2. **Relationship management**: Create proper image relationships
3. **Size optimization**: Consider image compression and dimensions
4. **Format selection**: Use appropriate formats for content type
5. **Alt text**: Provide alternative text for accessibility

### Drawing Performance:

1. **EMU calculations**: Convert measurements accurately to EMUs
2. **Anchor vs inline**: Use inline for simple placement, anchor for complex positioning
3. **Text wrapping**: Choose appropriate wrapping for layout needs
4. **Layer management**: Control drawing object layering carefully

### Cross-Platform Compatibility:

1. **Format support**: Test image formats across different applications
2. **Performance impact**: Consider document size with embedded images
3. **Print compatibility**: Ensure images render correctly when printed