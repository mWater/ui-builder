import { BlockDef, ContextVar, Filter } from "../../blocks";
import LeafBlock from "../../LeafBlock";
import React from "react";
import { Expr, Column, Schema, DataSource, LocalizedString } from "mwater-expressions";
import { Database } from "../../../database/Database";
import { DesignCtx, InstanceCtx } from "../../../contexts";
import { FormatLocaleObject } from "d3-format";
import { ContextVarExpr } from "../../../ContextVarExpr";
/** Definition for a control which is a widget that edits a single column */
export interface ControlBlockDef extends BlockDef {
    /** Row context variable id */
    rowContextVarId: string | null;
    /** Column id that control is controlling */
    column: string | null;
    /** True if value is required */
    required: boolean;
    /** Message to display if required is true and control is blank */
    requiredMessage?: LocalizedString | null;
    /** Optional expression to make readonly if true */
    readonlyExpr?: ContextVarExpr;
}
export interface RenderControlProps {
    /** Value of the control column for the current row */
    value: any;
    /** Primary key of the current row */
    rowId: any;
    locale: string;
    database: Database;
    schema: Schema;
    dataSource?: DataSource;
    /** Context variable. Can be undefined in design mode */
    rowContextVar?: ContextVar;
    contextVars: ContextVar[];
    contextVarValues: {
        [contextVarId: string]: any;
    };
    /** Get any filters set on a rowset context variable. This includes ones set by other blocks */
    getFilters(contextVarId: string): Filter[];
    /** True if control should be disabled. Is disabled if has no value and cannot have one */
    disabled: boolean;
    /** True if value is saving */
    saving: boolean;
    /** Call with new value. Is undefined if value is readonly */
    onChange?: (value: any) => void;
    /** Locale object to use for formatting */
    formatLocale?: FormatLocaleObject;
    /** True if in design mode */
    designMode: boolean;
    /** True if invalid and in design mode */
    invalid?: boolean;
}
/** Abstract class for a control such as a dropdown, text field, etc that operates on a single column */
export declare abstract class ControlBlock<T extends ControlBlockDef> extends LeafBlock<T> {
    abstract renderControl(ctx: RenderControlProps): React.ReactElement<any>;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(ctx: DesignCtx): React.ReactElement<any> | null;
    /** Filter the columns that this control is for */
    abstract filterColumn(column: Column): boolean;
    renderDesign(designCtx: DesignCtx): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    renderInstance(props: InstanceCtx): JSX.Element;
    /** Allow subclasses to clear/update other fields on the column changing */
    processColumnChanged(blockDef: T): T;
    renderEditor(props: DesignCtx): JSX.Element;
    getContextVarExprs(contextVar: ContextVar): Expr[];
    /** Determine if block is valid. null means valid, string is error message. Does not validate children */
    validate(options: DesignCtx): string | null;
}
