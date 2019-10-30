import { BlockDef, ContextVar } from "../widgets/blocks";
import React from "react";
export interface BlockPaletteEntry {
    title: string;
    subtitle?: string;
    blockDef: BlockDef | ((contextVars: ContextVar[]) => BlockDef);
    /** Element to display instead of design view */
    elem?: React.ReactElement<any>;
}
export declare const defaultBlockPaletteEntries: BlockPaletteEntry[];
