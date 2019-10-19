import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, ContextVar } from '../blocks';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
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
    /** Color of text. Default is no coloring */
    color?: null | "muted" | "primary" | "success" | "info" | "warning" | "danger";
    /** How to align text. Default is left */
    align?: "left" | "center" | "right" | "justify";
    /** True to make multiple lines break */
    multiline?: boolean;
}
export declare class ExpressionBlock extends LeafBlock<ExpressionBlockDef> {
    getContextVarExprs(contextVar: ContextVar): Expr[];
    validate(options: DesignCtx): string | null;
    renderDesign(props: DesignCtx): JSX.Element;
    getClassName(): string;
    getStyle(): React.CSSProperties;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
