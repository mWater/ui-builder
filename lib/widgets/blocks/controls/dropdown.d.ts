/// <reference types="react" />
import { ContextVar } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, Expr, LocalizedString } from 'mwater-expressions';
import { DesignCtx } from '../../../contexts';
import { EmbeddedExpr } from '../../../embeddedExprs';
import { OrderBy } from '../../../database/Database';
export interface DropdownBlockDef extends ControlBlockDef {
    type: "dropdown";
    placeholder: LocalizedString | null;
    /** Filter expression for entries of type id */
    idFilterExpr?: Expr;
    /** Values to include (if present, only include them) */
    includeValues?: any[] | null;
    /** Values to exclude (if present, exclude them) */
    excludeValues?: any[] | null;
    /** There are two modes: simple (just a label expression) and advanced (custom format for label, separate search and order) */
    idMode?: "simple" | "advanced";
    /** Simple mode: Text expression to display for entries of type id */
    idLabelExpr?: Expr;
    /** Advanced mode: Label for id selections with {0}, {1}, etc embedded in it */
    idLabelText: LocalizedString | null;
    /** Advanced mode: Expressions embedded in the id label text string. Referenced by {0}, {1}, etc. Context variable is ignored */
    idLabelEmbeddedExprs?: EmbeddedExpr[];
    /** Advanced mode: Text/enum expressions to search on */
    idSearchExprs?: Expr[];
    /** Advanced mode: sort order of results */
    idOrderBy?: OrderBy[] | null;
}
export declare class DropdownBlock extends ControlBlock<DropdownBlockDef> {
    validate(options: DesignCtx): string | null;
    /** Generate a single synthetic context variable to allow embedded expressions to work in label */
    generateEmbedContextVars(idTable: string): ContextVar[];
    renderControl(props: RenderControlProps): JSX.Element;
    renderEnum(props: RenderControlProps, column: Column): JSX.Element;
    renderEnumset(props: RenderControlProps, column: Column): JSX.Element;
    formatIdLabel: (ctx: RenderControlProps, labelValues: any[]) => string;
    renderId(props: RenderControlProps, column: Column): JSX.Element;
    renderIds(props: RenderControlProps, column: Column): JSX.Element;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props: DesignCtx): JSX.Element;
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column: Column): boolean;
}
