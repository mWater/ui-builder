/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, ValidateBlockOptions } from '../blocks';
import { ContextVarExpr } from '../columnValues';
/** Block which creates a new row and adds it as a context variable to its content */
export interface AddRowBlockDef extends BlockDef {
    type: "addRow";
    /** Table that the row will be added to */
    table?: string;
    /** Name of the row context variable */
    name?: string;
    /** Expressions to generate column values */
    columnValues: {
        [columnId: string]: ContextVarExpr;
    };
    /** Block which is in the passed the row */
    content: BlockDef | null;
}
export declare class AddRowBlock extends CompoundBlock<AddRowBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar | null;
    validate(options: ValidateBlockOptions): string | null;
    validateColumnValue(options: ValidateBlockOptions, columnId: string): string | null;
    processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef;
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar: ContextVar): import("mwater-expressions").Expr[];
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
