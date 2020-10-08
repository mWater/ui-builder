import { Expr } from "mwater-expressions";

/** Expression based on a context variable */
export interface ContextVarExpr {
  /** Context variable which expression is based on. Null for literal-only */
  contextVarId: string | null,
  
  /** Expression to use */
  expr: Expr
}
