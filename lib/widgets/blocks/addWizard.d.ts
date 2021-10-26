import * as React from "react";
import LeafBlock from "../LeafBlock";
import { BlockDef } from "../blocks";
import { DesignCtx, InstanceCtx } from "../../contexts";
export interface AddWizardBlockDef extends BlockDef {
    type: "addWizard";
}
/** Displays a popup and transforms into any other kind of block */
export declare class AddWizardBlock extends LeafBlock<AddWizardBlockDef> {
    constructor(blockDef: AddWizardBlockDef);
    validate(options: DesignCtx): null;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
}
