/// <reference types="react" />
import { RenderEditorProps } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column } from 'mwater-expressions';
import { LocalizedString } from '../../localization';
export interface TextboxBlockDef extends ControlBlockDef {
    type: "textbox";
    placeholder: LocalizedString | null;
}
export declare class TextboxBlock extends ControlBlock<TextboxBlockDef> {
    renderControl(props: RenderControlProps): JSX.Element;
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props: RenderEditorProps): JSX.Element;
    /** Filter the columns that this control is for */
    filterColumn(column: Column): boolean;
}
