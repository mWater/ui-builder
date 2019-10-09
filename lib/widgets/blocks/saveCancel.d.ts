/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, CreateBlock, ValidateBlockOptions } from '../blocks';
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
    /** Context variable containing row to delete to enable a Delete button */
    deleteContextVarId?: string | null;
    /** Label of delete button if present */
    deleteLabel?: LocalizedString | null;
    /** Optional confirmation message for delete */
    confirmDeleteMessage?: LocalizedString | null;
}
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed. Has optional delete button too.
 */
export declare class SaveCancelBlock extends CompoundBlock<SaveCancelBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(options: ValidateBlockOptions): "Save label required" | "Cancel label required" | "Confirm discard message required" | "Delete label required" | "Delete context variable not found" | "Delete context variable wrong type" | null;
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
