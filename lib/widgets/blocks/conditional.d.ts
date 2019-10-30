/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Block which only displays content if an expression is true */
export interface ConditionalBlockDef extends BlockDef {
    type: "conditional";
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression to be evaluated */
    expr: Expr;
    /** Content to be displayed */
    content: BlockDef | null;
}
export declare class ConditionalBlock extends Block<ConditionalBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(options: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
