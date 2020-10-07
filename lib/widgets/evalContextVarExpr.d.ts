import { Expr } from "mwater-expressions";
import { InstanceCtx } from "../contexts";
import { ContextVar } from "./blocks";
/**
 * Evaluate a context variable expression.
 * contextVar does not need to be part of the context, but if it is, it will still be handled correctly
 */
export declare function evalContextVarExpr(options: {
    contextVar: ContextVar | null;
    contextVarValue: any;
    expr: Expr;
    ctx: InstanceCtx;
}): Promise<any>;
