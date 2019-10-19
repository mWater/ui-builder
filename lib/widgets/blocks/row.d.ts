/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, ContextVar, ChildBlock, ValidateBlockOptions } from '../blocks';
import { Expr } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
/** Block which creates a new row context variable */
export interface RowBlockDef extends BlockDef {
    type: "row";
    /** Table that the row if from */
    table?: string;
    /** Name of the row context variable */
    name?: string;
    /** Filter which applies to rows in the row */
    filter: Expr;
    /** Block which is in the row */
    content: BlockDef | null;
}
export declare class RowBlock extends CompoundBlock<RowBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar | null;
    validate(options: ValidateBlockOptions): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
