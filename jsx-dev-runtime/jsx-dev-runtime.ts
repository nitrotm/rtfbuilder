/** `<Comment>…</Comment>` will be converted into `<!--…-->` */
export const Comment = () => undefined

/** `<CData>…</CData>` will be converted into `<![CDATA[…]]>` */
export const CData = () => undefined

/** stringifies a JSX tree */
export const jsx = (name: string | ((props: unknown) => unknown), { children, ...props }: Record<string, unknown>) => {
  let propsString = Object.entries(props)
    .map(([k, v]) => `${k}=${JSON.stringify(`${v}`)}`)
    .join(" ")
  propsString &&= ` ${propsString}`

  const childrenString = Array.isArray(children) ? children.flat(Infinity).join("") : children || ""

  // JSX fragment
  if (name === undefined) return childrenString

  // special components
  if (name === Comment) return `<!--${children}-->`
  if (name === CData) return `<![CDATA[${children}]]>`

  // custom components
  if (typeof name === "function") {
    return name({ children, ...props })
  }

  return childrenString ? `<${name}${propsString}>${childrenString}</${name}>` : `<${name}${propsString} />`
}

export { jsx as jsxs, jsx as jsxDEV }
