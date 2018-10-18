import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, RenderEditorProps, Filter, ContextVar } from '../../blocks';
import { Expr, Schema } from 'mwater-expressions';
import { LocalizedString } from '../../localization';
export interface DropdownFilterBlockDef extends BlockDef {
    type: "dropdownFilter";
    /** Placeholder in box */
    placeholder: LocalizedString | null;
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    /** Expression to filter on  */
    filterExpr: Expr;
}
export declare class DropdownFilterBlock extends LeafBlock<DropdownFilterBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    createFilter(schema: Schema, contextVars: ContextVar[], value: any): Filter;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
