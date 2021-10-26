/// <reference types="react" />
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock";
import { Column } from "mwater-expressions";
export interface TagsEditorBlockDef extends ControlBlockDef {
    type: "tagsEditor";
}
/** Block which shows a dropdown control to select existing or create new tags */
export declare class TagsEditorBlock extends ControlBlock<TagsEditorBlockDef> {
    renderControl(props: RenderControlProps): JSX.Element;
    /** Filter the columns that this control is for. Must be text[] */
    filterColumn(column: Column): boolean;
}
