import * as React from 'react';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks';
import CompoundBlock from '../CompoundBlock';
import { LocalizedString } from 'mwater-expressions';
/** Table of contents with nested items each showing a different block in main area */
export interface TOCBlockDef extends BlockDef {
    type: "toc";
    /** Nestable items in the table of contents */
    items: TOCItem[];
    /** Optional header */
    header: BlockDef | null;
    /** Optional footer */
    footer: BlockDef | null;
}
/** An item within the table of contents */
interface TOCItem {
    /** uuid id */
    id: string;
    /** Localized label */
    label: LocalizedString;
    /** Content to be displayed when the item is selected */
    content: BlockDef | null;
    /** Any children items */
    children: TOCItem[];
}
export declare class TOCBlock extends CompoundBlock<TOCBlockDef> {
    /** Get child blocks */
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
}
export {};
