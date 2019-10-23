import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Panels with optional header and footer */
export interface PanelBlockDef extends BlockDef {
    type: "panel";
    /** Main content of block */
    mainContent: BlockDef | null;
    /** Top content of block. null is empty, undefined is not displayed in design mode */
    headerContent?: BlockDef | null;
    /** Bottom content of block. null is empty, undefined is not displayed in design mode */
    footerContent?: BlockDef | null;
}
export declare class PanelBlock extends Block<PanelBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
