/// <reference types="react" />
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, Expr, LocalizedString } from 'mwater-expressions';
import { DesignCtx } from '../../../contexts';
export interface DropdownBlockDef extends ControlBlockDef {
    type: "dropdown";
    placeholder: LocalizedString | null;
    /** Text expression to display for entries of type id */
    idLabelExpr?: Expr;
    /** Filter expression for entries of type id */
    idFilterExpr?: Expr;
    /** Values to include (if present, only include them) */
    includeValues?: any[];
    /** Values to exclude (if present, exclude them) */
    excludeValues?: any[];
}
export declare class DropdownBlock extends ControlBlock<DropdownBlockDef> {
    validate(options: DesignCtx): string | null;
    renderControl(props: RenderControlProps): JSX.Element;
    renderEnum(props: RenderControlProps, column: Column): JSX.Element;
    renderEnumset(props: RenderControlProps, column: Column): JSX.Element;
    renderId(props: RenderControlProps, column: Column): JSX.Element;
    renderIds(props: RenderControlProps, column: Column): JSX.Element;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props: DesignCtx): JSX.Element;
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column: Column): boolean;
}
