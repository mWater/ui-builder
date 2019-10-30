/// <reference types="react" />
import { BlockDef, ContextVar, ChildBlock, Block } from '../blocks';
import { Expr } from 'mwater-expressions';
import { ContextVarExpr } from '../columnValues';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Block which creates a new row and adds it as a context variable to its content */
export interface AddRowBlockDef extends BlockDef {
    type: "addRow";
    /** Table that the row will be added to */
    table?: string;
    /** Name of the row context variable */
    name?: string | null;
    /** Expressions to generate column values */
    columnValues: {
        [columnId: string]: ContextVarExpr;
    };
    /** Block which is in the passed the row */
    content: BlockDef | null;
}
export declare class AddRowBlock extends Block<AddRowBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar | null;
    validate(options: DesignCtx): string | null;
    validateColumnValue(options: DesignCtx, columnId: string): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
