import * as React from "react";
import { ContextVar } from "../blocks";
import { Expr, LocalizedString } from "mwater-expressions";
import { EmbeddedExpr } from "../../embeddedExprs";
import { DesignCtx, InstanceCtx } from "../../contexts";
import { TextualBlockDef, TextualBlock } from "./textual";
export interface TextBlockDef extends TextualBlockDef {
    type: "text";
    /** Text content */
    text: LocalizedString | null;
    /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
    embeddedExprs?: EmbeddedExpr[];
}
export declare class TextBlock extends TextualBlock<TextBlockDef> {
    getContextVarExprs(contextVar: ContextVar): Expr[];
    validate(options: DesignCtx): string | null;
    renderDesign(props: DesignCtx): React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
        className: string;
    }, HTMLElement>;
    renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any>;
    renderEditor(props: DesignCtx): JSX.Element;
}
