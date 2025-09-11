# Styling & Advanced Formatting

This section covers RTF's advanced formatting capabilities including reusable styles, positioned objects, and complex visual effects - essential for creating professionally styled documents.

## Overview

Advanced RTF formatting encompasses four key areas:

1. **Style Sheets** - Reusable formatting templates and quick styles
2. **Table Styles** - Specialized formatting for tables and cells
3. **Positioned Objects** - Frames, absolute positioning, and text flow
4. **Advanced Borders and Shading** - Complex visual effects and patterns

These features enable sophisticated document styling while maintaining consistency and professional appearance.

---

## Style Sheets

Style sheets provide a centralized way to define and reuse formatting throughout a document. RTF supports paragraph, character, section, and table styles.

### Style Sheet Syntax

```rtf
{\stylesheet
  {<style-definition>}
  {<style-definition>}
  ...
}
```

### Style Definition Structure

```rtf
{\sN <formatting> <properties> \snextN StyleName;}
```

### Style Types

#### Paragraph Styles

```rtf
{\s15 \ql\li0\ri0\sb120\sa120 \f0\fs24 \snext15 Body Text;}
```

#### Character Styles

```rtf
{\*\cs16 \additive \b\f1 \sbasedon10 Strong;}
```

#### Section Styles

```rtf
{\*\ds17 \cols2\colsx720 \snext17 Two Column Section;}
```

#### Table Styles

```rtf
{\*\ts18 \tsrowd\trbrdrt\brdrs\brdrw15 \snext18 Simple Table;}
```

### Core Style Controls

| Control Word | Description                                 |
| ------------ | ------------------------------------------- |
| `\sN`        | Paragraph style with handle N               |
| `\*\csN`     | Character style with handle N (requires \*) |
| `\*\dsN`     | Section style with handle N (requires \*)   |
| `\*\tsN`     | Table style with handle N (requires \*)     |
| `\additive`  | Add character style to existing formatting  |
| `\tsrowd`    | Table row defaults for table styles         |

### Style Properties

| Control Word | Description                                   |
| ------------ | --------------------------------------------- |
| `\sbasedonN` | Based on style N (default: 222=none)          |
| `\snextN`    | Next paragraph style (default: current style) |
| `\sautoupd`  | Automatically update style                    |
| `\shidden`   | Hide from style menu                          |
| `\slocked`   | Lock style when protection is on              |
| `\spersonal` | Personal email style ⚠️ **Outlook Specific**  |
| `\scompose`  | Email compose style ⚠️ **Outlook Specific**   |
| `\sreply`    | Email reply style ⚠️ **Outlook Specific**     |
| `\slinkN`    | Link to style with index N                    |

### Style Visibility and Priority ⚠️ **Microsoft Word Specific**

| Control Word    | Description                                   |
| --------------- | --------------------------------------------- |
| `\spriorityN`   | Sort priority in UI (lower = higher priority) |
| `\sqformat`     | Primary/Quick Style designation               |
| `\sunhideusedN` | Hide until used (0=show, 1=hide)              |
| `\ssemihiddenN` | Visibility in dropdown (0=visible, 1=hidden)  |
| `\keycode`      | Keyboard shortcut assignment for style        |
| `\sqfmt`        | Format type designation                       |

> **Compatibility Warning**: These style visibility controls are Microsoft Word proprietary features. Most other RTF readers will ignore them. Use standard style definitions for maximum compatibility.

### Style Restrictions

Style restrictions control access and modification of styles:

| Control Word         | Description                          |
| -------------------- | ------------------------------------ |
| `\stylerestrictions` | Enable style restriction enforcement |
| `\slocked`           | Lock style from modification         |
| `\shidden`           | Hide style from UI elements          |

### List Table Integration

Styles can integrate with list numbering through list tables:

```rtf
{\*\listtable
  {\list\listidN
    {\listlevel\levelnfcN\leveljcN\levelstartatN
      {\leveltext \'01\'b7;}
      \li720\fi-360
    }
  }
}
{\*\listoverridetable
  {\listoverride\listidN\listoverridecount0\lsN}
}
```

---

## Positioned Objects and Frames

Positioned objects allow precise control over text and graphic placement, including frames, absolute positioning, and text wrapping.

### Frame Syntax

```rtf
<positioned-paragraph> \pard <positioning-controls> <content> \par
```

### Frame Dimensions

| Control Word | Description                                          |
| ------------ | ---------------------------------------------------- |
| `\abswN`     | Frame width in twips                                 |
| `\abshN`     | Frame height in twips (>0=minimum, <0=exact, 0=auto) |

### Horizontal Positioning

#### Reference Points

| Control Word | Description                           |
| ------------ | ------------------------------------- |
| `\phmrg`     | Position relative to margin           |
| `\phpg`      | Position relative to page             |
| `\phcol`     | Position relative to column (default) |

#### Horizontal Alignment

| Control Word | Description                                |
| ------------ | ------------------------------------------ |
| `\posxN`     | N twips from left edge                     |
| `\posnegxN`  | N twips from left edge (negative values)   |
| `\posxc`     | Center horizontally                        |
| `\posxi`     | Inside (left on odd pages, right on even)  |
| `\posxo`     | Outside (right on odd pages, left on even) |
| `\posxl`     | Left-aligned (default)                     |
| `\posxr`     | Right-aligned                              |

### Vertical Positioning

#### Reference Points

| Control Word | Description                                  |
| ------------ | -------------------------------------------- |
| `\pvmrg`     | Position relative to margin (default)        |
| `\pvpg`      | Position relative to page                    |
| `\pvpara`    | Position relative to next unframed paragraph |

#### Vertical Alignment

| Control Word | Description                             |
| ------------ | --------------------------------------- |
| `\posyN`     | N twips from top edge                   |
| `\posnegyN`  | N twips from top edge (negative values) |
| `\posyt`     | Top-aligned                             |
| `\posyc`     | Center vertically                       |
| `\posyb`     | Bottom-aligned                          |
| `\posyin`    | Inside position                         |
| `\posyout`   | Outside position                        |
| `\posyil`    | In-line with text                       |

### Text Wrapping

#### Wrapping Control

| Control Word   | Description                    |
| -------------- | ------------------------------ |
| `\nowrap`      | No text wrapping around object |
| `\overlay`     | Text flows underneath frame    |
| `\wrapdefault` | Default wrapping behavior      |
| `\wraparound`  | Wrap around available space    |
| `\wraptight`   | Tight wrapping around frame    |
| `\wrapthrough` | Text flows through frame       |

#### Distance Settings

| Control Word | Description                                  |
| ------------ | -------------------------------------------- |
| `\dxfrtextN` | Distance from text in all directions (twips) |
| `\dfrmtxtxN` | Horizontal distance from text (twips)        |
| `\dfrmtxtyN` | Vertical distance from text (twips)          |

### Frame Anchoring and Overlap

| Control Word   | Description                                            |
| -------------- | ------------------------------------------------------ |
| `\abslockN`    | Lock anchor to paragraph (0=no, 1=yes)                 |
| `\absnoo`      | Allow overlap with other frames                        |
| `\absnoovrlpN` | Prevent overlap with other frames (0=allow, 1=prevent) |

### Text Flow Direction

| Control Word  | Description                            |
| ------------- | -------------------------------------- |
| `\frmtxlrtb`  | Left to right, top to bottom (default) |
| `\frmtxtbrl`  | Right to left, top to bottom           |
| `\frmtxbtlr`  | Left to right, bottom to top           |
| `\frmtxlrtbv` | Left to right, top to bottom, vertical |
| `\frmtxtbrlv` | Top to bottom, right to left, vertical |

### Drop Caps

| Control Word  | Range | Description                            |
| ------------- | ----- | -------------------------------------- |
| `\dropcapliN` | 1-10  | Number of lines for drop cap           |
| `\dropcaptN`  | 1-2   | Drop cap type (1=in text, 2=in margin) |

### Positioned Object Examples

#### Simple Positioned Frame

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
\pard\phpg\pvpg\posxr\posyt\absw2880\absh1440
\brdrt\brdrs\brdrw15\dxfrtext144
Positioned text box in upper right corner.\par
\pard Normal paragraph text flows around the positioned frame.\par
}
```

#### Drop Cap Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
\pard\dropcapli3\dropcapt1
Once upon a time, in a land far away, there lived a writer
who needed to create beautiful documents with drop caps.\par
}
```

---

## Advanced Borders and Shading

Advanced border and shading effects provide sophisticated visual styling options for paragraphs, characters, and tables.

### Border Syntax

```rtf
<border> <border-style> \brdrwN \brdrcfN \brspN
```

### Border Positions

| Control Word | Description                       |
| ------------ | --------------------------------- |
| `\brdrt`     | Top border                        |
| `\brdrb`     | Bottom border                     |
| `\brdrl`     | Left border                       |
| `\brdrr`     | Right border                      |
| `\brdrbtw`   | Between consecutive paragraphs    |
| `\brdrbar`   | Outside border (for facing pages) |
| `\box`       | Box border (all sides)            |

### Basic Border Styles

| Control Word | Description |
| ------------ | ----------- |
| `\brdrs`     | Single line |
| `\brdrth`    | Thick line  |
| `\brdrdb`    | Double line |
| `\brdrsh`    | Shadow      |
| `\brdrdot`   | Dotted      |
| `\brdrdash`  | Dashed      |
| `\brdrhair`  | Hairline    |
| `\brdrnone`  | No border   |

### Advanced Border Styles

| Control Word      | Description                  |
| ----------------- | ---------------------------- |
| `\brdrdashsm`     | Small dashed                 |
| `\brdrdashd`      | Dash-dotted                  |
| `\brdrdashdd`     | Dash-dot-dotted              |
| `\brdrtriple`     | Triple line                  |
| `\brdrwavy`       | Wavy line                    |
| `\brdrwavydb`     | Double wavy                  |
| `\brdrdashdotstr` | Striped dash-dot             |
| `\brdrartN`       | Border art pattern (N=1-165) |

### 3D Effect Borders

| Control Word   | Description        |
| -------------- | ------------------ |
| `\brdremboss`  | Embossed (raised)  |
| `\brdrengrave` | Engraved (inset)   |
| `\brdrinset`   | Inset border       |
| `\brdroutset`  | Outset border      |
| `\brdrframe`   | Frame-style border |

### Thick-Thin Combinations

#### Small Variations

| Control Word    | Description             |
| --------------- | ----------------------- |
| `\brdrtnthsg`   | Thin-thick (small)      |
| `\brdrthtnsg`   | Thick-thin (small)      |
| `\brdrtnthtnsg` | Thin-thick-thin (small) |

#### Medium Variations

| Control Word    | Description              |
| --------------- | ------------------------ |
| `\brdrtnthmg`   | Thin-thick (medium)      |
| `\brdrthtnmg`   | Thick-thin (medium)      |
| `\brdrtnthtnmg` | Thin-thick-thin (medium) |

#### Large Variations

| Control Word    | Description             |
| --------------- | ----------------------- |
| `\brdrtnthlg`   | Thin-thick (large)      |
| `\brdrthtnlg`   | Thick-thin (large)      |
| `\brdrtnthtnlg` | Thin-thick-thin (large) |

### Border Properties

| Control Word | Range       | Description                      |
| ------------ | ----------- | -------------------------------- |
| `\brdrwN`    | 1-255       | Border width in twips            |
| `\brdrcfN`   | Color index | Border color from color table    |
| `\brspN`     | Twips       | Space between border and content |

### Advanced Shading

#### Shading Intensity

| Control Word | Range       | Description                                |
| ------------ | ----------- | ------------------------------------------ |
| `\shadingN`  | 0-10000     | Shading percentage (hundredths of percent) |
| `\cfpatN`    | Color index | Foreground pattern color                   |
| `\cbpatN`    | Color index | Background pattern color                   |

#### Shading Patterns

| Control Word | Description              |
| ------------ | ------------------------ |
| `\bghoriz`   | Horizontal lines         |
| `\bgvert`    | Vertical lines           |
| `\bgfdiag`   | Forward diagonal (\\\\)  |
| `\bgbdiag`   | Backward diagonal (////) |
| `\bgcross`   | Cross pattern            |
| `\bgdcross`  | Diagonal cross           |

#### Dark Pattern Variations

| Control Word  | Description            |
| ------------- | ---------------------- |
| `\bgdkhoriz`  | Dark horizontal lines  |
| `\bgdkvert`   | Dark vertical lines    |
| `\bgdkfdiag`  | Dark forward diagonal  |
| `\bgdkbdiag`  | Dark backward diagonal |
| `\bgdkcross`  | Dark cross pattern     |
| `\bgdkdcross` | Dark diagonal cross    |

### Character Borders and Shading

Character-level borders and shading use the same patterns with `ch` prefix:

| Control Word | Description                        |
| ------------ | ---------------------------------- |
| `\chbrdr`    | Character border                   |
| `\chshdngN`  | Character shading percentage       |
| `\chcfpatN`  | Character pattern foreground color |
| `\chcbpatN`  | Character pattern background color |

**Character shading patterns:** `\chbghoriz`, `\chbgvert`, `\chbgfdiag`, etc.

### Advanced Formatting Examples

#### Complex Border with Shading

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
{\colortbl;\red0\green0\blue0;\red192\green192\blue192;\red51\green102\blue153;}
\pard\brdrt\brdrtriple\brdrw45\brdrcf3\brsp120
\brdrl\brdremboss\brdrw30\brdrcf3\brsp120
\brdrb\brdrtriple\brdrw45\brdrcf3\brsp120
\brdrr\brdremboss\brdrw30\brdrcf3\brsp120
\shading2500\cfpat2\cbpat0\bgfdiag
This paragraph has a complex border with triple top/bottom,
embossed left/right, and diagonal pattern shading.\par
}
```

### Style Application

Apply styles to content using these control words:

| Control Word | Usage                   |
| ------------ | ----------------------- |
| `\sN`        | Apply paragraph style N |
| `\csN`       | Apply character style N |
| `\dsN`       | Apply section style N   |
| `\lsN`       | Apply list style N      |

**Example:**

```rtf
\s1 This paragraph uses style 1
\s0 Normal text with \cs15 character style\cs0 applied.
```

## Implementation Guidelines

### For RTF Writers:

1. **Style consistency**: Use styles for repeated formatting patterns
2. **Style hierarchy**: Implement proper inheritance using `\sbasedon`
3. **Positioning precision**: Test positioned objects in multiple RTF readers
4. **Border optimization**: Use appropriate border styles for desired effects
5. **Pattern testing**: Verify shading patterns render correctly across platforms
6. **List integration**: Coordinate styles with list tables for numbering
7. **Restriction compliance**: Respect style restrictions and locking

### Best Practices:

1. **Start with built-in styles**: Extend standard styles rather than creating from scratch
2. **Consistent styling**: Use style definitions for uniform appearance
3. **Progressive enhancement**: Basic formatting first, advanced effects second
4. **Cross-compatibility**: Test complex formatting in multiple applications
5. **Performance consideration**: Limit excessive style definitions and complex positioning
