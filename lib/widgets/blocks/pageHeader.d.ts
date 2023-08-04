/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { DesignCtx, InstanceCtx } from "../../contexts";
/** Page header with line underneath and back button/close button if appropriate */
export interface PageHeaderBlockDef extends BlockDef {
    type: "page-header";
    child: BlockDef | null;
}
export declare class PageHeaderBlock extends Block<PageHeaderBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(ctx: InstanceCtx): JSX.Element;
}
