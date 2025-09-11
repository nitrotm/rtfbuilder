# Document Layout & Elements

This section covers RTF formatting at the section, paragraph, and character levels, plus table and list creation - essential for controlling document layout and text presentation.

## Overview

RTF formatting operates at four hierarchical levels:

1. **Section Level** - Page layout, columns, headers/footers, breaks
2. **Paragraph Level** - Text alignment, indentation, spacing, borders, tabs
3. **Character Level** - Fonts, colors, text effects, highlighting
4. **Table/List Level** - Structured content with specialized formatting

Each level inherits properties from higher levels unless explicitly overridden.

---

## Section Formatting

Sections define page layout and document structure. Each section can have unique page settings, headers, footers, and column layouts.

### Section Syntax

```rtf
\sect         % Start new section
\sectd        % Reset to default section properties
```

### Core Section Controls

| Control Word | Description                                  |
| ------------ | -------------------------------------------- |
| `\sect`      | Start new section                            |
| `\sectd`     | Reset to default section properties          |
| `\endnhere`  | Include endnotes in this section             |
| `\binfsxnN`  | Printer bin for first page (N = bin number)  |
| `\binsxnN`   | Printer bin for other pages (N = bin number) |
| `\dsN`       | Designate section style (N = style number)   |

### Section Breaks

| Control Word | Description                 |
| ------------ | --------------------------- |
| `\sbknone`   | No section break            |
| `\sbkcol`    | Break to new column         |
| `\sbkpage`   | Break to new page (default) |
| `\sbkeven`   | Break to even page          |
| `\sbkodd`    | Break to odd page           |

### Column Layout

| Control Word  | Description                                   |
| ------------- | --------------------------------------------- |
| `\colsN`      | Number of columns (default: 1)                |
| `\colsxN`     | Space between columns in twips (default: 720) |
| `\linebetcol` | Draw line between columns                     |
| `\colnoN`     | Column number for variable-width formatting   |
| `\colwN`      | Width of column N in twips                    |
| `\colsrN`     | Space to right of column N in twips           |

### Page Properties

| Control Word  | Description                     |
| ------------- | ------------------------------- |
| `\pgwsxnN`    | Page width in twips             |
| `\pghsxnN`    | Page height in twips            |
| `\marglsxnN`  | Left margin in twips            |
| `\margrsxnN`  | Right margin in twips           |
| `\margtsxnN`  | Top margin in twips             |
| `\margbsxnN`  | Bottom margin in twips          |
| `\guttersxnN` | Gutter width in twips           |
| `\margmirsxn` | Mirror margins for facing pages |
| `\lndscpsxn`  | Landscape orientation           |
| `\titlepg`    | First page has special format   |

### Page Numbering

| Control Word  | Description                       |
| ------------- | --------------------------------- |
| `\pgnstartsN` | Starting page number (default: 1) |
| `\pgncont`    | Continuous numbering (default)    |
| `\pgnrestart` | Restart numbering each section    |
| `\pgndec`     | Decimal numbers (1, 2, 3)         |
| `\pgnucrm`    | Upper Roman (I, II, III)          |
| `\pgnlcrm`    | Lower Roman (i, ii, iii)          |
| `\pgnucltr`   | Upper letters (A, B, C)           |
| `\pgnlcltr`   | Lower letters (a, b, c)           |

### Vertical Text Alignment

| Control Word | Description           |
| ------------ | --------------------- |
| `\vertalt`   | Top-aligned (default) |
| `\vertalc`   | Center-aligned        |
| `\vertalb`   | Bottom-aligned        |
| `\vertalj`   | Justified             |

### Headers and Footers

Headers and footers are destinations that contain formatted text for page tops and bottoms.

#### Header/Footer Types

| Control Word | Description                |
| ------------ | -------------------------- |
| `\header`    | Header on all pages        |
| `\footer`    | Footer on all pages        |
| `\headerl`   | Header on left pages only  |
| `\headerr`   | Header on right pages only |
| `\headerf`   | Header on first page only  |
| `\footerl`   | Footer on left pages only  |
| `\footerr`   | Footer on right pages only |
| `\footerf`   | Footer on first page only  |

#### Header/Footer Positioning

| Control Word | Description                                         |
| ------------ | --------------------------------------------------- |
| `\headeryN`  | Header distance from top in twips (default: 720)    |
| `\footeryN`  | Footer distance from bottom in twips (default: 720) |

### Section Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
\sect\sectd
\cols2\colsx720\linebetcol
\margl1440\margr1440\margt1440\margb1440
\pgndec\pgnstarts1
{\header\pard\qc Page \chpgn\par}
{\footer\pard\qc Copyright 2024\par}
\pard Section content here...\par
\sect
\sbkpage\cols1
More content in single column...\par
}
```

---

## Paragraph Formatting

Paragraphs control text flow, alignment, spacing, indentation, and visual presentation through borders and shading.

### Paragraph Syntax

```rtf
\par          % End paragraph
\pard         % Reset to default paragraph properties
```

### Core Paragraph Controls

| Control Word   | Description                                         |
| -------------- | --------------------------------------------------- |
| `\par`         | End paragraph                                       |
| `\pard`        | Reset paragraph formatting to defaults              |
| `\intbl`       | Paragraph is part of a table                        |
| `\itapN`       | Nesting level (0=document, 1=table, 2=nested table) |
| `\keep`        | Keep paragraph on one page                          |
| `\keepn`       | Keep with next paragraph                            |
| `\levelN`      | Outline level (1-9)                                 |
| `\noline`      | No line numbering for this paragraph                |
| `\hyphpar`     | Toggle automatic hyphenation for paragraph          |
| `\pagebb`      | Page break before paragraph                         |
| `\widctlpar`   | Use automatic width control (default)               |
| `\nowidctlpar` | Don't use automatic width control                   |
| `\sN`          | Apply paragraph style N                             |

### Text Alignment

| Control Word | Description            |
| ------------ | ---------------------- |
| `\ql`        | Left-aligned (default) |
| `\qc`        | Center-aligned         |
| `\qr`        | Right-aligned          |
| `\qj`        | Justified              |
| `\qd`        | Distributed            |

### Indentation

| Control Word   | Description                          |
| -------------- | ------------------------------------ |
| `\fiN`         | First-line indent in twips           |
| `\liN`         | Left indent in twips                 |
| `\riN`         | Right indent in twips                |
| `\cufiN`       | First-line indent in character units |
| `\culiN`       | Left indent in character units       |
| `\curiN`       | Right indent in character units      |
| `\adjustright` | Auto-adjust right indent with grid   |
| `\indmirror`   | Mirror indents on facing pages       |

### Spacing

| Control Word      | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `\sbN`            | Space before paragraph in twips                                               |
| `\saN`            | Space after paragraph in twips                                                |
| `\sbautoN`        | Auto space before (0=manual, 1=auto)                                          |
| `\saautoN`        | Auto space after (0=manual, 1=auto)                                           |
| `\slN`            | Line spacing (0=auto, +N=exact twips, -N=multiple of single, e.g., -240=1.2x) |
| `\slmultN`        | Line spacing type (0=exact/at least, 1=multiple)                              |
| `\lisbN`          | Space before in character units                                               |
| `\lisaN`          | Space after in character units                                                |
| `\nosnaplinegrid` | Don't snap to grid                                                            |

### Paragraph Borders

#### Border Positions

| Control Word | Description          |
| ------------ | -------------------- |
| `\brdrt`     | Top border           |
| `\brdrb`     | Bottom border        |
| `\brdrl`     | Left border          |
| `\brdrr`     | Right border         |
| `\brdrbtw`   | Between paragraphs   |
| `\brdrbar`   | Outside border       |
| `\box`       | Box around paragraph |

#### Border Styles

| Control Word      | Description                 |
| ----------------- | --------------------------- |
| `\brdrs`          | Single line                 |
| `\brdrth`         | Thick line                  |
| `\brdrsh`         | Shadow                      |
| `\brdrdb`         | Double line                 |
| `\brdrdot`        | Dotted                      |
| `\brdrdash`       | Dashed                      |
| `\brdrhair`       | Hairline                    |
| `\brdrinset`      | Inset                       |
| `\brdroutset`     | Outset                      |
| `\brdrtriple`     | Triple line                 |
| `\brdrwavy`       | Wavy line                   |
| `\brdrwavydb`     | Double wavy                 |
| `\brdremboss`     | Embossed                    |
| `\brdrengrave`    | Engraved                    |
| `\brdrdashdotstr` | Striped dash-dot            |
| `\brdrtbl`        | Table border (internal use) |
| `\brdrnone`       | No border                   |

#### Border Properties

| Control Word | Description                      |
| ------------ | -------------------------------- |
| `\brdrwN`    | Border width in twips (max 255)  |
| `\brdrcfN`   | Border color (color table index) |
| `\brspN`     | Border spacing in twips          |

### Paragraph Shading

| Control Word | Description                  |
| ------------ | ---------------------------- |
| `\shadingN`  | Shading percentage (0-10000) |
| `\cfpatN`    | Foreground pattern color     |
| `\cbpatN`    | Background pattern color     |

#### Shading Patterns

| Control Word  | Description              |
| ------------- | ------------------------ |
| `\bghoriz`    | Horizontal lines         |
| `\bgvert`     | Vertical lines           |
| `\bgfdiag`    | Forward diagonal (\\\\)  |
| `\bgbdiag`    | Backward diagonal (////) |
| `\bgcross`    | Cross pattern            |
| `\bgdcross`   | Diagonal cross           |
| `\bgdkhoriz`  | Dark horizontal          |
| `\bgdkvert`   | Dark vertical            |
| `\bgdkfdiag`  | Dark forward diagonal    |
| `\bgdkbdiag`  | Dark backward diagonal   |
| `\bgdkcross`  | Dark cross               |
| `\bgdkdcross` | Dark diagonal cross      |

### Tab Stops

| Control Word | Description                          |
| ------------ | ------------------------------------ |
| `\txN`       | Tab stop at N twips from left margin |
| `\tqr`       | Right-aligned tab                    |
| `\tqc`       | Center-aligned tab                   |
| `\tqdec`     | Decimal-aligned tab                  |
| `\tbN`       | Bar tab at N twips                   |

#### Tab Leaders

| Control Word | Description               |
| ------------ | ------------------------- |
| `\tldot`     | Dot leader (...)          |
| `\tlmdot`    | Middle dot leader         |
| `\tlhyph`    | Hyphen leader (---)       |
| `\tlul`      | Underline leader (\_\_\_) |
| `\tlth`      | Thick line leader         |
| `\tleq`      | Equal sign leader (===)   |

### Paragraph Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
{\colortbl;\red0\green0\blue0;\red255\green0\blue0;}
\pard\ql\fi720\li0\ri0\sb240\sa120
\brdrt\brdrs\brdrw15\brdrcf1\brsp80
\shading1000\cfpat0\cbpat2
\tx2160\tx4320\tqr6480
First paragraph with first-line indent, top border, and tab stops.\par

\pard\qc\sb120\sa120
\b\fs28 Centered Title\b0\fs24\par

\pard\qj\li720\ri720\sl360\slmult1
Justified paragraph with left and right indents and 1.5 line spacing.\par
}
```

---

## Character Formatting

Character formatting controls font properties, text effects, colors, and special text treatments.

### Character Syntax

```rtf
\plain        % Reset to default character properties
```

### Font Properties

| Control Word   | Description                          |
| -------------- | ------------------------------------ |
| `\plain`       | Reset character formatting           |
| `\fN`          | Font number (refers to font table)   |
| `\fsN`         | Font size in half-points (24 = 12pt) |
| `\cfN`         | Foreground color (color table index) |
| `\cbN`         | Background color (color table index) |
| `\charscalexN` | Character scaling percentage         |
| `\kerningN`    | Kerning threshold in half-points     |
| `\expndN`      | Character spacing in quarter-points  |
| `\expndtwN`    | Character spacing in twips           |

### Text Effects

| Control Word | Description                    |
| ------------ | ------------------------------ |
| `\b`         | Bold (toggle with `\b0`)       |
| `\i`         | Italic (toggle with `\i0`)     |
| `\ul`        | Underline (toggle with `\ul0`) |
| `\caps`      | All capitals                   |
| `\scaps`     | Small capitals                 |
| `\strike`    | Strikethrough                  |
| `\striked1`  | Double strikethrough           |
| `\outl`      | Outline                        |
| `\shad`      | Shadow                         |
| `\embo`      | Emboss                         |
| `\impr`      | Engrave (imprint)              |
| `\v`         | Hidden text                    |
| `\webhidden` | Hidden in web view             |
| `\langN`     | Language ID for text           |
| `\noproof`   | Don't check spelling/grammar   |

### Underline Styles

| Control Word | Description               |
| ------------ | ------------------------- |
| `\ul`        | Continuous underline      |
| `\ulnone`    | No underline              |
| `\uld`       | Dotted underline          |
| `\uldb`      | Double underline          |
| `\uldash`    | Dashed underline          |
| `\uldashd`   | Dash-dotted underline     |
| `\uldashdd`  | Dash-dot-dotted underline |
| `\ulhwave`   | Heavy wave underline      |
| `\ulldash`   | Long dashed underline     |
| `\ulth`      | Thick underline           |
| `\ulthd`     | Thick dotted underline    |
| `\ulwave`    | Wave underline            |
| `\ulw`       | Word underline            |
| `\ulcN`      | Underline color           |

### Text Position

| Control Word  | Description         |
| ------------- | ------------------- |
| `\sub`        | Subscript           |
| `\super`      | Superscript         |
| `\nosupersub` | Normal position     |
| `\upN`        | Raise N half-points |
| `\dnN`        | Lower N half-points |

### Character Borders and Shading

| Control Word | Description                  |
| ------------ | ---------------------------- |
| `\chbrdr`    | Character border             |
| `\chshdngN`  | Character shading percentage |
| `\chcfpatN`  | Character pattern foreground |
| `\chcbpatN`  | Character pattern background |

#### Character Shading Patterns

| Control Word  | Description        |
| ------------- | ------------------ |
| `\chbghoriz`  | Horizontal pattern |
| `\chbgvert`   | Vertical pattern   |
| `\chbgfdiag`  | Forward diagonal   |
| `\chbgbdiag`  | Backward diagonal  |
| `\chbgcross`  | Cross pattern      |
| `\chbgdcross` | Diagonal cross     |

### Highlighting

| Control Word  | Description            |
| ------------- | ---------------------- |
| `\highlightN` | Highlight with color N |

### Special Characters

| Control Word | Description                           |
| ------------ | ------------------------------------- |
| `\~`         | Non-breaking space                    |
| `\_`         | Non-breaking hyphen                   |
| `\-`         | Optional hyphen (soft hyphen)         |
| `\'XX`       | Hexadecimal character (XX = hex code) |
| `\chpgn`     | Current page number                   |
| `\chdate`    | Current date                          |
| `\chtime`    | Current time                          |
| `\tab`       | Tab character                         |

### Character Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}{\f1\fswiss Arial;}}
{\colortbl;\red0\green0\blue0;\red255\green0\blue0;\red255\green255\blue0;}
\f0\fs24 Normal text, \b bold\b0, \i italic\i0, \ul underlined\ul0.\par
\f1\fs28\cf2 Arial font in red color.\par
\f0\fs24\cf1\highlight3 Highlighted text with yellow background.\par
\super Superscript\nosupersub and \sub subscript\nosupersub text.\par
\scaps Small Capitals\scaps0 and \caps ALL CAPITALS\caps0.\par
}
```

---

## Lists and Tables

### Tables

Tables in RTF are sequences of table rows, each containing cells with formatting properties.

#### Table Structure

```rtf
\trowd        % Table row defaults
\cellxN       % Cell boundary at N twips
\trgaphN      % Half-space between cells
... cell content ...
\cell         % End cell
\row          % End row
```

#### Row Properties

| Control Word | Description                       |
| ------------ | --------------------------------- |
| `\trowd`     | Set table row defaults            |
| `\row`       | End table row                     |
| `\trgaphN`   | Half-space between cells in twips |
| `\trql`      | Left-align row                    |
| `\trqc`      | Center-align row                  |
| `\trqr`      | Right-align row                   |
| `\trleftN`   | Row left position in twips        |
| `\trrhN`     | Row height in twips               |
| `\trhdr`     | Row is table header               |
| `\trkeep`    | Keep row together                 |

#### Cell Properties

| Control Word | Description                       |
| ------------ | --------------------------------- |
| `\cell`      | End table cell                    |
| `\cellxN`    | Right boundary of cell at N twips |
| `\clmgf`     | First cell in merge range         |
| `\clmrg`     | Merge with preceding cell         |
| `\clvmgf`    | First cell in vertical merge      |
| `\clvmrg`    | Vertically merge with above       |

#### Cell Alignment

| Control Word | Description           |
| ------------ | --------------------- |
| `\clvertalt` | Top-aligned (default) |
| `\clvertalc` | Center-aligned        |
| `\clvertalb` | Bottom-aligned        |

#### Cell Borders

| Control Word | Description        |
| ------------ | ------------------ |
| `\clbrdrt`   | Top cell border    |
| `\clbrdrb`   | Bottom cell border |
| `\clbrdrl`   | Left cell border   |
| `\clbrdrr`   | Right cell border  |

#### Cell Shading

| Control Word | Description                   |
| ------------ | ----------------------------- |
| `\clshdngN`  | Cell shading percentage       |
| `\clcfpatN`  | Cell pattern foreground color |
| `\clcbpatN`  | Cell pattern background color |

### Table Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
{\colortbl;\red0\green0\blue0;\red240\green240\blue240;}
\trowd\trgaph108\trleft-108
\clbrdrt\brdrs\brdrw10\brdrcf1
\clbrdrl\brdrs\brdrw10\brdrcf1
\clbrdrb\brdrs\brdrw10\brdrcf1
\clbrdrr\brdrs\brdrw10\brdrcf1
\clshdng2000\cellx2880
\clbrdrt\brdrs\brdrw10\brdrcf1
\clbrdrl\brdrs\brdrw10\brdrcf1
\clbrdrb\brdrs\brdrw10\brdrcf1
\clbrdrr\brdrs\brdrw10\brdrcf1
\cellx5760
\pard\intbl\qc\b Header 1\b0\cell
\pard\intbl\qc\b Header 2\b0\cell
\trowd\trgaph108\trleft-108
\clbrdrt\brdrs\brdrw10\brdrcf1
\clbrdrl\brdrs\brdrw10\brdrcf1
\clbrdrb\brdrs\brdrw10\brdrcf1
\clbrdrr\brdrs\brdrw10\brdrcf1
\cellx2880
\clbrdrt\brdrs\brdrw10\brdrcf1
\clbrdrl\brdrs\brdrw10\brdrcf1
\clbrdrb\brdrs\brdrw10\brdrcf1
\clbrdrr\brdrs\brdrw10\brdrcf1
\cellx5760
\pard\intbl Cell 1\cell
\pard\intbl Cell 2\cell
\row}
```

### Lists

Lists use document-wide list tables that define numbering and bullet styles.

#### List Table Structure

```rtf
{\*\listtable
  {\list\listidN
    {\listlevel
      \levelnfcN\leveljcN\levelstartatN
      {\leveltext \'01\'b7;}
      \li720\fi-360
    }
  }
}
```

#### List Properties

| Control Word       | Description                       |
| ------------------ | --------------------------------- |
| `\listidN`         | Unique list ID                    |
| `\listtemplateidN` | List template ID                  |
| `\listsimpleN`     | Simple list (1) or multilevel (0) |
| `\listrestarthdnN` | Restart numbering each section    |

#### Level Properties

| Control Word     | Description                                   |
| ---------------- | --------------------------------------------- |
| `\levelstartatN` | Starting number for level                     |
| `\levelnfcN`     | Number format (0=Arabic, 1=Upper Roman, etc.) |
| `\leveljcN`      | Justification (0=left, 1=center, 2=right)     |
| `\levelfollowN`  | Follow character (0=tab, 1=space, 2=nothing)  |

#### Number Formats

| Value | Format                   |
| ----- | ------------------------ |
| 0     | Arabic (1, 2, 3)         |
| 1     | Upper Roman (I, II, III) |
| 2     | Lower Roman (i, ii, iii) |
| 3     | Upper letter (A, B, C)   |
| 4     | Lower letter (a, b, c)   |
| 23    | Bullet                   |
| 255   | No number                |

### List Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
{\*\listtable
  {\list\listid1
    {\listlevel\levelnfc23\leveljc0\levelstartat1
      {\leveltext\'01\'b7;}
      \li720\fi-360
    }
  }
}
{\*\listoverridetable
  {\listoverride\listid1\listoverridecount0\ls1}
}
\pard{\pntext\f0 \'b7\tab}\ls1\li720\fi-360 First bullet item\par
\pard{\pntext\f0 \'b7\tab}\ls1\li720\fi-360 Second bullet item\par
\pard{\pntext\f0 \'b7\tab}\ls1\li720\fi-360 Third bullet item\par
}
```

## Implementation Guidelines

### For RTF Writers:

1. **Hierarchy matters**: Set section properties before paragraphs, paragraph before characters (see [Section 1: Groups](01-RTF-FUNDAMENTALS.md#groups))
2. **Reset appropriately**: Use `\sectd`, `\pard`, `\plain` to establish known states
3. **Measure consistently**: Always use twips for measurements (see [Section 2: Document Properties](02-DOCUMENT-PROPERTIES.md))
4. **Close properly**: End tables with `\row`, paragraphs with `\par`
5. **Test formatting**: Verify output in multiple RTF readers

### Best Practices:

1. **Start simple**: Basic formatting first, then add complexity
2. **Use defaults**: Leverage default values to minimize control words
3. **Group related formatting**: Apply multiple properties together
4. **Validate structure**: Ensure proper nesting and closure
5. **Handle inheritance**: Understand how formatting flows down levels
