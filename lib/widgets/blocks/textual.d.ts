import { BlockDef } from "../blocks";
import LeafBlock from "../LeafBlock";
import React from "react";
import { DesignCtx } from "../../contexts";
/** Common base class for text and expression */
export interface TextualBlockDef extends BlockDef {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    /** Default is div */
    style?: "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5";
    /** Color of text. Default is no coloring */
    color?: null | "muted" | "primary" | "success" | "info" | "warning";
    /** How to align text. Default is left */
    align?: "left" | "center" | "right" | "justify";
    /** True to make multiple lines break */
    multiline?: boolean;
}
export declare abstract class TextualBlock<T extends TextualBlockDef> extends LeafBlock<T> {
    getClassName(): string;
    getStyle(): React.CSSProperties;
    renderText(content: React.ReactNode): React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
        className: string;
    }, HTMLElement>;
    renderTextualEditor(props: DesignCtx): JSX.Element;
}
