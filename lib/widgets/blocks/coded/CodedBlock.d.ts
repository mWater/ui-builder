/// <reference types="react" />
import { Expr } from "mwater-expressions";
import { CodedExpr } from "./CodedExpr";
import { CodedQuery } from "./CodedQuery";
import { CodedLocalizedString } from "./CodedLocalizedString";
import { CodedAction } from "./CodedAction";
import { BlockDef, ContextVar, DesignCtx, InstanceCtx } from "../../..";
import LeafBlock from "../../LeafBlock";
/** Register an extra package id that can be imported using "import" inside a coded
 * block. Importer should return imported module e.g. return import("lodash")
 */
export declare function registerExtraCodedPackage(packageId: string, importer: () => Promise<any>): void;
/** Block that contains a coded component.
 * It can define expressions that will be present as props.
 */
export interface CodedBlockDef extends BlockDef {
    type: "coded";
    /** JSX + ES6 code. Should export InstanceComp and optionally DesignComp as React components. */
    code: string;
    /** ES5 compiled version of code */
    compiledCode: string;
    /** Expressions that are made available as props */
    codedExprs: CodedExpr[];
    /** Queries that are made available as props */
    codedQueries?: CodedQuery[];
    /** Localized strings that are made available as props */
    codedLocalizedStrings?: CodedLocalizedString[];
    /** Actions that re made available as props */
    codedActions?: CodedAction[];
}
export default class CodedBlock extends LeafBlock<CodedBlockDef> {
    constructor(blockDef: CodedBlockDef);
    getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[];
    renderDesign(ctx: DesignCtx): JSX.Element;
    renderInstance(ctx: InstanceCtx): JSX.Element;
    renderEditor(ctx: DesignCtx): JSX.Element;
    validate(ctx: DesignCtx): string | null;
}
