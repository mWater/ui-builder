import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, RenderEditorProps, Filter, ContextVar } from '../../blocks';
import { Expr, Schema, LocalizedString } from 'mwater-expressions';
import { WidgetLibrary } from '../../../designer/widgetLibrary';
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
    renderDesign(props: RenderDesignProps): JSX.Element;
    getInitialFilters(options: {
        contextVarId: string;
        widgetLibrary: WidgetLibrary;
        schema: Schema;
        contextVars: ContextVar[];
    }): Filter[];
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
