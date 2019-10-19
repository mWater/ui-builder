import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { BlockDef } from '../../blocks';
import { Expr, LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../../contexts';
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
    validate(options: DesignCtx): string | null;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
