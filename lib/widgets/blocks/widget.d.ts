import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, Filter, ContextVar } from '../blocks';
import { Expr } from 'mwater-expressions';
import { InstanceCtx, DesignCtx } from '../../contexts';
/** Block which contains a widget */
export interface WidgetBlockDef extends BlockDef {
    type: "widget";
    widgetId: string | null;
    contextVarMap: {
        [internalContextVarId: string]: string;
    };
}
export declare class WidgetBlock extends LeafBlock<WidgetBlockDef> {
    validate(options: DesignCtx): "Widget required" | "Invalid widget" | "Missing context variable in mapping" | null;
    getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[];
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    /** Maps variables in an expression from inner variable names to outer ones */
    mapInnerToOuterVariables(expr: Expr): Expr;
    /** Maps variables in an expression from outer variable names to inner ones */
    mapOuterToInnerVariables(expr: Expr): Expr;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
export declare const mapObjectTree: (obj: any, mapping: (input: any) => any) => any;
