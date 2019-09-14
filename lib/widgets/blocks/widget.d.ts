import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, CreateBlock, Filter, RenderEditorProps, ContextVar, ValidateBlockOptions } from '../blocks';
import { Expr } from 'mwater-expressions';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
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
    getInitialFilters(contextVarId: string, widgetLibrary: WidgetLibrary): Filter[];
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    /** Maps variables in an expression from inner variable names to outer ones */
    mapInnerToOuterVariables(expr: Expr): Expr;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
export declare const mapObjectTree: (obj: any, mapping: (input: any) => any) => any;
