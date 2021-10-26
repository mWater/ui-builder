/// <reference types="react" />
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks";
import { LocalizedString } from "mwater-expressions";
import { DesignCtx, InstanceCtx } from "../../contexts";
export interface LabeledBlockDef extends BlockDef {
    type: "labeled";
    label: LocalizedString | null;
    /** Optional help text shown at bottom */
    help?: LocalizedString | null;
    /** Optional hint text shown after label in faded */
    hint?: LocalizedString | null;
    /** True to display required red star */
    requiredStar?: boolean;
    /** Layout of control. Default is stacked */
    layout?: "stacked" | "horizontal";
    child: BlockDef | null;
}
export declare class LabeledBlock extends Block<LabeledBlockDef> {
    getChildren(contextVars: ContextVar[]): ChildBlock[];
    validate(): null;
    processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): JSX.Element;
    renderEditor(props: DesignCtx): JSX.Element;
}
