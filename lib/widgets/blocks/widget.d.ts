import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, CreateBlock, RenderEditorProps, ContextVar, ValidateBlockOptions } from '../blocks';
import { Expr } from 'mwater-expressions';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
export interface WidgetBlockDef extends BlockDef {
    widgetId: string | null;
    contextVarMap: {
        [internalContextVarId: string]: string;
    };
}
export declare class WidgetBlock extends LeafBlock<WidgetBlockDef> {
    createBlock: CreateBlock;
    constructor(blockDef: WidgetBlockDef, createBlock: CreateBlock);
    validate(options: ValidateBlockOptions): "Widget required" | "Missing context variable in mapping" | null;
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
