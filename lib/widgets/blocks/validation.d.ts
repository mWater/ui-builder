/// <reference types="react" />
import { Expr, LocalizedString } from 'mwater-expressions';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ValidateBlockOptions } from '../blocks';
import LeafBlock from '../LeafBlock';
/** Block that appears when one or more validation conditions fail */
export interface ValidationBlockDef extends BlockDef {
    type: "validation";
    /** Validations to apply */
    validations: Validation[];
    /** True if validates immediately rather than waiting for validation on save */
    immediate?: boolean;
}
/** Single validation to test */
interface Validation {
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression that must be true to pass */
    condition: Expr;
    /** Message to display if not true */
    message: LocalizedString | null;
}
export declare class ValidationBlock extends LeafBlock<ValidationBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    /** Get context variable expressions needed */
    getContextVarExprs(contextVar: ContextVar): Expr[];
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
export {};
