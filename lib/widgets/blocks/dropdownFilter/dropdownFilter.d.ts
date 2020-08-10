import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { BlockDef, Filter, ContextVar } from '../../blocks';
import { Expr, Schema, LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../../contexts';
import { EmbeddedExpr } from '../../../embeddedExprs';
import { OrderBy } from '../../../database/Database';
export interface DropdownFilterBlockDef extends BlockDef {
    type: "dropdownFilter";
    /** Placeholder in box */
    placeholder: LocalizedString | null;
    /** Id of context variable of rowset to filter */
    rowsetContextVarId: string | null;
    /** Expression to filter on */
    filterExpr: Expr;
    /** Default value of filter */
    defaultValue?: any;
    /** Additional rowsets to be filtered by same value */
    extraFilters?: ExtraFilter[];
    /** Mode for selecting date. Default is "full" */
    dateMode?: "full" | "year" | "yearmonth" | "month";
    /** True to use "within" operator. Only for hierarchical tables  */
    idWithin?: boolean;
    /** Optional filter to limit the id choices */
    idFilterExpr?: Expr;
    /** There are two modes for id fields: simple (just a label expression) and advanced (custom format for label, separate search and order) */
    idMode?: "simple" | "advanced";
    /** Simple mode: Text expression to display for entries of type id */
    idLabelExpr?: Expr;
    /** Advanced mode: Label for id selections with {0}, {1}, etc embedded in it */
    idLabelText?: LocalizedString | null;
    /** Advanced mode: Expressions embedded in the id label text string. Referenced by {0}, {1}, etc. Context variable is ignored */
    idLabelEmbeddedExprs?: EmbeddedExpr[];
    /** Advanced mode: Text/enum expressions to search on */
    idSearchExprs?: Expr[];
    /** Advanced mode: sort order of results */
    idOrderBy?: OrderBy[] | null;
}
/** Additional rowset to be filtered */
interface ExtraFilter {
    /** Id of context variable of rowset to filter */
    rowsetContextVarId: string | null;
    /** Expression to filter on  */
    filterExpr: Expr;
}
/** Dropdown that filters one or more rowsets. The value of the filter is stored in the memo of the rowset filter
 * and depends on which type of filter it is.
 */
export declare class DropdownFilterBlock extends LeafBlock<DropdownFilterBlockDef> {
    validate(options: DesignCtx): string | null;
    /** Generate a single synthetic context variable to allow embedded expressions to work in label */
    generateEmbedContextVars(idTable: string): ContextVar[];
    createFilter(rowsetContextVarId: string, filterExpr: Expr, schema: Schema, contextVars: ContextVar[], value: any): Filter;
    renderDesign(props: DesignCtx): JSX.Element;
    getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[];
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(ctx: DesignCtx): JSX.Element;
}
export {};
