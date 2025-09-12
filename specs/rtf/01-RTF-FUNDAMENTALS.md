# RTF Fundamentals

This section covers the fundamental concepts and syntax rules for RTF (Rich Text Format) files, essential for implementing an RTF writer.

## Overview

RTF files are usually **7-bit ASCII plain text**, consisting of three main components:

- **Control words** - formatted commands for text display
- **Control symbols** - single non-alphabetical characters with backslash
- **Groups** - collections of text and formatting enclosed in braces

RTF files are easily transmitted between PC-based operating systems due to their 7-bit ASCII nature, though converters should expect 8-bit characters and binary data when communicating with Microsoft Word applications.

## Basic File Structure

An RTF file follows this basic syntax:

```
<File> ::= '{' <header> <document> '}'
```

### Minimal RTF Example

```rtf
{\rtf1\ansi\deff0 Hello World!\par}
```

### Complete RTF Structure

```rtf
{\rtf1\ansi\deff0{\fonttbl{\f0\froman Times;}}
{\colortbl;\red0\green0\blue0;\red255\green0\blue0;}
\f0\fs24 This is \b bold\b0 and \cf2 red\cf0 text.\par}
```

## Control Words

Control words are specially formatted commands that mark characters for display or printing.

### Syntax

```
\<ASCII Letter Sequence><Delimiter>
```

### Rules

- **Case sensitive**: `\par` ≠ `\PAR`
- **Maximum length**: 32 letters
- **ASCII letters only**: a-z, A-Z (traditionally lowercase, some newer words use uppercase)
- **Backslash prefix**: Always starts with `\`

### Delimiters

1. **Space delimiter**: Ignored in processing

   ```rtf
   \par This text follows a paragraph break
   ```

2. **Numeric parameter**: Positive or negative decimal number

   ```rtf
   \fs24      // Font size 12 points (24 half-points)
   \li-720    // Left indent -720 twips
   ```

   - Range: -32,768 to 32,767 (signed 16-bit)
   - Some control words accept 32-bit values: `\binN`, `\revdttmN`, `\rsidN`

3. **Non-alphanumeric character**: Terminates control word
   ```rtf
   \b\i bold and italic\b0\i0
   ```

### Toggle Control Words

Control words like `\b` (bold) have two states:

- **No parameter or nonzero**: Property ON (`\b`, `\b1`)
- **Zero parameter**: Property OFF (`\b0`)

## Control Symbols

Control symbols consist of a backslash followed by a single non-alphabetical character.

### Examples

- `\~` - Non-breaking space
- `\\` - Literal backslash
- `\{` - Literal opening brace
- `\}` - Literal closing brace
- `\_` - Non-breaking hyphen
- `\-` - Optional hyphen (soft hyphen)
- `\'XX` - Hexadecimal character (XX = hex code)

### Important Notes

- **No delimiters**: Space after control symbol is treated as text
- **No parameters**: Unlike control words, they don't accept numeric values

## Groups

Groups define scope for formatting and organize related content using braces `{ }`.

### Syntax

```rtf
{<group content>}
```

### Formatting Rules

- **Inheritance**: Inner groups inherit outer group formatting
- **Local scope**: Formatting changes within a group only affect that group
- **Reset on exit**: Formatting reverts when group closes

### Example

```rtf
{Normal text {\b bold text {\i bold italic}} back to bold} normal again
```

### Group Types

Groups can contain:

- **Text and formatting**
- **Font tables** (`{\fonttbl...}`)
- **Color tables** (`{\colortbl...}`)
- **Style sheets** (`{\stylesheet...}`)
- **Pictures** (`{\pict...}`)
- **Footnotes** (`{\footnote...}`)
- **Headers/footers**
- **Document properties**

## Destinations

Destinations are special control words that mark collections of related text for specific document positions.

### Syntax

```rtf
{\footnote This is footnote text}
{\header This appears in page header}
```

### New Destination Convention

Destinations added after 1987 should use `\*` prefix:

```rtf
{\*\newdestination This content is ignored by older readers}
```

### Rules

- **Must be in groups**: Destination and text enclosed in braces
- **No page breaks**: Page breaks cannot occur in destination text
- **Special formatting**: Some destinations (footnotes, headers) don't inherit outer formatting

## Formal Syntax Notation

RTF specification uses Backus-Naur Form:

| Syntax  | Meaning                            |
| ------- | ---------------------------------- |
| #PCDATA | Plain text (without control words) |
| #SDATA  | Hexadecimal data                   |
| #BDATA  | Binary data                        |
| 'c'     | Literal ASCII character(s)         |
| A?      | Item A is optional                 |
| A+      | One or more repetitions            |
| A\*     | Zero or more repetitions           |
| A B     | A followed by B                    |
| A \| B  | A or B                             |
| A & B   | A or B in any order                |

## RTF Header Structure

The RTF header must appear in this order:

```
<header> ::= \rtf1 <character set> <from>? <deffont> <deflang>
             <fonttbl>? <filetbl>? <colortbl>? <stylesheet>? <stylerestrictions>?
             <listtables>? <rsidtable>? <mathprops>? <generator>?
```

### Required Elements

1. **RTF Version**: `\rtf1` (always use 1)
2. **Character Set**: Default is `\ansi`
   - `\ansi` - ANSI (default)
   - `\mac` - Apple Macintosh
   - `\pc` - IBM PC code page 437
   - `\pca` - IBM PC code page 850
   - `\ansicpgN` - Specific ANSI code page

### Required Elements (continued)

3. **Default Font**: `\deffN` - Default font number (references font table)

### Optional Tables

- **Font table**: `{\fonttbl...}` - Must precede font references (see [Section 2: Font Table](02-DOCUMENT-PROPERTIES.md#font-table))
  - Font families: `\froman` (serif), `\fswiss` (sans-serif), `\fmodern` (monospace), `\fscript`, `\fdecor`
- **Color table**: `{\colortbl...}` - Must precede color references (see [Section 2: Color Table](02-DOCUMENT-PROPERTIES.md#color-table))
  - First entry is always empty (represents default/auto color)
- **Style sheet**: `{\stylesheet...}` - Must precede style usage (see [Section 4: Style Sheets](04-ADVANCED-FORMATTING.md#style-sheets))

## Character Encoding

- **Default**: 7-bit ASCII
- **Line breaks**: CRLFs ignored (except as control word delimiters)
- **Binary data**: Use `\binN` control word for 8-bit data
- **Unicode**: Supported via `\uN` control words
  - N is the Unicode code point
  - Must be followed by ANSI fallback character(s)
  - Example: `\u8364?` (Euro symbol with '?' fallback)
- **Measurements**: Uses twips (1/1440 inch) as base unit

## Special Characters

To include literal RTF special characters as text:

- `\\` for backslash `\`
- `\{` for opening brace `{`
- `\}` for closing brace `}`

## Implementation Guidelines

### For RTF Writers:

1. Always start with `{\rtf1`
2. Declare character set if not ANSI
3. Include required tables before first usage
4. Use proper group nesting
5. Follow control word parameter ranges
6. Use `\*` for new destinations

### Cross-Platform Compatibility Guidelines:

1. **Stick to Core RTF**: Use widely-supported features first
2. **Test Across Readers**: Validate with LibreOffice, WordPad, and other non-Microsoft readers
3. **Graceful Degradation**: Proprietary features should not break document structure
4. **Use Standard Encodings**: ANSI (Windows-1252) has the broadest support
5. **Conservative Feature Usage**: Prefer simple formatting over complex proprietary features

### Error Handling:

1. Ignore unrecognized destinations with `\*`
2. Treat malformed control words as text
3. Handle missing closing braces gracefully
4. Validate parameter ranges
