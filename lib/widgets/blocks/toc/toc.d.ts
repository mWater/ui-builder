import * as React from 'react';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ContextVar, ChildBlock } from '../../blocks';
import CompoundBlock from '../../CompoundBlock';
import { LocalizedString } from 'mwater-expressions';
/** Table of contents with nested items each showing a different widget in main area */
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
export interface TOCItem {
    /** uuid id */
    id: string;
    /** Localized label */
    label: LocalizedString;
    /** Widget to be displayed when the item is selected */
    widgetId?: string | null;
    /** Maps widgets' context variable ids to external ones */
    /** Any children items */
    children: TOCItem[];
}
/** Create a flat list of all items */
export declare const iterateItems: (items: TOCItem[]) => TOCItem[];
/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
export declare const alterItems: (items: TOCItem[], action: (item: TOCItem) => TOCItem | TOCItem[] | null | undefined) => TOCItem[];
export declare class TOCBlock extends CompoundBlock<TOCBlockDef> {
    /** Get child blocks */
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
}
