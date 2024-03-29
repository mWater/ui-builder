/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from "../../blocks";
import { Expr, Schema, LocalizedString, Row } from "mwater-expressions";
import { OrderBy } from "../../../database/Database";
import { ActionDef } from "../../actions";
import { DesignCtx, InstanceCtx } from "../../../contexts";
export interface QueryTableBlockDef extends BlockDef {
    type: "queryTable";
    /** Determines if one table row contains one or multiple database table rows */
    mode: "singleRow" | "multiRow";
    /** Content blocks. The length of this array determines number of columns */
    contents: Array<BlockDef | null>;
    /** Header blocks. Always same length as contents. */
    headers: Array<BlockDef | null>;
    /** Column information. May not be present in legacy block defs. Can be null if no info */
    columnInfos?: Array<QueryTableColumnInfo | null>;
    /** Footer blocks. Always same length as contents (if exist). */
    footers?: Array<BlockDef | null>;
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    /** Limit of rows displayed. Can be soft limit (prompts for more) or hard limit */
    limit: number | null;
    /** Limit type. "soft" means to enable "Show more..." prompt, "hard" means that only the limit of rows will be shown. Default is "soft" */
    limitType?: "soft" | "hard";
    where: Expr;
    orderBy: OrderBy[] | null;
    /** Action to be executed when row is clicked */
    rowClickAction: ActionDef | null;
    /** Message to display when there are no rows */
    noRowsMessage?: LocalizedString | null;
    /** True to hide headers */
    hideHeaders?: boolean;
    /** Borders (default is "horizontal") */
    borders?: "horizontal" | "all" | "none";
    /** Table padding (default is "normal") */
    padding?: "normal" | "compact";
    /** Striping of table */
    striped?: boolean;
    /** Sticky headers of the table */
    stickyHeaders?: boolean;
    /** Maximum height of the table with a scrollbar if exceeds */
    maxHeight?: number | null;
}
interface QueryTableColumnInfo {
    /** Column order expressions. When present for a column, makes it orderable via icon at top */
    orderExpr: Expr;
    /** Initial order of ordered column. Null for not initially ordered. Only first column with this set
     * is used as the initial ordering.
     */
    initialOrderDir: "asc" | "desc" | null;
    /** Column width in CSS format (e.g. "auto", "50%", "30px")
     * If not present, defaults to auto
     */
    columnWidth?: string;
    /** Vertical alignment (default top) */
    verticalAlign?: "top" | "middle" | "bottom";
}
export declare class QueryTableBlock extends Block<QueryTableBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(designCtx: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Create the context variable used */
    createRowContextVar(rowsetCV: ContextVar): ContextVar;
    getRowContextVarId(): string;
    /** Get list of expressions used in a row by content blocks */
    getRowExprs(contextVars: ContextVar[], ctx: DesignCtx | InstanceCtx): Expr[];
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    getRowContextVarValue(row: Row, rowExprs: Expr[], schema: Schema, rowsetCV: ContextVar, contextVars: ContextVar[], rowsetContextVarValue: Expr): any;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
/** Determine if table is fixed width and if it is, return the width in pixels */
export declare function getFixedWidth(blockDef: QueryTableBlockDef): number | null;
export {};
