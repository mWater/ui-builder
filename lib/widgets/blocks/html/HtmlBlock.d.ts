/// <reference types="react" />
import { DataSource, LocalizedString, Schema } from "mwater-expressions";
import { BlockDef, DesignCtx, InstanceCtx, ContextVar } from "../../..";
import { EmbeddedExpr } from "../../../embeddedExprs";
import LeafBlock from "../../LeafBlock";
/** Block that contains an HTML component */
export interface HtmlBlockDef extends BlockDef {
    type: "html";
    /** Html that is displayed. Html can contain strings to be localized
     *  {"some string"}
     */
    html?: string;
    /** Localized strings, automatically extracted from html */
    localizedStrings?: LocalizedString[];
    /** Named expressions which can be referenced as {{exprid}} */
    namedExprs?: HtmlNamedExpr[];
}
interface HtmlNamedExpr {
    /** Id to reference as {{id}} */
    id: string;
    /** Content of the named expr */
    embeddedExpr: EmbeddedExpr;
}
export default class HtmlBlock extends LeafBlock<HtmlBlockDef> {
    constructor(blockDef: HtmlBlockDef);
    renderDesign(ctx: DesignCtx): JSX.Element;
    renderInstance(ctx: InstanceCtx): JSX.Element;
    renderEditor(ctx: DesignCtx): JSX.Element;
    validate(ctx: DesignCtx): string | null;
}
/** Edits named expressions. */
export declare function HtmlNamedExprsEditor(props: {
    value?: HtmlNamedExpr[] | null;
    onChange: (value: HtmlNamedExpr[]) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}): JSX.Element;
/** Allows editing of an named expression */
export declare function HtmlNamedExprEditor(props: {
    value: HtmlNamedExpr;
    onChange: (HtmlNamedExpr: HtmlNamedExpr) => void;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
}): JSX.Element;
export {};
