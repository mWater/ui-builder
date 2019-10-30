/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Block which creates a new row context variable */
export interface RowBlockDef extends BlockDef {
    type: "row";
    /** Table that the row if from */
    table?: string;
    /** Name of the row context variable */
    name?: string | null;
    /** Filter which applies to rows in the row */
    filter: Expr;
    /** Block which is in the row */
    content: BlockDef | null;
}
export declare class RowBlock extends Block<RowBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar | null;
    validate(options: DesignCtx): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
