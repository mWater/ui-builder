import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, ValidateBlockOptions, createExprVariables } from '../blocks'
import * as _ from 'lodash';
import { ExprValidator, Expr } from 'mwater-expressions';
import { PropertyEditor, LabeledProperty, ContextVarPropertyEditor } from '../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';

/** Block which only displays content if an expression is true */
export interface ConditionalBlockDef extends BlockDef {
  type: "conditional"

  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be displayed */
  expr: Expr

  /** Block which is in the passed the row */
  content: BlockDef | null
}

export class ConditionalBlock extends CompoundBlock<ConditionalBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    if (this.blockDef.content) {
      return [{ blockDef: this.blockDef.content, contextVars: contextVars }]
    }
    return []
  }

  validate(options: ValidateBlockOptions) { 
    let error: string | null

    if (!this.blockDef.content) {
      return "Content required"
    }

    // Validate cv
    const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"))
    if (!contextVar) {
      return "Context variable required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    
    // Validate expr
    error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table, types: ["boolean"] })
    if (error) {
      return error
    }

    return null
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)
    return produce(this.blockDef, draft => {
      draft.content = content
    })
  }

  /** Get context variable expressions needed to add */
  getContextVarExprs(contextVar: ContextVar): Expr[] { 
    return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [] 
  }
  
  renderDesign(props: RenderDesignProps) {
    const handleSetContent = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: ConditionalBlockDef) => { 
        b.content = blockDef 
        return b
      }), blockDef.id)
    }

    const contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent)

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" }}>
        {contentNode}
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) { 
    // Check expression value
    const value = props.getContextVarExprValue(this.blockDef.contextVarId!, this.blockDef.expr)

    if (!value) {
      return <div/>
    }

    return <div>{props.renderChildBlock(props, this.blockDef.content)}</div>
  }

  renderEditor(props: RenderEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId)

    // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
    return (
      <div>
        <h3>Rowset</h3>
        <LabeledProperty label="Row/Rowset Variable">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="contextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row", "rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        { contextVar && contextVar.table 
          ?
          <LabeledProperty label="Conditional Expression">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="expr">
              {(value, onChange) => 
                <ExprComponent 
                  value={value} 
                  onChange={onChange} 
                  schema={props.schema} 
                  dataSource={props.dataSource} 
                  aggrStatuses={["individual", "aggregate", "literal"]}
                  types={["boolean"]}
                  variables={createExprVariables(props.contextVars)}
                  table={contextVar.table!}/>
              }
            </PropertyEditor>
          </LabeledProperty>
          : null
        }
      </div>
    )
  }
}