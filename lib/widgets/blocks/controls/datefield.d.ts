/// <reference types="react" />
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock";
import { Column, LocalizedString } from "mwater-expressions";
import { DesignCtx } from "../../../contexts";
export interface DatefieldBlockDef extends ControlBlockDef {
    type: "datefield";
    placeholder: LocalizedString | null;
    /** moment.js format for date (default ll) and datetime (default lll)  */
    format: string | null;
}
/** Block that is a text input control linked to a specific field */
export declare class DatefieldBlock extends ControlBlock<DatefieldBlockDef> {
    renderControl(props: RenderControlProps): JSX.Element;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props: DesignCtx): JSX.Element;
    /** Filter the columns that this control is for */
    filterColumn(column: Column): boolean;
    /** Clear format */
    processColumnChanged(blockDef: DatefieldBlockDef): DatefieldBlockDef;
}
