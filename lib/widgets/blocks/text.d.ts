import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from '../blocks';
import { Expr, LocalizedString } from 'mwater-expressions';
import { EmbeddedExpr } from '../../embeddedExprs';
export interface TextBlockDef extends BlockDef {
    type: "text";
    /** Text content */
    text: LocalizedString | null;
    style: "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5";
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
    embeddedExprs?: EmbeddedExpr[];
    /** How to align text. Default is left */
    align?: "left" | "center" | "right" | "justify";
    /** Color of text. Default is no coloring */
    color?: null | "muted" | "primary" | "success" | "info" | "warning" | "danger";
    /** True to make multiple lines break */
    multiline?: boolean;
}
export declare class TextBlock extends LeafBlock<TextBlockDef> {
    getContextVarExprs(contextVar: ContextVar): Expr[];
    validate(options: ValidateBlockOptions): string | null;
    getClassName(): string;
    renderText(content: React.ReactNode): React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
        className: string;
    }, HTMLElement>;
    renderDesign(props: RenderDesignProps): React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
        className: string;
    }, HTMLElement>;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
