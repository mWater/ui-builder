import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ContextVar, ValidateBlockOptions, createExprVariables } from '../blocks'
import { PropertyEditor, ContextVarPropertyEditor, LabeledProperty, NumberFormatEditor, DateFormatEditor, DatetimeFormatEditor } from '../propertyEditors';
import { Expr, ExprUtils, ExprValidator } from 'mwater-expressions';
import { ExprComponent } from 'mwater-expressions-ui';
import * as _ from 'lodash';
import { format } from 'd3-format'
import moment from 'moment'
import { Toggle, Checkbox } from 'react-library/lib/bootstrap';

export interface ExpressionBlockDef extends BlockDef {
  type: "expression"
  
  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be displayed */
  expr: Expr

  /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll)  */
  format: string | null

  bold?: boolean
  italic?: boolean
  underline?: boolean

  /** How to align text. Default is left */
  align?: "left" | "center" | "right" | "justify"
}

export class ExpressionBlock extends LeafBlock<ExpressionBlockDef> {
  getContextVarExprs(contextVar: ContextVar): Expr[] { 
    return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [] 
  }

  validate(options: ValidateBlockOptions) {
    // Validate cv
    const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"))
    if (!contextVar) {
      return "Context variable required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    let error: string | null
    
    // Validate expr
    error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table })
    if (error) {
      return error
    }

    return null
  }

  renderDesign(props: RenderDesignProps) {
    const summary = new ExprUtils(props.schema, createExprVariables(props.contextVars)).summarizeExpr(this.blockDef.expr, props.locale)
    const style = this.getStyle()

    return (
      <div style={style}>
        <span className="text-muted">&lt;</span>
        {summary}
        <span className="text-muted">&gt;</span>
      </div>
    )     
  }

  getStyle() {
    const style: React.CSSProperties = {}
    if (this.blockDef.bold) {
      style.fontWeight = "bold"
    }
    if (this.blockDef.italic) {
      style.fontStyle = "italic"
    }
    if (this.blockDef.underline) {
      style.textDecoration = "underline"
    }
    if (this.blockDef.align) {
      style.textAlign = this.blockDef.align
    }
    return style
  }


  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    if (!this.blockDef.contextVarId || !this.blockDef.expr) {
      return <div/>
    }

    const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr)
    const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr)
    const style = this.getStyle()

    let str
    if (value == null) {
      str = ""
    }
    else {
      if (exprType === "number") {
        str = format(this.blockDef.format || "")(value)
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
    
    return (
      <div style={style}>{str}</div>
    )     
  }

  renderEditor(props: RenderEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId)

    const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr)

    const handleExprChange = (expr: Expr) => {
      // Clear format if type different
      const newExprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(expr)
      
      if (newExprType !== exprType) {
        props.onChange({ ...this.blockDef, expr: expr, format: null })
      }
      else {
        props.onChange({ ...this.blockDef, expr: expr })
      }
    }
  
    // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
    return (
      <div>
        <LabeledProperty label="Row/Rowset Variable">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="contextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row", "rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        { contextVar && contextVar.table 
          ?
          <LabeledProperty label="Expression">
            <ExprComponent 
              value={this.blockDef.expr} 
              onChange={handleExprChange} 
              schema={props.schema} 
              dataSource={props.dataSource} 
              aggrStatuses={["individual", "aggregate", "literal"]}
              variables={createExprVariables(props.contextVars)}
              table={contextVar.table!}/>
          </LabeledProperty>
          : null
        }

        { exprType === "number" ?
          <LabeledProperty label="Number Format">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="format">
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
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="format">
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
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="format">
              {(value: string, onChange) => (
                <DatetimeFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="bold">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Bold</Checkbox>}
        </PropertyEditor>

        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="italic">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Italic</Checkbox>}
        </PropertyEditor>

        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="underline">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Underline</Checkbox>}
        </PropertyEditor>

        <LabeledProperty label="Alignment">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="align">
            {(value, onChange) => 
              <Toggle 
                value={value || "left"} 
                onChange={onChange} 
                options={[
                  { value: "left", label: <i className="fa fa-align-left"/> },
                  { value: "center", label: <i className="fa fa-align-center"/> },
                  { value: "right", label: <i className="fa fa-align-right"/> },
                  { value: "justify", label: <i className="fa fa-align-justify"/> }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>

      </div>
    )
  }
}