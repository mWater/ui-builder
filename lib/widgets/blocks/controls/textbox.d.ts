/// <reference types="react" />
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, LocalizedString } from 'mwater-expressions';
import { DesignCtx } from '../../../contexts';
export interface TextboxBlockDef extends ControlBlockDef {
    type: "textbox";
    placeholder?: LocalizedString | null;
    /** Number of lines in the text box. Default is 1. */
    numLines?: number | null;
}
/** Block that is a text input control linked to a specific field */
export declare class TextboxBlock extends ControlBlock<TextboxBlockDef> {
    renderControl(props: RenderControlProps): JSX.Element;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props: DesignCtx): JSX.Element;
    /** Filter the columns that this control is for */
    filterColumn(column: Column): boolean;
}
