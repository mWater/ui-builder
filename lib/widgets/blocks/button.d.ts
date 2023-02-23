import React from "react";
import LeafBlock from "../LeafBlock";
import { BlockDef, ContextVar } from "../blocks";
import { ActionDef } from "../actions";
import { Expr, LocalizedString } from "mwater-expressions";
import { DesignCtx, InstanceCtx } from "../../contexts";
import { EmbeddedExpr } from "../../embeddedExprs";
export interface ButtonBlockDef extends BlockDef {
    type: "button";
    label: LocalizedString | null;
    /** Expressions embedded in the label string. Referenced by {0}, {1}, etc. */
    labelEmbeddedExprs?: EmbeddedExpr[];
    /** Action to perform when button is clicked */
    actionDef?: ActionDef | null;
    /** plainlink is a plain link without padding */
    style: "default" | "primary" | "link" | "plainlink";
    size: "normal" | "small" | "large" | "extrasmall";
    icon?: "plus" | "times" | "pencil" | "print" | "upload" | "download" | "info-circle" | "link" | "external-link" | "search" | "question-circle" | "folder-open" | "refresh" | "arrow-right" | "check";
    /** True to make block-style button */
    block?: boolean;
    /** If present, message to display when confirming action */
    confirmMessage?: LocalizedString | null;
}
export declare class ButtonBlock extends LeafBlock<ButtonBlockDef> {
    validate(designCtx: DesignCtx): string | null;
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    renderDesign(props: DesignCtx): JSX.Element;
    renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
