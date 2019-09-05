import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, RenderEditorProps } from '../../blocks';
import { Expr, LocalizedString } from 'mwater-expressions';
export interface SearchBlockDef extends BlockDef {
    type: "search";
    /** Placeholder in box */
    placeholder: LocalizedString | null;
    /** Id of context variable of rowset for table to use */
    rowsetContextVarId: string | null;
    /** Text expressions to search on  */
    searchExprs: Expr[];
}
export declare class SearchBlock extends LeafBlock<SearchBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
