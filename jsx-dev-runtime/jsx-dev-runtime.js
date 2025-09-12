export const Comment = () => undefined;
export const CData = () => undefined;
export const jsx = (name, { children, ...props }) => {
    let propsString = Object.entries(props)
        .map(([k, v]) => `${k}=${JSON.stringify(`${v}`)}`)
        .join(" ");
    propsString &&= ` ${propsString}`;
    const childrenString = Array.isArray(children) ? children.flat(Infinity).join("") : children || "";
    if (name === undefined)
        return childrenString;
    if (name === Comment)
        return `<!--${children}-->`;
    if (name === CData)
        return `<![CDATA[${children}]]>`;
    if (typeof name === "function") {
        return name({ children, ...props });
    }
    return childrenString ? `<${name}${propsString}>${childrenString}</${name}>` : `<${name}${propsString} />`;
};
export { jsx as jsxs, jsx as jsxDEV };
