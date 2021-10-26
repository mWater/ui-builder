import * as React from "react"
import { BlockDef, ContextVar, createExprVariables, validateContextVarExpr } from "../blocks"
import {
  PropertyEditor,
  ContextVarPropertyEditor,
  LabeledProperty,
  NumberFormatEditor,
  DateFormatEditor,
  DatetimeFormatEditor,
  ContextVarAndExprPropertyEditor,
  LocalizedTextPropertyEditor
} from "../propertyEditors"
import { Expr, ExprUtils, ExprValidator, LocalizedString } from "mwater-expressions"
import * as _ from "lodash"
import * as d3Format from "d3-format"
import moment from "moment"
import { DesignCtx, InstanceCtx } from "../../contexts"
import { TextualBlockDef, TextualBlock } from "./textual"
import { localize } from "../localization"

export interface ExpressionBlockDef extends TextualBlockDef {
  type: "expression"

  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be displayed */
  expr: Expr

  /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll). Note: % is not multiplied by 100!  */
  format: string | null

  /** Alternative label for true value */
  trueLabel?: LocalizedString | null

  /** Alternative label for true value */
  falseLabel?: LocalizedString | null
}

export class ExpressionBlock extends TextualBlock<ExpressionBlockDef> {
  getContextVarExprs(contextVar: ContextVar): Expr[] {
    return contextVar.id === this.blockDef.contextVarId && this.blockDef.expr ? [this.blockDef.expr] : []
  }

  validate(ctx: DesignCtx) {
    return validateContextVarExpr({
      schema: ctx.schema,
      contextVars: ctx.contextVars,
      contextVarId: this.blockDef.contextVarId,
      expr: this.blockDef.expr
    })
  }

  renderDesign(props: DesignCtx) {
    let summary = new ExprUtils(props.schema, createExprVariables(props.contextVars)).summarizeExpr(
      this.blockDef.expr,
      props.locale
    )
    if (summary.length > 20) {
      summary = summary.substr(0, 20) + "..."
    }

    return this.renderText(
      <div>
        <span className="text-muted">&lt;</span>
        {summary}
        <span className="text-muted">&gt;</span>
      </div>
    )
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    if (!this.blockDef.expr) {
      return <div />
    }

    const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr)
    const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr)

    const formatLocale = props.formatLocale || d3Format

    let str
    if (value == null) {
      str = ""
    } else {
      if (exprType === "number") {
        // d3 multiplies by 100 when appending a percentage. Remove this behaviour for consistency
        if ((this.blockDef.format || "").includes("%")) {
          str = formatLocale.format(this.blockDef.format || "")(value / 100.0)
        } else {
          str = formatLocale.format(this.blockDef.format || "")(value)
        }
      } else if (exprType === "date" && value != null) {
        str = moment(value, moment.ISO_8601).format(this.blockDef.format || "ll")
      } else if (exprType === "datetime" && value != null) {
        str = moment(value, moment.ISO_8601).format(this.blockDef.format || "lll")
      } else if (exprType == "boolean") {
        if (value == true) {
          str = this.blockDef.trueLabel ? localize(this.blockDef.trueLabel, props.locale) : "True"
        } else if (value == false) {
          str = this.blockDef.falseLabel ? localize(this.blockDef.falseLabel, props.locale) : "False"
        } else {
          str = ""
        }
      } else {
        str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(
          this.blockDef.expr,
          value,
          props.locale
        )
      }
    }

    let node
    if (this.blockDef.html) {
      node = this.processHTML(str)
    } else if (this.blockDef.markdown) {
      node = this.processMarkdown(str)
    } else {
      node = str
    }

    return this.renderText(node)
  }

  renderEditor(props: DesignCtx) {
    const contextVar = this.blockDef.contextVarId
      ? props.contextVars.find((cv) => cv.id === this.blockDef.contextVarId) || null
      : null

    const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr)

    return (
      <div>
        <LabeledProperty label="Expression">
          <ContextVarAndExprPropertyEditor
            contextVars={props.contextVars}
            schema={props.schema}
            dataSource={props.dataSource}
            aggrStatuses={
              contextVar && contextVar.type == "row"
                ? ["individual", "literal"]
                : ["individual", "aggregate", "literal"]
            }
            contextVarId={this.blockDef.contextVarId}
            expr={this.blockDef.expr}
            onChange={(contextVarId, expr) => {
              props.store.replaceBlock({ ...this.blockDef, contextVarId, expr } as ExpressionBlockDef)
            }}
          />
        </LabeledProperty>

        {exprType === "number" ? (
          <LabeledProperty label="Number Format">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="format">
              {(value: string, onChange) => <NumberFormatEditor value={value} onChange={onChange} />}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        {exprType === "date" ? (
          <LabeledProperty label="Date Format">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="format">
              {(value: string, onChange) => <DateFormatEditor value={value} onChange={onChange} />}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        {exprType === "datetime" ? (
          <LabeledProperty label="Date/time Format">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="format">
              {(value: string, onChange) => <DatetimeFormatEditor value={value} onChange={onChange} />}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        {exprType === "boolean" ? (
          <LabeledProperty label="Display True As">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="trueLabel">
              {(value, onChange) => (
                <LocalizedTextPropertyEditor
                  value={value}
                  onChange={onChange}
                  locale={props.locale}
                  placeholder="True"
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        {exprType === "boolean" ? (
          <LabeledProperty label="Display False As">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="falseLabel">
              {(value, onChange) => (
                <LocalizedTextPropertyEditor
                  value={value}
                  onChange={onChange}
                  locale={props.locale}
                  placeholder="False"
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        {this.renderTextualEditor(props)}
      </div>
    )
  }
}
