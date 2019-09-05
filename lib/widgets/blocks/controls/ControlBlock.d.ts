import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from "../../blocks";
import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { Expr, Column, Schema, DataSource, LocalizedString } from "mwater-expressions";
/** Definition for a control which is a widget that edits a single column */
export interface ControlBlockDef extends BlockDef {
    /** Row context variable id */
    rowContextVarId: string | null;
    /** Column id that control is controlling */
    column: string | null;
    /** True if value is required */
    required: boolean;
    /** Message to display if required is true and control is blank */
    requiredMessage?: LocalizedString;
}
export interface RenderControlProps {
    value: any;
    locale: string;
    schema: Schema;
    dataSource: DataSource;
    /** Context variable. Can be undefined in design mode */
    rowContextVar?: ContextVar;
    /** True if control should be disabled */
    disabled: boolean;
    onChange: (value: any) => void;
}
/** Abstract class for a control such as a dropdown, text field, etc that operates on a single column */
export declare abstract class ControlBlock<T extends ControlBlockDef> extends LeafBlock<T> {
    abstract renderControl(props: RenderControlProps): React.ReactElement<any>;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    abstract renderControlEditor(props: RenderEditorProps): React.ReactElement<any> | null;
    /** Filter the columns that this control is for */
    abstract filterColumn(column: Column): boolean;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    /** Allow subclasses to clear/update other fields on the column changing */
    processColumnChanged(blockDef: T): T;
    renderEditor(props: RenderEditorProps): JSX.Element;
    getContextVarExprs(contextVar: ContextVar): Expr[];
    /** Determine if block is valid. null means valid, string is error message. Does not validate children */
    validate(options: ValidateBlockOptions): string | null;
}
