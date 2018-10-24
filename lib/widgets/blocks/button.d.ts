import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from '../blocks';
import { LocalizedString } from '../localization';
import { ActionDef } from '../actions';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
import { Expr } from 'mwater-expressions';
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
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    renderButton(locale: string, onClick: () => void): JSX.Element;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
