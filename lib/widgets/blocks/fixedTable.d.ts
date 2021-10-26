import * as React from "react";
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { DesignCtx, InstanceCtx } from "../../contexts";
/** Table with a fixed number of rows and columns */
export interface FixedTableBlockDef extends BlockDef {
    type: "fixedTable";
    /** Borders (default is "horizontal") */
    borders?: "horizontal" | "all" | "none";
    /** Table padding (default is "normal") */
    padding?: "normal" | "compact";
    /** Number of rows in the table */
    numRows: number;
    /** Number of columns in the table */
    numColumns: number;
    /** Rows of the table */
    rows: FixedTableRowDef[];
    /** Columns of the table (not the blocks, just information) */
    columns?: FixedTableColumnDef[];
}
/** Single row of a table */
interface FixedTableRowDef {
    /** Cells of the row */
    cells: FixedTableCellDef[];
}
interface FixedTableCellDef {
    content: BlockDef | null;
}
/** Single column of a table */
interface FixedTableColumnDef {
    columnWidth: string;
}
export declare class FixedTableBlock extends Block<FixedTableBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
/** Function to set the number of rows, adding/removing as necessary */
export declare function setNumRows(blockDef: FixedTableBlockDef, numRows: number): FixedTableBlockDef;
/** Function to set the number of columns, adding/removing as necessary */
export declare function setNumColumns(blockDef: FixedTableBlockDef, numColumns: number): FixedTableBlockDef;
export {};
