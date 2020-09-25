import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, ContextVar, createExprVariables, validateContextVarExpr } from '../blocks'
import { PropertyEditor, ContextVarPropertyEditor, LabeledProperty, NumberFormatEditor, DateFormatEditor, DatetimeFormatEditor, ContextVarExprPropertyEditor } from '../propertyEditors';
import { Expr, ExprUtils, ExprValidator } from 'mwater-expressions';
import { ExprComponent } from 'mwater-expressions-ui';
import * as _ from 'lodash';
import * as d3Format from 'd3-format';
import moment from 'moment'
import { DesignCtx, InstanceCtx } from '../../contexts';
import { TextualBlockDef, TextualBlock } from './textual';

export interface ExpressionBlockDef extends TextualBlockDef {
  type: "expression"
  
  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be displayed */
  expr: Expr

  /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll)  */
  format: string | null
}

export class ExpressionBlock extends TextualBlock<ExpressionBlockDef> {
  getContextVarExprs(contextVar: ContextVar): Expr[] { 
    return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [] 
  }

  validate(ctx: DesignCtx) {
    // TODO REMOVE
    if ((this.blockDef.format || "").includes("%")) {
      return "PERCENT!!!"
    }

    return validateContextVarExpr({
      schema: ctx.schema,
      contextVars: ctx.contextVars,
      contextVarId: this.blockDef.contextVarId,
      expr: this.blockDef.expr
    })
  }

  renderDesign(props: DesignCtx) {
    const summary = new ExprUtils(props.schema, createExprVariables(props.contextVars)).summarizeExpr(this.blockDef.expr, props.locale)

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
      return <div/>
    }

    const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr)
    const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr)

    const formatLocale = props.formatLocale || d3Format

    let str
    if (value == null) {
      str = ""
    }
    else {
      if (exprType === "number") {
        str = formatLocale.format(this.blockDef.format || "")(value)
      }
      else if (exprType === "date" && value != null) {
        str = moment(value, moment.ISO_8601).format(this.blockDef.format || "ll")
      }
      else if (exprType === "datetime" && value != null) {
        str = moment(value, moment.ISO_8601).format(this.blockDef.format || "lll")
      }
      else {
        str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, value, props.locale)
      }
    }
    
    return this.renderText(this.processMarkdown(str))
  }

  renderEditor(props: DesignCtx) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId)

    const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr)

    const handleExprChange = (expr: Expr) => {
      // Clear format if type different
      const newExprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(expr)
      
      if (newExprType !== exprType) {
        props.store.replaceBlock({ ...this.blockDef, expr: expr, format: null } as ExpressionBlockDef)
      }
      else {
        props.store.replaceBlock({ ...this.blockDef, expr: expr } as ExpressionBlockDef)
      }
    }
  
    return (
      <div>
        <LabeledProperty label="Expression">
          <ContextVarExprPropertyEditor
            contextVars={props.contextVars}
            schema={props.schema} 
            dataSource={props.dataSource} 
            aggrStatuses={["individual", "aggregate", "literal"]}
            contextVarId={this.blockDef.contextVarId}
            expr={this.blockDef.expr} 
            onChange={(contextVarId, expr) => {
              props.store.replaceBlock({ ...this.blockDef, contextVarId, expr } as ExpressionBlockDef)
            }}
            />
        </LabeledProperty>

        { exprType === "number" ?
          <LabeledProperty label="Number Format">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="format">
              {(value: string, onChange) => (
                <NumberFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { exprType === "date" ?
          <LabeledProperty label="Date Format">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="format">
              {(value: string, onChange) => (
                <DateFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { exprType === "datetime" ?
          <LabeledProperty label="Date/time Format">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="format">
              {(value: string, onChange) => (
                <DatetimeFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { this.renderTextualEditor(props) }
      </div>
    )
  }
}