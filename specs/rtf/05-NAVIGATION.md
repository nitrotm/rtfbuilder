# Navigation & References

This section covers RTF's navigation and cross-referencing capabilities including bookmarks, hyperlinks, and footnotes - essential for creating interconnected documents.

## Overview

RTF navigation and references encompass five key areas:

1. **Bookmarks** - Document anchors and internal reference points
2. **Hyperlinks** - Internal and external links for navigation
3. **Footnotes** - Reference notes and annotations

These features enable sophisticated document navigation, cross-referencing, and automated content generation while maintaining document integrity.

---

## Bookmarks

Bookmarks create named anchor points in documents that can be referenced by other elements like hyperlinks and cross-references.

### Bookmark Syntax

```rtf
{\*\bkmkstart bookmark-name}
content to bookmark
{\*\bkmkend bookmark-name}
```

### Core Bookmark Controls

| Control Word   | Description                     |
| -------------- | ------------------------------- |
| `\*\bkmkstart` | Start of bookmark (requires \*) |
| `\*\bkmkend`   | End of bookmark (requires \*)   |
| `\bkmkcolfN`   | First column of table bookmark  |
| `\bkmkcollN`   | Last column of table bookmark   |

### Simple Bookmark Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
\pard Science creates structured relationships to fit data.
{\*\bkmkstart paradigm}
Kuhn calls such a presupposed structure a paradigm.
{\*\bkmkend paradigm}
This concept revolutionized scientific thinking.\par
}
```

### Table Bookmarks

For bookmarks spanning specific table columns:

```rtf
{\rtf1\ansi\deff0
\trowd\cellx2000\cellx4000\cellx6000\cellx8000\cellx10000
{\*\bkmkstart\bkmkcolf2\bkmkcoll4 quarterly_data}
\intbl Cell 1\cell
\intbl Cell 2\cell
\intbl Cell 3\cell
\intbl Cell 4\cell
\intbl Cell 5\cell
{\*\bkmkend quarterly_data}
\row
}
```

### Bookmark Naming Rules

- **Case sensitive**: `Chapter1` ≠ `chapter1`
- **No spaces**: Use underscores or camelCase
- **Length limit**: Typically 40 characters maximum
- **Valid characters**: Letters, numbers, underscores
- **Unique names**: Each bookmark name must be unique in document

---

## Hyperlinks

Hyperlinks provide navigation between documents and within documents, implemented primarily through fields or shape properties.

### Field-Based Hyperlinks

```rtf
{\field{\*\fldinst HYPERLINK "URL" \l "bookmark"}{\fldrslt display-text}}
```

### Hyperlink Field Structure

| Component       | Description                   |
| --------------- | ----------------------------- |
| `\field`        | Field container               |
| `\*\fldinst`    | Field instruction destination |
| `HYPERLINK`     | Field type                    |
| `"URL"`         | Target URL or file path       |
| `\l "bookmark"` | Local bookmark reference      |
| `\fldrslt`      | Display result destination    |

### External Hyperlink Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
Visit {\field{\*\fldinst HYPERLINK "https://www.microsoft.com"}
{\fldrslt{\ul\cf1 Microsoft}}} for more information.\par
}
```

### Internal Hyperlink Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
See {\field{\*\fldinst HYPERLINK "" \l "conclusion"}
{\fldrslt{\ul\cf1 Conclusion}}} for details.\par

\page

{\*\bkmkstart conclusion}
\pard\b\fs28 Conclusion\b0\fs24\par
{\*\bkmkend conclusion}
This is the conclusion section.\par
}
```

### Hyperlink Colors

Standard colors for hyperlinks should be defined in the color table and applied to hyperlink display text:

| Color Type          | Typical RGB                       | Usage                    |
| ------------------- | --------------------------------- | ------------------------ |
| Unvisited hyperlink | `\red0\green0\blue255` (Blue)     | Default link color       |
| Visited hyperlink   | `\red128\green0\blue128` (Purple) | Previously clicked links |
| Active hyperlink    | `\red255\green0\blue0` (Red)      | Currently clicking       |

#### Hyperlink Color Application

```rtf
{\colortbl;\red0\green0\blue0;\red0\green0\blue255;\red128\green0\blue128;}
{\field{\*\fldinst HYPERLINK "https://example.com"}
{\fldrslt{\ul\cf2 Link Text}}}
```

#### Implementation Notes

1. **Client Compatibility**: Not all email clients support all parameters
2. **Length Limits**: Some systems limit URL length (typically 2000-2048 characters)
3. **Security**: Email clients may warn users before opening pre-filled emails
4. **Encoding**: Always URL-encode special characters in subject and body
5. **Multiple Recipients**: Separate multiple addresses with commas: `mailto:user1@example.com,user2@example.com`

### File Hyperlinks

```rtf
{\field{\*\fldinst HYPERLINK "file:///C:/Documents/Report.docx"}
{\fldrslt{\ul\cf1 View Report}}}
```

---

## Footnotes

Footnotes provide reference annotations and additional information linked to specific document locations.

### Footnote Syntax

```rtf
{\footnote footnote-content}
```

### Core Footnote Controls

| Control Word | Description                  |
| ------------ | ---------------------------- |
| `\footnote`  | Footnote destination         |
| `\ftnalt`    | Endnote (use with \footnote) |
| `\chftn`     | Automatic footnote reference |

### Simple Footnote Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
\ftnbj\ftnrestart

Mead's study has been annotated.\chftn
{\footnote \pard\plain\fs18 \chftn See Sahlins, Bateson, and Geertz
for complete bibliography.}

Her work during WWII\chftn
{\footnote \pard\plain\fs18 \chftn Bibliography at chapter end.}
forms the paper's basis.\par
}
```

### Document-Level Footnote Settings

#### Footnote Types

| Control Word | Description                                     |
| ------------ | ----------------------------------------------- |
| `\fetN`      | Footnote type (0=footnotes, 1=endnotes, 2=both) |

#### Positioning Controls

| Control Word | Description                           |
| ------------ | ------------------------------------- |
| `\ftnbj`     | Footnotes at bottom of page (default) |
| `\ftntj`     | Footnotes beneath text                |
| `\endnotes`  | Footnotes at section end              |
| `\enddoc`    | Footnotes at document end             |

#### Numbering Controls

| Control Word  | Description                           |
| ------------- | ------------------------------------- |
| `\ftnstartN`  | Starting footnote number (default: 1) |
| `\aftnstartN` | Starting endnote number (default: 1)  |
| `\ftnrstpg`   | Restart numbering each page           |
| `\ftnrestart` | Restart numbering each section        |
| `\ftnrstcont` | Continuous numbering (default)        |

#### Numbering Formats

| Control Word | Description                  |
| ------------ | ---------------------------- |
| `\ftnnar`    | Arabic (1, 2, 3)             |
| `\ftnnalc`   | Lowercase letters (a, b, c)  |
| `\ftnnauc`   | Uppercase letters (A, B, C)  |
| `\ftnnrlc`   | Lowercase Roman (i, ii, iii) |
| `\ftnnruc`   | Uppercase Roman (I, II, III) |
| `\ftnnchi`   | Chicago style (\*, †, ‡, §)  |

### Endnote Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
\fet1\ftnstart1

This research builds on prior work.\chftn
{\footnote\ftnalt \pard\plain\fs18 \chftn Previous studies
include Johnson (1995) and Smith (2001).}

Alternatively, automatic footnote:
This has an auto footnote.{\*\footnote Auto-numbered footnote text.}

The methodology follows established protocols.\par
}
```

### Custom Footnote Separators

```rtf
{\rtf1\ansi\deff0
{\ftnsep \pard\plain\fs18 \chftnsep \par}
{\ftnsepc \pard\plain\fs18 \chftnsepc \par}
{\ftncn \pard\plain\fs18 Footnotes continued:\par}

Document content with footnotes...\par
}
```

#### Separator Controls

| Control Word | Description                   |
| ------------ | ----------------------------- |
| `\ftnsep`    | Footnote separator text       |
| `\ftnsepc`   | Continuation separator        |
| `\ftncn`     | Continuation notice           |
| `\chftnsep`  | Separator anchor character    |
| `\chftnsepc` | Continuation anchor character |

---

## Cross-References and Fields

### Field Structure

All navigation elements can be implemented through RTF fields:

```rtf
{\field{\*\fldinst field-instruction}{\fldrslt field-result}}
```

### Field Modifiers

| Control Word | Description                               |
| ------------ | ----------------------------------------- |
| `\flddirty`  | Field result needs updating               |
| `\fldedit`   | Field result was edited                   |
| `\fldlock`   | Field is locked from updates              |
| `\fldpriv`   | Result not suitable for display           |
| `\fldalt`    | Use endnote reference instead of footnote |

### Reference Field Types

#### Cross-Reference Fields

| Field Type | Description                |
| ---------- | -------------------------- |
| `PAGEREF`  | Page number of bookmark    |
| `REF`      | Text content of bookmark   |
| `NOTEREF`  | Footnote/endnote number    |
| `STYLEREF` | Content of specified style |

### Cross-Reference Examples

#### Page Reference

```rtf
See page {\field{\*\fldinst PAGEREF conclusion}{\fldrslt 15}}
for the conclusion.
```

#### Content Reference

```rtf
As stated in {\field{\*\fldinst REF chapter1_title}
{\fldrslt "Introduction"}}, the topic is complex.
```

#### Footnote Reference

```rtf
Reference {\field{\*\fldinst NOTEREF footnote1}{\fldrslt 1}}
provides additional detail.
```

#### Style Reference

```rtf
Current chapter: {\field{\*\fldinst STYLEREF "Heading 1"}
{\fldrslt "Chapter 3: Analysis"}}
```

### Additional Field Types

#### Document Fields

| Field Type    | Description               |
| ------------- | ------------------------- |
| `DOCVARIABLE` | Document variable content |
| `DOCPROPERTY` | Document property values  |
| `FILENAME`    | Current file name         |
| `FILESIZE`    | Current file size         |

#### Date/Time Fields

| Field Type   | Description            |
| ------------ | ---------------------- |
| `DATE`       | Current date           |
| `TIME`       | Current time           |
| `CREATEDATE` | Document creation date |
| `PRINTDATE`  | Last print date        |
| `SAVEDATE`   | Last save date         |

#### Sequence Fields

| Field Type | Description      |
| ---------- | ---------------- |
| `SEQ`      | Sequence counter |
| `LISTNUM`  | List numbering   |

#### Include Fields

| Field Type       | Description             |
| ---------------- | ----------------------- |
| `INCLUDETEXT`    | Include text from file  |
| `INCLUDEPICTURE` | Include image from file |

### Document Variables

Document variables enable dynamic content:

```rtf
{\field{\*\fldinst DOCVARIABLE "CompanyName"}{\fldrslt "Acme Corp"}}
{\field{\*\fldinst SEQ chapter}{\fldrslt 1}}
{\field{\*\fldinst DATE \\@ "MMMM d, yyyy"}{\fldrslt January 15, 2024}}
```

## Comments and Annotations

RTF comments (annotations) provide review and annotation capabilities. Comments have two parts: the author ID (introduced by `\atnid`) and the comment text (introduced by `\annotation`). There is no group enclosing both parts. Each part of the comment is an RTF destination. Comments are anchored to the character that immediately precedes the comment.

**Important**: Microsoft products do not support comments within headers, footers, or footnotes. Placing a comment within these areas may result in a corrupted document.

### Comment Controls

| Control Word    | Description                                       |
| --------------- | ------------------------------------------------- |
| `\*\atnid`      | Author ID/initials for comment                    |
| `\*\atnauthor`  | Full author name for comment                      |
| `\chatn`        | Annotation reference character                    |
| `\*\annotation` | Annotation/comment definition (contains the text) |
| `\*\atnref`     | Annotation reference number                       |
| `\*\atndate`    | Comment creation date (Unix timestamp)            |
| `\*\atntime`    | Comment creation time (structured time)           |
| `\*\atnparent`  | Parent annotation ID (for threaded comments)      |
| `\*\atnicn`     | Annotation icon (picture)                         |
| `\*\atrfstart`  | Start of annotation bookmark reference            |
| `\*\atrfend`    | End of annotation bookmark reference              |

### Annotation Bookmarks

If an annotation is associated with an annotation bookmark, the following two destination control words precede and follow the bookmark. The alphanumeric string N (such as a long integer) represents the bookmark name:

```rtf
{\*\atrfstart N}
...bookmarked content...
{\*\atrfend N}
```

### Basic Comment Example

```rtf
{\rtf1\ansi\deff0
{\fonttbl{\f0\froman Times New Roman;}}
An example of a paradigm might be Darwinian biology.
{\*\atnid JD}{\*\atnauthor John Doe}\chatn
{\*\annotation{\*\atndate 1180187342}{\*\atnref 1}
\pard\plain How about some examples that deal with social science?
That is what this paper is about.\par
}
}
```

### Comment with Time Stamp

```rtf
{\rtf1\ansi\deff0
This text has a detailed comment.
{\*\atnid AB}{\*\atnauthor Alice Brown}
{\*\atntime\yr2024\mo1\dy15\hr10\min30\sec0}\chatn
{\*\annotation{\*\atndate 1705315800}{\*\atnref 1}
\pard\plain This needs clarification.\par
}
}
```

### Threaded Comments (Reply to Comment)

```rtf
{\rtf1\ansi\deff0
Original text with comment.
{\*\atnid CD}{\*\atnauthor Carol Davis}\chatn
{\*\annotation{\*\atndate 1705315800}{\*\atnref 1}
\pard\plain First comment.\par
}

Reply to the comment.
{\*\atnid EF}{\*\atnauthor Eve Foster}\chatn
{\*\annotation{\*\atndate 1705319400}{\*\atnref 2}
{\*\atnparent CD}
\pard\plain Reply to first comment.\par
}
}
```

## Implementation Guidelines

### For RTF Writers:

1. **Unique naming**: Ensure bookmark names are unique and descriptive
2. **Field consistency**: Always provide meaningful field results
3. **Proper nesting**: Don't overlap bookmarks or embed fields incorrectly
4. **Update fields**: Mark fields as `\flddirty` when content changes
5. **Color consistency**: Use standard colors for hyperlinks

### Best Practices:

1. **Meaningful bookmarks**: Create bookmarks at logical content divisions
2. **Footnote consistency**: Use consistent formatting and numbering
3. **Cross-reference validation**: Ensure referenced bookmarks exist

### Navigation Testing:

1. **Link verification**: Test all hyperlinks and cross-references
2. **Bookmark accuracy**: Verify bookmarks navigate correctly
3. **Footnote formatting**: Ensure footnotes display and number properly
4. **Field updates**: Test field recalculation in target applications
