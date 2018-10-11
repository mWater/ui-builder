/// <reference types="react" />
import CompoundBlock from '../../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../../blocks';
import { LocalizedString } from '../../localization';
export interface TabbedBlockTab {
    /** Unique id for tab */
    id: string;
    label: LocalizedString | null;
    content: BlockDef | null;
}
export interface TabbedBlockDef extends BlockDef {
    type: "tabs";
    tabs: TabbedBlockTab[];
}
/** Tabbed control */
export declare class TabbedBlock extends CompoundBlock<TabbedBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
