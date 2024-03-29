import * as React from "react";
import { Block, BlockDef, ContextVar, ChildBlock } from "../../blocks";
import { Expr, LocalizedString } from "mwater-expressions";
import "./toc.css";
import { DesignCtx, InstanceCtx } from "../../../contexts";
import { ContextVarExpr } from "../../../ContextVarExpr";
import { EmbeddedExpr } from "../../../embeddedExprs";
/** Table of contents with nested items each showing a different widget in main area */
export interface TOCBlockDef extends BlockDef {
    type: "toc";
    /** Nestable items in the table of contents */
    items: TOCItem[];
    /** Optional header */
    header: BlockDef | null;
    /** Optional footer */
    footer: BlockDef | null;
    /** Remove padding (for top-level TOC that should fit page completely) @deprecated */
    removePadding?: boolean;
    /** Theme (default is light) */
    theme?: "light" | "dark";
    /** Width at which TOC collapses */
    collapseWidth?: number;
}
/** An item within the table of contents */
export interface TOCItem {
    /** uuid id */
    id: string;
    /** Label to be displayed for entry */
    labelBlock?: BlockDef | null;
    /** DEPRECATED: Localized label. Use labelBlock @deprecated */
    label?: LocalizedString;
    /** Localized title of page */
    title?: LocalizedString | null;
    /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
    titleEmbeddedExprs?: EmbeddedExpr[];
    /** Widget to be displayed when the item is selected */
    widgetId?: string | null;
    /** Maps widgets' context variable ids to external ones */
    contextVarMap?: {
        [internalContextVarId: string]: string;
    };
    /** Any children items */
    children: TOCItem[];
    /** Optional condition for display */
    condition?: ContextVarExpr;
    /** Collapse behaviour. Default is expanded */
    collapse?: "expanded" | "startCollapsed" | "startExpanded";
    /** Width at which TOC item collapses. Only for startExpanded */
    collapseWidth?: number;
}
/** Create a flat list of all items */
export declare const iterateItems: (items: TOCItem[]) => TOCItem[];
/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
export declare const alterItems: (items: TOCItem[], action: (item: TOCItem) => undefined | null | TOCItem | TOCItem[]) => TOCItem[];
export declare class TOCBlock extends Block<TOCBlockDef> {
    /** Get child blocks */
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    /** Get any context variables expressions that this block needs (not including child blocks) */
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    /** Validate a single TOC item */
    validateItem(designCtx: DesignCtx, tocItem: TOCItem): string | null;
    validate(designCtx: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Canonicalize the block definition. Should be done after operations on the block are completed. Only alter self, not children.
     * Can also be used to upgrade blocks
     */
    canonicalize(): BlockDef | null;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
