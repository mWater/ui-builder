import { Expr, Schema, ExprUtils, ExprValidator } from "mwater-expressions"
import { ContextVar, createExprVariables, validateContextVarExpr } from "./widgets/blocks"
import * as d3Format from "d3-format"
import { FormatLocaleObject } from "d3-format"
import moment from "moment"

/** Expression which is embedded in the text string */
export interface EmbeddedExpr {
  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be displayed */
  expr: Expr

  /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll). Note: % is not multiplied by 100!  */
  format: string | null
}

/** Format an embedded string which is a string with {0}, {1}, etc. to be replaced by expressions */
export function formatEmbeddedExprString(options: {
  /** text with {0}, {1}... embedded */
  text: string
  /** Expressions to be substituted in */
  embeddedExprs: EmbeddedExpr[]
  /** Values of expressions */
  exprValues: any[]
  schema: Schema
  contextVars: ContextVar[]
  locale: string
  formatLocale?: FormatLocaleObject
}) {
  let text = options.text

  // Format and replace
  for (let i = 0; i < options.exprValues.length; i++) {
    const str = formatEmbeddedExpr({
      embeddedExpr: options.embeddedExprs[i],
      contextVars: options.contextVars,
      exprValue: options.exprValues[i],
      locale: options.locale,
      formatLocale: options.formatLocale,
      schema: options.schema
    })

    text = text.replace(`{${i}}`, str)
  }
  return text
}

/** Format an embedded expression */
export function formatEmbeddedExpr(options: {
  /** Expression to be embedded */
  embeddedExpr: EmbeddedExpr
  /** Value of expression */
  exprValue: any
  schema: Schema
  contextVars: ContextVar[]
  locale: string
  formatLocale?: FormatLocaleObject
}) {
  const formatLocale = options.formatLocale || d3Format

  const expr = options.embeddedExpr.expr
  const exprType = new ExprUtils(options.schema, createExprVariables(options.contextVars)).getExprType(expr)
  const format = options.embeddedExpr.format
  const value = options.exprValue

  if (value == null) {
    return ""
  } else {
    if (exprType === "number" && value != null) {
      // d3 multiplies by 100 when appending a percentage. Remove this behaviour for consistency
      if ((format || "").includes("%")) {
        return formatLocale.format(format || "")(value / 100.0)
      } else {
        return formatLocale.format(format || "")(value)
      }
    } else if (exprType === "date" && value != null) {
      return moment(value, moment.ISO_8601).format(format || "ll")
    } else if (exprType === "datetime" && value != null) {
      return moment(value, moment.ISO_8601).format(format || "lll")
    } else {
      return new ExprUtils(options.schema, createExprVariables(options.contextVars)).stringifyExprLiteral(
        expr,
        value,
        options.locale
      )
    }
  }
}

/** Validate embedded expressions, returning null if ok, message otherwise */
export function validateEmbeddedExprs(options: {
  /** Expressions to be substituted in */
  embeddedExprs: EmbeddedExpr[]
  schema: Schema
  contextVars: ContextVar[]
}) {
  for (const embeddedExpr of options.embeddedExprs) {
    const error = validateContextVarExpr({
      contextVars: options.contextVars,
      schema: options.schema,
      contextVarId: embeddedExpr.contextVarId,
      expr: embeddedExpr.expr
    })

    if (error) {
      return error
    }
  }

  return null
}
