/// <reference types="react" />
import CompoundBlock from '../../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, ValidateBlockOptions } from '../../blocks';
import { Expr, Schema } from 'mwater-expressions';
import { Row, OrderBy } from '../../../database/Database';
import { ActionDef } from '../../actions';
export interface QueryTableBlockDef extends BlockDef {
    type: "queryTable";
    /** Determines if one table row contains one or multiple database table rows */
    mode: "singleRow" | "multiRow";
    headers: Array<BlockDef | null>;
    contents: Array<BlockDef | null>;
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    limit: number | null;
    where: Expr;
    orderBy: OrderBy[] | null;
    /** Action to be executed when row is clicked */
    rowClickAction: ActionDef | null;
}
export declare class QueryTableBlock extends CompoundBlock<QueryTableBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(options: ValidateBlockOptions): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Create the context variable used */
    createRowContextVar(rowsetCV: ContextVar): ContextVar;
    getRowContextVarId(): string;
    /** Get list of expressions used in a row by content blocks */
    getRowExprs(contextVars: ContextVar[]): Expr[];
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     */
    getRowContextVarValue(row: Row, rowExprs: Expr[], schema: Schema, rowsetCV: ContextVar): any;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
