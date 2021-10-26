/// <reference types="react" />
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock";
import { Column, LocalizedString } from "mwater-expressions";
import { DesignCtx } from "../../../contexts";
export interface NumberboxBlockDef extends ControlBlockDef {
    type: "numberbox";
    placeholder: LocalizedString | null;
    /** True to display decimal places */
    decimal: boolean;
    /** Number of decimal places to always display/restrict to */
    decimalPlaces?: number | null;
}
export declare class NumberboxBlock extends ControlBlock<NumberboxBlockDef> {
    renderControl(props: RenderControlProps): JSX.Element;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props: DesignCtx): JSX.Element;
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column: Column): boolean;
}
