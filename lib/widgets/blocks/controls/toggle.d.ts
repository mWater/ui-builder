/// <reference types="react" />
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock";
import { Column, LocalizedString } from "mwater-expressions";
import { DesignCtx } from "../../../contexts";
export interface ToggleBlockDef extends ControlBlockDef {
    type: "toggle";
    /** Values to include (if present, only include them) */
    includeValues?: any[] | null;
    /** Values to exclude (if present, exclude them) */
    excludeValues?: any[] | null;
    /** Label for true value if boolean. Default is "Yes" */
    trueLabel?: LocalizedString | null;
    /** Label for false value if boolean. Default is "No" */
    falseLabel?: LocalizedString | null;
}
/** Block which shows a toggle to control an enum or boolean or enumset */
export declare class ToggleBlock extends ControlBlock<ToggleBlockDef> {
    renderControl(props: RenderControlProps): JSX.Element;
    renderEnum(props: RenderControlProps, column: Column): JSX.Element;
    renderEnumset(props: RenderControlProps, column: Column): JSX.Element;
    renderBoolean(props: RenderControlProps, column: Column): JSX.Element;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props: DesignCtx): JSX.Element;
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column: Column): boolean;
}
