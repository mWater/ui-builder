import * as React from 'react';
import CompoundBlock from '../../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, ValidateBlockOptions } from '../../blocks';
import { Expr, Schema, LocalizedString, Row } from 'mwater-expressions';
import { OrderBy } from '../../../database/Database';
import { WidgetLibrary } from '../../../designer/widgetLibrary';
import { ActionLibrary } from '../../ActionLibrary';
export interface QueryRepeatBlockDef extends BlockDef {
    type: "queryRepeat";
    /** Contents to repeat */
    content: BlockDef | null;
    /** Separator between items */
    separator: "none" | "solid_line" | "page_break";
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    limit: number | null;
    where: Expr;
    orderBy: OrderBy[] | null;
    /** Message to display when there are no rows */
    noRowsMessage?: LocalizedString | null;
}
export declare class QueryRepeatBlock extends CompoundBlock<QueryRepeatBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(options: ValidateBlockOptions): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Create the context variable used */
    createRowContextVar(rowsetCV: ContextVar): ContextVar;
    getRowContextVarId(): string;
    /** Get list of expressions used in a row by content blocks */
    getRowExprs(contextVars: ContextVar[], widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    getRowContextVarValue(row: Row, rowExprs: Expr[], schema: Schema, rowsetCV: ContextVar, contextVars: ContextVar[]): any;
    renderDesign(props: RenderDesignProps): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
