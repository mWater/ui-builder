/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks';
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
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
