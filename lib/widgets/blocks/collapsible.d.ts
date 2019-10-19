/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, ContextVar, ChildBlock } from '../blocks';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface CollapsibleBlockDef extends BlockDef {
    type: "collapsible";
    label: BlockDef | null;
    content: BlockDef | null;
    /** True if collapsible section is initially collapsed */
    initialCollapsed?: boolean;
}
export declare class CollapsibleBlock extends CompoundBlock<CollapsibleBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
