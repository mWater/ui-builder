import * as React from "react";
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { DesignCtx, InstanceCtx } from "../../contexts";
/** Floats some content either right or left of main content */
export interface FloatBlockDef extends BlockDef {
    type: "float";
    /** Which way to float the float content */
    direction: "left" | "right";
    /** Which way to vertically align */
    verticalAlign: "top" | "middle" | "bottom";
    /** Main content of block */
    mainContent: BlockDef | null;
    /** Floated content of block */
    floatContent: BlockDef | null;
}
export declare class FloatBlock extends Block<FloatBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
