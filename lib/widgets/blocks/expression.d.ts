import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ContextVar, ValidateBlockOptions } from '../blocks';
import { Expr } from 'mwater-expressions';
export interface ExpressionBlockDef extends BlockDef {
    type: "expression";
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression to be displayed */
    expr: Expr;
    /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll)  */
    format: string | null;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    /** How to align text. Default is left */
    align?: "left" | "center" | "right" | "justify";
    /** True to make multiple lines break */
    multiline?: boolean;
}
export declare class ExpressionBlock extends LeafBlock<ExpressionBlockDef> {
    getContextVarExprs(contextVar: ContextVar): Expr[];
    validate(options: ValidateBlockOptions): string | null;
    renderDesign(props: RenderDesignProps): JSX.Element;
    getStyle(): React.CSSProperties;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
