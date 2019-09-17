import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from '../blocks';
import { ActionDef } from '../actions';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
import { Expr, LocalizedString } from 'mwater-expressions';
export interface ButtonBlockDef extends BlockDef {
    type: "button";
    label: LocalizedString | null;
    /** Action to perform when button is clicked */
    actionDef: ActionDef | null;
    style: "default" | "primary" | "link";
    size: "normal" | "small" | "large" | "extrasmall";
    icon?: "plus" | "times" | "pencil";
    /** If present, message to display when confirming action */
    confirmMessage?: LocalizedString | null;
}
export declare class ButtonBlock extends LeafBlock<ButtonBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    renderButton(locale: string, onClick: () => void): JSX.Element;
    renderDesign(props: RenderDesignProps): JSX.Element;
    renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    renderEditor(props: RenderEditorProps): JSX.Element;
}
