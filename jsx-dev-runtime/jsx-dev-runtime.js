export const Comment = () => undefined;
export const CData = () => undefined;
function encodeXmlAttribute(value) {
    return value
        .substring(1, value.length - 1)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
function encodeXmlContent(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
class XmlComment {
    content;
    constructor(content) {
        this.content = content;
    }
    toString() {
        return `<!--${this.content}-->`;
    }
}
class XmlCData {
    content;
    constructor(content) {
        this.content = content;
    }
    toString() {
        return `<![CDATA[${this.content}]]>`;
    }
}
class XmlFragment {
    children;
    constructor(children) {
        this.children = children;
    }
    toString() {
        return this.children.map((child) => (typeof child === "string" ? encodeXmlContent(child) : child.toString())).join("");
    }
}
class XmlElement extends XmlFragment {
    name;
    props;
    constructor(name, props, children) {
        super(children);
        this.name = name;
        this.props = props;
    }
    toString() {
        let propsString = Object.entries(this.props)
            .map(([k, v]) => `${k}="${encodeXmlAttribute(JSON.stringify(`${v}`))}"`)
            .join(" ");
        const childrenString = super.toString();
        propsString &&= ` ${propsString}`;
        return childrenString ? `<${this.name} ${propsString}>${childrenString}</${this.name}>` : `<${this.name} ${propsString} />`;
    }
}
export const jsx = (name, { children, ...props }) => {
    if (name === undefined)
        return new XmlFragment(children ? (Array.isArray(children) ? children : [children]) : []);
    if (name === Comment)
        return new XmlComment(children);
    if (name === CData)
        return new XmlCData(children);
    if (typeof name === "function") {
        throw new Error("Custom components are not supported in this JSX runtime.");
    }
    return new XmlElement(name, props, children ? (Array.isArray(children) ? children : [children]) : []);
};
export { jsx as jsxs, jsx as jsxDEV };
