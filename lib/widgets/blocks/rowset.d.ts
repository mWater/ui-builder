/// <reference types="react" />
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, ValidateBlockOptions } from '../blocks';
import { Expr } from 'mwater-expressions';
/** Block which creates a new rowset context variable */
export interface RowsetBlockDef extends BlockDef {
    type: "rowset";
    /** Table that the rowset if from */
    table?: string;
    /** Name of the rowset context variable */
    name?: string;
    /** Filter which applies to rows in the rowset */
    filter: Expr;
    /** Block which is in the rowset */
    content: BlockDef | null;
}
export declare class RowsetBlock extends CompoundBlock<RowsetBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    createContextVar(): ContextVar | null;
    validate(options: ValidateBlockOptions): string | null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
