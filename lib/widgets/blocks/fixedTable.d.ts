import * as React from 'react';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ContextVar, ChildBlock } from '../blocks';
import CompoundBlock from '../CompoundBlock';
/** Table with a fixed number of rows and columns */
export interface FixedTableBlockDef extends BlockDef {
    type: "fixedTable";
    /** Style of borders around the cells */
    cellBorders: "default";
    /** Padding of the cells */
    cellPadding: "default" | "condensed";
    /** Number of rows in the table */
    numRows: number;
    /** Number of columns in the table */
    numColumns: number;
    /** Rows of the table */
    rows: FixedTableRowDef[];
}
/** Single row of a table */
interface FixedTableRowDef {
    /** Cells of the row */
    cells: FixedTableCellDef[];
}
interface FixedTableCellDef {
    content: BlockDef | null;
}
export declare class FixedTableBlock extends CompoundBlock<FixedTableBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
/** Function to set the number of rows, adding/removing as necessary */
export declare function setNumRows(blockDef: FixedTableBlockDef, numRows: number): FixedTableBlockDef;
/** Function to set the number of columns, adding/removing as necessary */
export declare function setNumColumns(blockDef: FixedTableBlockDef, numColumns: number): FixedTableBlockDef;
export {};
