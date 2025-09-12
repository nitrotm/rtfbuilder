# Advanced Formatting

This section covers advanced OOXML formatting features including custom styles, complex borders, positioned objects, and advanced text formatting.

## Overview

Advanced OOXML formatting extends beyond basic paragraph and character formatting to include:

- **Custom style definitions** - Complex style hierarchies and inheritance
- **Advanced borders and shading** - Complex border patterns and gradients  
- **Positioned objects** - Text boxes, shapes, and floating elements
- **Complex typography** - Advanced text effects and formatting
- **Custom XML mapping** - Structured data integration

## Style Sheets

Advanced style definitions provide sophisticated formatting control and reusability.

### Style Inheritance

```xml
<w:style w:type="paragraph" w:styleId="CustomHeading">
  <w:name w:val="Custom Heading"/>
  <w:basedOn w:val="Heading1"/>  <!-- Inherit from Heading1 -->
  <w:next w:val="Normal"/>       <!-- Next paragraph style -->
  <w:rPr>
    <w:color w:val="0070C0"/>    <!-- Override color only -->
  </w:rPr>
</w:style>
```

### Linked Styles

```xml
<w:style w:type="paragraph" w:styleId="CustomPara">
  <w:name w:val="Custom Para"/>
  <w:link w:val="CustomParaChar"/>  <!-- Link to character style -->
  <w:pPr>
    <w:spacing w:before="120" w:after="120"/>
  </w:pPr>
</w:style>

<w:style w:type="character" w:styleId="CustomParaChar">
  <w:name w:val="Custom Para Char"/>
  <w:link w:val="CustomPara"/>      <!-- Link back to paragraph style -->
  <w:rPr>
    <w:sz w:val="22"/>
  </w:rPr>
</w:style>
```

## Advanced Borders and Shading

### Complex Border Patterns

```xml
<w:pPr>
  <w:pBdr>
    <w:top w:val="wave" w:sz="6" w:space="4" w:color="4F81BD" w:themeColor="accent1"/>
    <w:bottom w:val="dashSmallGap" w:sz="4" w:space="1" w:color="auto"/>
  </w:pBdr>
</w:pPr>
```

**Advanced border styles:**
- `wave` - Wavy line
- `dashSmallGap` - Small dashed line
- `dotDotDash` - Dot-dot-dash pattern
- `threeDEmboss` - 3D embossed effect
- `threeDEngrave` - 3D engraved effect

### Gradient Shading

```xml
<w:pPr>
  <w:shd w:val="pct20" w:color="4F81BD" w:fill="D5DFEC" w:themeFill="accent1" w:themeFillTint="33"/>
</w:pPr>
```

### Theme Color Integration

```xml
<w:rPr>
  <w:color w:val="auto" w:themeColor="accent1" w:themeShade="80"/>
  <w:highlight w:val="none" w:themeColor="accent2" w:themeTint="40"/>
</w:rPr>
```

## Text Effects and Typography

### Basic Character Effects

```xml
<w:rPr>
  <w:b/>                         <!-- Bold text -->
  <w:i/>                         <!-- Italic text -->
  <w:u w:val="single"/>          <!-- Underline -->
  <w:strike/>                    <!-- Strikethrough -->
  <w:vertAlign w:val="superscript"/> <!-- Superscript/subscript -->
  <w:smallCaps/>                 <!-- Small capitals -->
  <w:caps/>                      <!-- All capitals -->
</w:rPr>
```

### Text Borders and Shading

```xml
<w:rPr>
  <w:bdr w:val="single" w:sz="4" w:space="0" w:color="FF0000"/>
  <w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/>
</w:rPr>
```


## Positioned Objects and Frames



## Section Layout Features

### Multi-Column Text

```xml
<w:sectPr>
  <w:cols w:space="708" w:num="2" w:equalWidth="1">
    <w:col w:w="3168" w:space="354"/>
    <w:col w:w="3168" w:space="0"/>
  </w:cols>
</w:sectPr>
```


## Implementation Guidelines

### Performance Optimization:

1. **Style reuse**: Minimize direct formatting, use styles extensively
2. **Theme integration**: Use theme colors for consistent appearance
3. **Efficient positioning**: Use simple positioning over complex anchoring
4. **Content control planning**: Design data binding architecture early

### Cross-Platform Compatibility:

1. **Test complex features**: Verify advanced formatting across applications
2. **Fallback strategies**: Provide simpler alternatives for unsupported features  
3. **Standard compliance**: Follow OOXML standards strictly for complex elements
4. **Version targeting**: Consider target application capabilities