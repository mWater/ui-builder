/// <reference types="react" />
import LeafBlock from '../LeafBlock';
import { BlockDef } from '../blocks';
import { Expr, LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface ToggleFilterBlockDef extends BlockDef {
    type: "toggleFilter";
    /** Options to display */
    options: ToggleFilterOption[];
    /** Which option is initially selected */
    initialOption: number | null;
    /** True to require a selection at all times */
    forceSelection: boolean;
    /** Size of the toggle (default is normal) */
    size?: "normal" | "small" | "large" | "extrasmall";
}
/** Single option to display */
interface ToggleFilterOption {
    /** Label to be displayed */
    label: LocalizedString;
    /** Rowset filters to apply */
    filters: RowsetFilter[];
}
/** Filters to be applied to a rowset */
interface RowsetFilter {
    /** Id of context variable of rowset to filter */
    rowsetContextVarId: string | null;
    /** Filter to apply. Boolean expression */
    filterExpr: Expr;
}
/** Dropdown that filters one or more rowsets. The value of the filter is stored in the memo of the rowset filter
 * and depends on which type of filter it is.
 */
export declare class ToggleFilterBlock extends LeafBlock<ToggleFilterBlockDef> {
    validate(options: DesignCtx): string | null;
    canonicalize(): ToggleFilterBlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(ctx: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
export {};
