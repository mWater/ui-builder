import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ContextVar, ValidateBlockOptions, createExprVariables } from '../blocks'
import { PropertyEditor, ContextVarPropertyEditor, LabeledProperty, FormatEditor } from '../propertyEditors';
import { Expr, ExprUtils, Schema, ExprValidator } from 'mwater-expressions';
import { ExprComponent } from 'mwater-expressions-ui';
import * as _ from 'lodash';
import { format } from 'd3-format'

export interface ExpressionBlockDef extends BlockDef {
  type: "expression"
  
  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be displayed */
  expr: Expr

  /** d3 format of expression for numbers */
  format: string | null
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

    return (
      <div>
        <span className="text-muted">&lt;</span>
        {summary}
        <span className="text-muted">&gt;</span>
      </div>
    )     
  }


  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    if (!this.blockDef.contextVarId || !this.blockDef.expr) {
      return <div/>
    }

    const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr)

    let str
    if (_.isNumber(value)) {
      str = format(this.blockDef.format || "")(value)
    }
    else {
      str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, value, props.locale)
    }

    return (
      <div>{str}</div>
    )     
  }

  renderEditor(props: RenderEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId)

    const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr)

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
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="expr">
              {(value: Expr, onChange) => (
                <ExprComponent 
                  value={value} 
                  onChange={onChange} 
                  schema={props.schema} 
                  dataSource={props.dataSource} 
                  aggrStatuses={["individual", "aggregate", "literal"]}
                  variables={createExprVariables(props.contextVars)}
                  table={contextVar.table!}/>
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { exprType === "number" ?
          <LabeledProperty label="Format">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="format">
              {(value: string, onChange) => (
                <FormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

      </div>
    )
  }
}