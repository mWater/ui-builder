import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { BlockDef, ValidateBlockOptions, Filter, ContextVar } from '../../blocks';
import { Expr, Schema, LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../../contexts';
export interface DropdownFilterBlockDef extends BlockDef {
    type: "dropdownFilter";
    /** Placeholder in box */
    placeholder: LocalizedString | null;
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    /** Expression to filter on  */
    filterExpr: Expr;
    /** Default value of filter */
    defaultValue?: any;
}
export declare class DropdownFilterBlock extends LeafBlock<DropdownFilterBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    createFilter(schema: Schema, contextVars: ContextVar[], value: any): Filter;
    renderDesign(props: DesignCtx): JSX.Element;
    getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[];
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
