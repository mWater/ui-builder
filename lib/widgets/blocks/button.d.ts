import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions } from '../blocks';
import { LocalizedString } from '../localization';
import { ActionDef } from '../actions';
export interface ButtonBlockDef extends BlockDef {
    type: "button";
    label: LocalizedString | null;
    /** Action to perform when button is clicked */
    actionDef: ActionDef | null;
    style: "default" | "primary" | "link";
    size: "normal" | "small" | "large";
}
export declare class ButtonBlock extends LeafBlock<ButtonBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    renderButton(locale: string, onClick: () => void): JSX.Element;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
