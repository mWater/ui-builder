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
    color?: null | "muted" | "primary" | "success" | "info" | "warning" | "danger";
    /** How to align text. Default is left */
    align?: "left" | "center" | "right" | "justify";
    /** True to make multiple lines break. No effect if markdown is true */
    multiline?: boolean;
    /** True to interpret as markdown */
    markdown?: boolean;
}
export declare abstract class TextualBlock<T extends TextualBlockDef> extends LeafBlock<T> {
    getClassName(): string;
    /** Gets applied styles as CSS properties */
    getStyle(): React.CSSProperties;
    /** Renders content with the appropriate styling. If markdown, should already be processed */
    renderText(content: React.ReactNode): React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
        className: string;
    }, HTMLElement>;
    /** Processes markdown if markdown is turned on, otherwise passthrough */
    processMarkdown(text: string): string | JSX.Element;
    renderTextualEditor(props: DesignCtx): JSX.Element;
}
