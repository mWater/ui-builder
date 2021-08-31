import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../../blocks';
import { Expr, Schema, LocalizedString, Row } from 'mwater-expressions';
import { OrderBy } from '../../../database/Database';
import { DesignCtx, InstanceCtx } from '../../../contexts';
export interface QueryRepeatBlockDef extends BlockDef {
    type: "queryRepeat";
    /** Contents to repeat */
    content: BlockDef | null;
    /** Direction of repeat. Default is "vertical" */
    orientation?: "vertical" | "horizontal";
    /** Separator between vertical items */
    separator: "none" | "solid_line" | "page_break";
    /** Separator between horizontal items. Default 5px */
    horizontalSpacing?: number;
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    limit: number | null;
    where: Expr;
    orderBy: OrderBy[] | null;
    /** Message to display when there are no rows */
    noRowsMessage?: LocalizedString | null;
}
export declare class QueryRepeatBlock extends Block<QueryRepeatBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(options: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Create the context variable used */
    createRowContextVar(rowsetCV: ContextVar): ContextVar;
    getRowContextVarId(): string;
    /** Get list of expressions used in a row by content blocks */
    getRowExprs(contextVars: ContextVar[], ctx: DesignCtx | InstanceCtx): Expr[];
    getContextVarExprs(): Expr[];
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    getRowContextVarValue(row: Row, rowExprs: Expr[], schema: Schema, rowsetCV: ContextVar, contextVars: ContextVar[]): any;
    renderDesign(props: DesignCtx): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
