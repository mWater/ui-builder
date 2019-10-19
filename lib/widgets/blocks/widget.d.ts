import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, CreateBlock, Filter, ContextVar, ValidateBlockOptions } from '../blocks';
import { Expr } from 'mwater-expressions';
import { InstanceCtx, DesignCtx } from '../../contexts';
/** Block which contains a widget */
export interface WidgetBlockDef extends BlockDef {
    widgetId: string | null;
    contextVarMap: {
        [internalContextVarId: string]: string;
    };
}
export declare class WidgetBlock extends LeafBlock<WidgetBlockDef> {
    createBlock: CreateBlock;
    constructor(blockDef: WidgetBlockDef, createBlock: CreateBlock);
    validate(options: ValidateBlockOptions): "Widget required" | "Invalid widget" | "Missing context variable in mapping" | null;
    getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[];
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    /** Maps variables in an expression from inner variable names to outer ones */
    mapInnerToOuterVariables(expr: Expr): Expr;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
export declare const mapObjectTree: (obj: any, mapping: (input: any) => any) => any;
