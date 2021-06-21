/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from '../../blocks';
import { LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../../contexts';
export interface TabbedBlockTab {
    /** Unique id for tab */
    id: string;
    /** Label for tab */
    label: LocalizedString | null;
    content: BlockDef | null;
}
export interface TabbedBlockDef extends BlockDef {
    type: "tabbed";
    /** Tabs to use */
    tabs: TabbedBlockTab[];
    /** Width at which tabs collapse */
    collapseWidth?: number;
}
/** Tabbed control */
export declare class TabbedBlock extends Block<TabbedBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
