/** `<Comment>…</Comment>` will be converted into `<!--…-->` */
export const Comment = () => undefined

/** `<CData>…</CData>` will be converted into `<![CDATA[…]]>` */
export const CData = () => undefined

/** `<>…</>` will be flattened */
export const Fragment = () => undefined

function encodeXmlAttribute(value: string): string {
  return value
    .substring(1, value.length - 1)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function encodeXmlContent(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

class XmlComment {
  constructor(public content: unknown) {}

  toString(): string {
    return `<!--${this.content}-->`
  }
}

class XmlCData {
  constructor(public content: unknown) {}

  toString(): string {
    return `<![CDATA[${this.content}]]>`
  }
}

class XmlFragment {
  constructor(public children: (Element | XmlComment | XmlCData | string | number | boolean)[]) {}

  toString(): string {
    return this.children
      .filter((child) => child !== undefined && child !== null && child !== false)
      .flatMap((child) => (Array.isArray(child) ? child : [child]))
      .map((child) => (typeof child === "string" ? encodeXmlContent(child) : child.toString()))
      .join("")
  }
}

class XmlElement extends XmlFragment {
  constructor(
    public name: string,
    public props: Record<string, unknown>,
    children: (Element | XmlComment | XmlCData | string | number | boolean)[]
  ) {
    super(children)
  }

  toString(): string {
    let propsString = Object.entries(this.props)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}="${encodeXmlAttribute(JSON.stringify(`${v}`))}"`)
      .join(" ")
    const childrenString = super.toString()

    propsString &&= ` ${propsString}`
    return childrenString ? `<${this.name}${propsString}>${childrenString}</${this.name}>` : `<${this.name}${propsString} />`
  }
}

/** stringifies a JSX tree */
export const jsx = (name: string | ((props: unknown) => unknown), { children, ...props }: Record<string, unknown>) => {
  // JSX fragment
  if (name === undefined || name === Fragment) return new XmlFragment(children ? (Array.isArray(children) ? children : [children]) : [])

  // special components
  if (name === Comment) return new XmlComment(children)
  if (name === CData) return new XmlCData(children)

  // custom components
  if (typeof name === "function") {
    throw new Error("Custom components are not supported in this JSX runtime.")
  }
  return new XmlElement(name, props, children ? (Array.isArray(children) ? children : [children]) : [])
}

export { jsx as jsxs }
