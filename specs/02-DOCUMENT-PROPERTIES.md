# Document Properties & Setup

This section covers RTF document-level properties, page setup, font tables, color tables, and character encoding - essential for establishing the foundation of any RTF document.

## Overview

Document properties must be defined before they are referenced and should appear in the RTF header in the following order:

1. RTF version and character set
2. Default font and language settings
3. Font table
4. Color table
5. Style sheet (covered in Section 4)
6. Other document formatting properties

All measurements in RTF are specified in **twips** (1/20 of a point, 1/1440 of an inch).

## Document Formatting Properties

Document formatting control words specify document-wide attributes and must precede the first plain-text character in the document.

### General Document Settings

#### Tab and Hyphenation Settings

- `\deftabN` - Default tab width in twips (default: 720 = 0.5")
- `\hyphhotzN` - Hyphenation hot zone in twips (space at right margin for hyphenation)
- `\hyphconsecN` - Maximum consecutive lines ending in hyphen (0 = no limit)
- `\hyphcaps` - Enable hyphenation of capitalized words (toggle: `\hyphcaps1` on, `\hyphcaps0` off)
- `\hyphauto` - Enable automatic hyphenation (toggle: `\hyphauto1` on, `\hyphauto0` off)

#### Line and Page Settings

- `\linestartN` - Beginning line number (default: 1)
- `\pgnstartN` - Beginning page number (default: 1)
- `\widowctrl` - Enable widow and orphan control

#### Document Type and Behavior

- `\makebackup` - Backup copy made automatically on save
- `\defformat` - Document should be saved in RTF format
- `\doctemp` - Document is a template/boilerplate
- `\doctypeN` - Document type for AutoFormat (0-2)

#### Rendering Options

- `\horzdoc` - Horizontal text rendering
- `\vertdoc` - Vertical text rendering

### Example Document Setup

```rtf
{\rtf1\ansi\deff0
\deftab720\hyphauto1\widowctrl
{\fonttbl{\f0\froman Times New Roman;}}
\margl1440\margr1440\margt1440\margb1440
Hello World!\par}
```

## Page/Paper Properties

Page properties define the physical layout and dimensions of the document.

### Paper Dimensions

- `\paperwN` - Paper width in twips (default: 12,240 = 8.5")
- `\paperhN` - Paper height in twips (default: 15,840 = 11")
- `\pszN` - Windows paper size ID (1-41 = standard sizes, 42+ = custom)
- `\landscape` - Landscape orientation

### Margins

- `\marglN` - Left margin in twips (default: 1800 = 1.25")
- `\margrN` - Right margin in twips (default: 1800 = 1.25")
- `\margtN` - Top margin in twips (default: 1440 = 1")
- `\margbN` - Bottom margin in twips (default: 1440 = 1")

### Advanced Page Layout

- `\facingp` - Facing pages (enables odd/even headers and gutters)
- `\margmirror` - Mirror margins on left and right pages (use with `\facingp`)
- `\gutterN` - Gutter width in twips (default: 0)
- `\ogutterN` - Outside gutter width (legacy, default: 0)
- `\gutterprl` - Parallel gutter

### Special Printing Options

- `\twoonone` - Print two logical pages on one physical page

### Common Paper Sizes (twips)

| Size      | Width  | Height | `\psz` |
| --------- | ------ | ------ | ------ |
| Letter    | 12,240 | 15,840 | 1      |
| Legal     | 12,240 | 20,160 | 5      |
| A4        | 11,906 | 16,838 | 9      |
| A5        | 8,418  | 11,906 | 11     |
| Executive | 10,440 | 15,120 | 7      |
| Tabloid   | 15,840 | 24,480 | 3      |

### Example Page Setup

```rtf
{\rtf1\ansi
\paperw11906\paperh16838\psz9
\margl1134\margr1134\margt1134\margb1134
\landscape\facingp
Content here...\par}
```

## Font Table

The font table defines all fonts used in the document and must precede any font references.

### Font Table Syntax

```rtf
{\fonttbl
  {\f0\froman\fcharset0 Times New Roman;}
  {\f1\fswiss\fcharset0 Arial;}
  {\f2\fmodern\fcharset0 Courier New;}
}
```

### Font Definition Structure

```rtf
{\fN<font-family>\fcharsetN <font-name>;}
```

### Font Families

- `\fnil` - Unknown or default fonts (default)
- `\froman` - Roman, proportionally spaced serif (e.g., Times New Roman, Palatino)
- `\fswiss` - Swiss, proportionally spaced sans serif (e.g., Arial, Helvetica)
- `\fmodern` - Fixed-pitch serif and sans serif (e.g., Courier New, Pica)
- `\fscript` - Script fonts (e.g., Cursive)
- `\fdecor` - Decorative fonts (e.g., Old English, ITC Zapf Chancery)
- `\ftech` - Technical and symbol fonts (e.g., Symbol, Wingdings)

### Font Properties

- `\fcharsetN` - Character set of font:
  - 0=ANSI, 1=Default, 2=Symbol, 77=Mac
  - 177=Hebrew, 178=Arabic, 204=Cyrillic, 238=Eastern European
- `\fprqN` - Font pitch (0=default, 1=fixed, 2=variable)

### Alternative and Tagged Names

- `{\*\falt Alternative Name}` - Alternative font name if primary unavailable
- `{\*\fname Tagged Name}` - Non-tagged font name

### Font Embedding

```rtf
{\f0\froman Times New Roman;
  {\*\fontemb\fttruetype
    {\*\fontfile\cpg1252 times.ttf}
  }
}
```

### Complete Font Table Example

```rtf
{\fonttbl
  {\f0\froman\fcharset0\fprq2 Times New Roman;}
  {\f1\fswiss\fcharset0\fprq2 Arial;}
  {\f2\fmodern\fcharset0\fprq1 Courier New;}
  {\f3\fscript\fcharset0\fprq2 Brush Script MT;}
  {\f4\fdecor\fcharset2\fprq2 Symbol;}
}
```

## Color Table

The color table defines all colors used in the document and must precede any color references.

### Color Table Syntax

```rtf
{\colortbl;\red0\green0\blue0;\red255\green0\blue0;\red0\green255\blue0;}
```

### Color Definition Rules

1. **First entry empty**: Represented by lone semicolon after `\colortbl` - default/automatic color
   ```rtf
   {\colortbl;    <- Empty first entry (auto color)
   ```
2. **RGB values**: Each component 0-255 (8 bits)
3. **Semicolon terminated**: Each color definition ends with `;`

### Basic Color Control Words

- `\redN` - Red intensity (0-255)
- `\greenN` - Green intensity (0-255)
- `\blueN` - Blue intensity (0-255)

### Complete Color Table Example

```rtf
{\colortbl;
  \red0\green0\blue0;
  \red255\green0\blue0;
  \red0\green255\blue0;
  \red0\green0\blue255;
  \red255\green255\blue0;
  \red255\green0\blue255;
  \red0\green255\blue255;
  \red255\green255\blue255;
  \red128\green128\blue128;
}
```

## Character Set Mapping

Character set declaration specifies the encoding used for the document text.

### Character Set Control Words

- `\ansi` - ANSI (default, Windows-1252)
- `\mac` - Apple Macintosh
- `\pc` - IBM PC code page 437
- `\pca` - IBM PC code page 850 (PS/2)
- `\ansicpgN` - Specific ANSI code page (e.g., `\ansicpg1252`)

### Common Code Pages

| Code Page | Description                |
| --------- | -------------------------- |
| 437       | IBM PC (US)                |
| 850       | IBM PC (Multilingual)      |
| 1250      | Central European           |
| 1251      | Cyrillic                   |
| 1252      | Western European (default) |
| 1253      | Greek                      |
| 1254      | Turkish                    |
| 1255      | Hebrew                     |
| 1256      | Arabic                     |
| 1257      | Baltic                     |
| 1258      | Vietnamese                 |

### Unicode Support

- `\ucN` - Number of bytes following `\uN` for ANSI fallback
- `\uN` - Unicode character (N = code point)
- `\upr` - Unicode/ANSI destination pair

### Unicode Example

```rtf
{\rtf1\ansi\uc1
Unicode Euro: \u8364?
Unicode Copyright: \u169?
\par}
```

## Document Information Properties

Document information properties store metadata about the document.

### Info Group

```rtf
{\info
  {\title Document Title}
  {\subject Document Subject}
  {\author Author Name}
  {\manager Manager Name}
  {\company Company Name}
  {\category Category}
  {\keywords keyword1;keyword2}
  {\comment Document comments}
  {\creatim\yr2024\mo1\dy15\hr10\min30}
  {\revtim\yr2024\mo1\dy16\hr14\min45}
  {\version1}{\edmins60}
  {\nofpages1}{\nofwords100}{\nofchars500}
}
```

### Document Metadata Control Words

- `\title` - Document title
- `\subject` - Document subject
- `\author` - Document author
- `\manager` - Document manager
- `\company` - Company name
- `\category` - Document category
- `\keywords` - Document keywords (semicolon separated)
- `\comment` - Document comments
- `\creatim` - Creation time (followed by \yr, \mo, \dy, \hr, \min)
- `\printim` - Print time
- `\version` - Version number
- `\edmins` - Total editing time (minutes)
- `\nofpages` - Number of pages
- `\nofwords` - Number of words
- `\nofchars` - Number of characters

### View and Display Settings

- `\viewkindN` - View mode (0=none, 1=page layout, 2=outline, 3=master doc, 4=normal, 5=online)
- `\viewscaleN` - View zoom percentage
- `\generator` - Application that created the RTF document

### Protection Settings

- `\protlevelN` - Protection level
- `\readonlypassword` - Read-only password protection

## Default Properties

Default properties establish base formatting when explicit formatting is not specified.

### Default Font Settings

- `\deffN` - Default font number for ASCII text
- `\stshfbiN` - Default Complex Script font for styles

### Default Language Settings

- `\deflangN` - Default language ID for `\plain` text

### Default Character/Paragraph Properties

```rtf
{\*\defchp\fs24}                    // Default character properties
{\*\defpap\ql\li0\ri0\widctlpar}   // Default paragraph properties
```

### Language ID Examples

| Language     | ID   |
| ------------ | ---- |
| English (US) | 1033 |
| Spanish      | 1034 |
| French       | 1036 |
| German       | 1031 |
| Italian      | 1040 |

## Complete Document Setup Example

```rtf
{\rtf1\ansi\ansicpg1252\uc1\deff0\deflang1033
{\fonttbl
  {\f0\froman\fcharset0\fprq2 Times New Roman;}
  {\f1\fswiss\fcharset0\fprq2 Arial;}
  {\f2\fmodern\fcharset0\fprq1 Courier New;}
}
{\colortbl;\red0\green0\blue0;\red255\green0\blue0;\red0\green128\blue0;}
{\info
  {\title Sample RTF Document}
  {\author RTF Writer}
  {\creatim\yr2024\mo1\dy15\hr10\min30}
}
{\generator RTF Writer Library 1.0;}
\paperw12240\paperh15840\margl1440\margr1440\margt1440\margb1440
\deftab720\widowctrl\hyphauto1\viewkind1
\f0\fs24 This is a complete RTF document with proper setup.\par
}
```

## Implementation Guidelines

### For RTF Writers:

1. **Order matters**: Declare character set → fonts → colors → content (see [Section 1: RTF Header Structure](01-RTF-FUNDAMENTALS.md#rtf-header-structure))
2. **Required defaults**: Always specify `\deff` before text
3. **Measurement consistency**: Use twips for all measurements
4. **Font references**: Ensure font table contains all referenced fonts (see [Section 3: Character Formatting](03-DOCUMENT-ELEMENTS.md#character-formatting))
5. **Color references**: Ensure color table contains all referenced colors (see [Section 3: Character Formatting](03-DOCUMENT-ELEMENTS.md#character-formatting))
6. **Unicode handling**: Use `\uc1` and provide ANSI fallbacks (see [Section 1: Character Encoding](01-RTF-FUNDAMENTALS.md#character-encoding))

### Best Practices:

1. **Start simple**: Begin with basic ANSI, Times New Roman, black text
2. **Test compatibility**: Verify output with multiple RTF readers
3. **Document encoding**: Match code page to document language
4. **Validation**: Check that all referenced IDs exist in tables
