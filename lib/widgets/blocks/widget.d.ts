import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, CreateBlock, RenderEditorProps, ContextVar } from '../blocks';
export interface WidgetBlockDef extends BlockDef {
    widgetId: string | null;
    contextVarMap: {
        [contextVarId: string]: string;
    };
}
export declare class WidgetBlock extends LeafBlock<WidgetBlockDef> {
    createBlock: CreateBlock;
    constructor(blockDef: WidgetBlockDef, createBlock: CreateBlock);
    validate(): "Widget required" | null;
    getContextVarExprs(contextVar: ContextVar): never[];
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
