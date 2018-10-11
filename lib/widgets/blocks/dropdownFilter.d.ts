import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, RenderEditorProps, ContextVar } from '../blocks';
import { Expr, Schema } from 'mwater-expressions';
import { LocalizedString } from '../localization';
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
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderControl(options: {
        schema: Schema;
        locale: string;
        contextVars: ContextVar[];
        value: any;
        onChange: (value: any) => void;
    }): JSX.Element;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
