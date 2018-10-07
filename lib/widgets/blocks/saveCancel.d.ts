/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks';
import { LocalizedString } from '../localization';
export interface SaveCancelBlockDef extends BlockDef {
    type: "saveCancel";
    saveLabel: LocalizedString | null;
    cancelLabel: LocalizedString | null;
    child: BlockDef | null;
}
export declare class SaveCancelBlock extends CompoundBlock<SaveCancelBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): null;
}
