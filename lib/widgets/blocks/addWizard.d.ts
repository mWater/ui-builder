import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, CreateBlock } from '../blocks';
export interface AddWizardBlockDef extends BlockDef {
    type: "addWizard";
}
/** Displays a popup and transforms into any other kind of block */
export declare class AddWizardBlock extends LeafBlock<AddWizardBlockDef> {
    createBlock: CreateBlock;
    constructor(blockDef: AddWizardBlockDef, createBlock: CreateBlock);
    validate(options: ValidateBlockOptions): null;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
}
