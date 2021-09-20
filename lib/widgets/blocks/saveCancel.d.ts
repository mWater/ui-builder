/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { Expr, LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { ContextVarExpr } from '../..';
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
    /** Optional additional delete context variables */
    extraDeleteContextVarIds?: (string | null)[];
    /** Optional delete condition (only visible if true) */
    deleteCondition?: ContextVarExpr;
}
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed. Has optional delete button too.
 */
export declare class SaveCancelBlock extends Block<SaveCancelBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(ctx: DesignCtx): string | null;
    /** Get any context variables expressions that this block needs (not including child blocks) */
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    /** Special case as the inner block will have a virtual database and its own expression evaluator */
    getSubtreeContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
