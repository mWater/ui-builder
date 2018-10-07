import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from '../blocks';
import { LocalizedString } from '../localization';
import { Expr } from 'mwater-expressions';
/** Expression which is embedded in the text string */
interface EmbeddedExpr {
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression to be displayed */
    expr: Expr;
    /** d3 format of expression for numbers */
    format: string | null;
}
export interface TextBlockDef extends BlockDef {
    type: "text";
    /** Text content */
    text: LocalizedString | null;
    style: "p" | "div" | "h1" | "h2" | "h3" | "h4";
    /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
    embeddedExprs?: EmbeddedExpr[];
}
export declare class TextBlock extends LeafBlock<TextBlockDef> {
    getContextVarExprs(contextVar: ContextVar): Expr[];
    validate(options: ValidateBlockOptions): string | null;
    renderDesign(props: RenderDesignProps): React.DetailedReactHTMLElement<{}, HTMLElement>;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
export {};
