import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { BlockDef, ValidateBlockOptions, ContextVar } from '../blocks';
import { ActionDef } from '../actions';
import { Expr, LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface ButtonBlockDef extends BlockDef {
    type: "button";
    label: LocalizedString | null;
    /** Action to perform when button is clicked */
    actionDef: ActionDef | null;
    style: "default" | "primary" | "link";
    size: "normal" | "small" | "large" | "extrasmall";
    icon?: "plus" | "times" | "pencil" | "print";
    /** True to make block-style button */
    block?: boolean;
    /** If present, message to display when confirming action */
    confirmMessage?: LocalizedString | null;
}
export declare class ButtonBlock extends LeafBlock<ButtonBlockDef> {
    validate(options: ValidateBlockOptions): string | null;
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    renderButton(locale: string, onClick: () => void): JSX.Element;
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(props: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
