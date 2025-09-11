# Media & Graphics

This section covers RTF support for media and graphics content, including pictures and shapes.

## Overview

RTF provides comprehensive support for multimedia content through three main mechanisms:

- **Pictures** - Embedded raster and vector images in various formats
- **Shapes** - Vector graphics and geometric objects

All media content is stored as binary data within RTF files, either in hexadecimal format (default) or raw binary format using the `\binN` control word.

---

## Pictures

Pictures in RTF are destinations that begin with the `\pict` control word and support multiple image formats including metafiles, bitmaps, JPEG, and PNG.

### Basic Picture Syntax

```rtf
{\pict <picture-data>}
```

### Complete Picture Structure

```
<pictdata> = (<brdr>? & <shading>? & <picttype> & <pictsize> & <metafileinfo>?) <data>
<data> = (\binN #BDATA) | #SDATA
```

### Supported Picture Formats

| Control Word   | Format | Description                                         |
| -------------- | ------ | --------------------------------------------------- |
| `\emfblip`     | EMF    | Enhanced Metafile (recommended for vector graphics) |
| `\pngblip`     | PNG    | Portable Network Graphics                           |
| `\jpegblip`    | JPEG   | JPEG compressed images                              |
| `\macpict`     | PICT   | QuickDraw picture (Macintosh)                       |
| `\wmetafileN`  | WMF    | Windows Metafile (N = mapping mode, default 1)      |
| `\pmmetafileN` | OS/2   | OS/2 Metafile (N = metafile type)                   |
| `\dibitmapN`   | DIB    | Device-Independent Bitmap (N must equal 0)          |
| `\wbitmapN`    | DDB    | Device-Dependent Bitmap (N must equal 0)            |

### Picture Sizing and Scaling

Pictures require both original dimensions and desired display dimensions:

#### Original Dimensions

| Control Word | Description                                |
| ------------ | ------------------------------------------ |
| `\picwN`     | Original width (metafile units or pixels)  |
| `\pichN`     | Original height (metafile units or pixels) |

#### Display Dimensions

| Control Word  | Description                                 |
| ------------- | ------------------------------------------- |
| `\picwgoalN`  | Desired display width in twips              |
| `\pichgoalN`  | Desired display height in twips             |
| `\picscalexN` | Horizontal scaling percentage (default 100) |
| `\picscaleyN` | Vertical scaling percentage (default 100)   |
| `\picscaled`  | Scale to fit frame (macpict only)           |

### Picture Cropping

Crop values are specified in twips and applied before scaling:

| Control Word | Description           |
| ------------ | --------------------- |
| `\piccroptN` | Crop from top edge    |
| `\piccropbN` | Crop from bottom edge |
| `\piccroplN` | Crop from left edge   |
| `\piccroprN` | Crop from right edge  |

### Binary Data Formats

Pictures can be stored in two formats:

1. **Hexadecimal** (default): Image data as hex string (two hex digits per byte)
2. **Binary**: Raw binary data preceded by `\binN` where N = byte count (32-bit parameter)

```rtf
// Hexadecimal format
{\pict\emfblip\picw2540\pich1440\picwgoal1440\pichgoal810
01000900000000002c020000...} // hex data continues

// Binary format
{\pict\emfblip\picw2540\pich1440\picwgoal1440\pichgoal810
\bin1024 ...} // followed by exactly 1024 bytes of binary data
```

**Important Notes:**

- Hexadecimal data must have even number of hex digits
- Binary format requires exact byte count specified in `\binN`
- Space after `\binN` is consumed as delimiter, not part of data
- For `\binN`, N can be a 32-bit value (unlike most RTF parameters which are 16-bit)

### Bitmap-Specific Properties

For bitmap images, additional properties specify color information:

| Control Word      | Description                          |
| ----------------- | ------------------------------------ |
| `\wbmbitspixelN`  | Bits per pixel (1, 4, 8, 24)         |
| `\wbmplanesN`     | Color planes (must equal 1)          |
| `\wbmwidthbytesN` | Bytes per raster line (must be even) |
| `\picbmp`         | Indicates metafile contains bitmap   |
| `\picbppN`        | Bits per pixel in metafile bitmap    |

### Picture Identification and Metadata

Pictures can include metadata for identification and management:

| Control Word | Description                                  |
| ------------ | -------------------------------------------- |
| `\blipupiN`  | Units per inch on the picture                |
| `\blipuid`   | 16-byte unique identifier (destination)      |
| `\bliptagN`  | 32-bit signed integer tag for identification |

**Metafile-Specific Properties:**

| Control Word | Description                            |
| ------------ | -------------------------------------- |
| `\picbmp`    | Picture is a bitmap stored in metafile |
| `\picbppN`   | Bits per pixel (1, 4, 8, or 24)        |

**Picture Borders and Shading:**
Pictures can have borders and shading applied using the same control words as paragraphs:

- Border control words: `\brdrt`, `\brdrb`, `\brdrl`, `\brdrr`
- Shading control words: `\shading`, `\cfpat`, `\cbpat`

### Complete Picture Example

```rtf
{\pict\emfblip\picw2540\pich1440\picwgoal1440\pichgoal810
\picscalex100\picscaley100\piccropl0\piccropt0\piccropr0\piccropb0
\bin1024
...binary image data follows...
}
```

---

## Shapes

Shapes using the `\shp` destination provide rich vector graphics capabilities.

#### Basic Shape Syntax

```rtf
{\shp <shape-info> <shape-instructions> <shape-result>}
```

#### Shape Positioning

Shapes can be positioned absolutely or relative to document elements:

| Control Word  | Description                         |
| ------------- | ----------------------------------- |
| `\shpleftN`   | Distance from left anchor (twips)   |
| `\shptopN`    | Distance from top anchor (twips)    |
| `\shprightN`  | Distance from right anchor (twips)  |
| `\shpbottomN` | Distance from bottom anchor (twips) |
| `\shplidN`    | Unique shape identifier             |
| `\shpzN`      | Z-order (0 = furthest back)         |

#### Positioning Anchors

**Horizontal Positioning:**

- `\shpbxpage` - Relative to page
- `\shpbxmargin` - Relative to margin
- `\shpbxcolumn` - Relative to column
- `\shpbxignore` - Use shape properties instead

**Vertical Positioning:**

- `\shpbypage` - Relative to page
- `\shpbymargin` - Relative to margin
- `\shpbypara` - Relative to paragraph
- `\shpbyignore` - Use shape properties instead

#### Text Wrapping

Control how text flows around shapes:

| Control Word | Value | Behavior             |
| ------------ | ----- | -------------------- |
| `\shpwrN`    | 1     | Top and bottom only  |
|              | 2     | Around shape outline |
|              | 3     | None (no wrapping)   |
|              | 4     | Tight around shape   |
|              | 5     | Through shape        |

| Control Word | Value | Side            |
| ------------ | ----- | --------------- |
| `\shpwrkN`   | 0     | Both sides      |
|              | 1     | Left side only  |
|              | 2     | Right side only |
|              | 3     | Largest side    |

#### Shape Properties

All shape properties follow this format:

```rtf
{\sp{\sn PropertyName}{\sv PropertyValue}}
```

**Common Shape Properties:**

**Geometry Properties:**

- `shapeType` - Type of shape (1=rectangle, 2=ellipse, 20=line, etc.)
- `fFlipH` - Horizontal flip (0 or 1)
- `fFlipV` - Vertical flip (0 or 1)
- `rotation` - Rotation angle (degrees \* 65536)

**Fill Properties:**

- `fFilled` - Shape has fill (0 or 1)
- `fillColor` - Fill color (RGB value or theme color index)
- `fillOpacity` - Fill opacity (0-65536, where 65536 = 100%)
- `fillType` - Fill type (0=solid, 1=pattern, etc.)

**Line Properties:**

- `fLine` - Shape has line/border (0 or 1)
- `lineColor` - Line color (RGB value)
- `lineWidth` - Line width in EMUs (1 point = 12700 EMUs)
- `lineDashing` - Line dash style
- `lineStartArrowhead` - Start arrow type
- `lineEndArrowhead` - End arrow type

**Position Properties (used when positioning anchors are ignored):**

- `posh` - Horizontal position
- `posrelh` - Horizontal position relative to
- `posv` - Vertical position
- `posrelv` - Vertical position relative to

#### Shape Text Content

Shapes can contain text using the `\shptxt` destination:

```rtf
{\shptxt This text appears inside the shape}
```

#### Complete Shape Example

```rtf
{\shp\shpleft1440\shptop1440\shpright2880\shpbottom2160\shpz1
{\*\shpinst
{\sp{\sn shapeType}{\sv 1}}
{\sp{\sn fFilled}{\sv 1}}
{\sp{\sn fillColor}{\sv 16711680}}
{\sp{\sn fLine}{\sv 1}}
{\sp{\sn lineColor}{\sv 0}}
{\sp{\sn lineWidth}{\sv 9525}}
}
{\shptxt{\pard\qc Rectangle text content\par}}
{\shprslt Rectangle with red fill and black border}}
```

## Implementation Notes

### Picture Format Compatibility

- **EMF/WMF**: Widely supported, recommended for vector graphics
- **PNG/JPEG**: Newer formats, may not be supported by older RTF readers
- **Bitmap formats**: Always supported but generate large files
- **MacPict**: Only supported on Macintosh systems

### Shape Compatibility

- **Shapes**: Rich features but require modern RTF readers
- **Mixed approach**: Use both with `\shprslt` for fallback

### Memory Considerations

- Binary format is more efficient than hexadecimal for large images
- Cropping reduces processing overhead compared to scaling

## Best Practices

### For Pictures:

1. Always specify both original (`\picw`, `\pich`) and goal dimensions (`\picwgoal`, `\pichgoal`)
2. Use EMF for vector graphics, JPEG for photographs
3. Include binary size with `\binN` for binary data - ensure exact byte count
4. Apply cropping before scaling calculations for better performance

### For Shapes:

1. Always include `\shprslt` with fallback content for compatibility
2. Use consistent Z-order values (`\shpz`) for proper layering
3. Specify positioning anchors explicitly rather than relying on defaults
4. Include shape text using `\shptxt` destination when needed
