import * as React from 'react';
import { ContextVar } from '../blocks';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { TextualBlockDef, TextualBlock } from './textual';
export interface ExpressionBlockDef extends TextualBlockDef {
    type: "expression";
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression to be displayed */
    expr: Expr;
    /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll)  */
    format: string | null;
}
export declare class ExpressionBlock extends TextualBlock<ExpressionBlockDef> {
    getContextVarExprs(contextVar: ContextVar): Expr[];
    validate(ctx: DesignCtx): string | null;
    renderDesign(props: DesignCtx): React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
        className: string;
    }, HTMLElement>;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
