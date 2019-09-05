import { BlockDef } from "../widgets/blocks";
import React from "react";
export interface BlockPaletteEntry {
    title: string;
    blockDef: BlockDef;
    /** Element to display instead of design view */
    elem?: React.ReactElement<any>;
}
export declare const defaultBlockPaletteEntries: BlockPaletteEntry[];
