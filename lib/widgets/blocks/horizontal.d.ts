import React from "react";
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { DesignCtx, InstanceCtx } from "../../contexts";
export interface HorizontalBlockDef extends BlockDef {
    type: "horizontal";
    items: BlockDef[];
    /** How to align child blocks. Default is "justify" */
    align?: "justify" | "right" | "left" | "center";
    /** How to vertically align child blocks. Default is top */
    verticalAlign?: "top" | "middle" | "bottom";
    /** Column widths in CSS grid format (e.g. "min-content", "50%", "30px")
     * If not present, defaults to 1fr for justify, auto otherwise.
     */
    columnWidths?: string[];
    /** Responsive breaks. Array with one entry for each gap (e.g. entry 0 is for gap between column 0 and 1, etc.)
     * If present, is the width of the horizontal block at which a line break is added
     */
    responsiveBreaks?: (number | null)[];
}
export declare class HorizontalBlock extends Block<HorizontalBlockDef> {
    get id(): string;
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    canonicalize(): BlockDef | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderBlock(children: React.ReactNode[], width: number): JSX.Element;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
    getLabel(): string;
}
