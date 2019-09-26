/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, CreateBlock } from '../blocks';
import { LocalizedString, Expr } from 'mwater-expressions';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
export interface SaveCancelBlockDef extends BlockDef {
    type: "saveCancel";
    saveLabel: LocalizedString | null;
    cancelLabel: LocalizedString | null;
    child: BlockDef | null;
    /** Message to confirm discarding changes */
    confirmDiscardMessage: LocalizedString | null;
}
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed.
 */
export declare class SaveCancelBlock extends CompoundBlock<SaveCancelBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): "Save label required" | "Cancel label required" | "Confirm discard message required" | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    /** Special case as the inner block will have a virtual database and its own expression evaluator */
    getSubtreeContextVarExprs(options: {
        contextVar: ContextVar;
        widgetLibrary: WidgetLibrary;
        actionLibrary: ActionLibrary;
        /** All context variables */
        contextVars: ContextVar[];
        createBlock: CreateBlock;
    }): Expr[];
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
