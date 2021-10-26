/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { DesignCtx, InstanceCtx } from "../../contexts";
/** Alert box */
export interface AlertBlockDef extends BlockDef {
    type: "alert";
    content: BlockDef | null;
    style: "success" | "info" | "warning" | "danger";
}
export declare class AlertBlock extends Block<AlertBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(designCtx: DesignCtx): JSX.Element;
}
