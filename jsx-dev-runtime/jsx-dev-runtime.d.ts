export declare const Comment: () => undefined;
export declare const CData: () => undefined;
declare class XmlComment {
    content: unknown;
    constructor(content: unknown);
    toString(): string;
}
declare class XmlCData {
    content: unknown;
    constructor(content: unknown);
    toString(): string;
}
declare class XmlFragment {
    children: (Element | XmlComment | XmlCData | string)[];
    constructor(children: (Element | XmlComment | XmlCData | string)[]);
    toString(): string;
}
export declare const jsx: (name: string | ((props: unknown) => unknown), { children, ...props }: Record<string, unknown>) => XmlFragment | XmlComment | XmlCData;
export { jsx as jsxs, jsx as jsxDEV };
