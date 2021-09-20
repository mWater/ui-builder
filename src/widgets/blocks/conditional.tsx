import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock, createExprVariables, validateContextVarExpr } from '../blocks'
import * as _ from 'lodash';
import { ExprValidator, Expr } from 'mwater-expressions';
import { PropertyEditor, LabeledProperty, ContextVarPropertyEditor, ContextVarAndExprPropertyEditor } from '../propertyEditors';
import { DesignCtx, InstanceCtx } from '../../contexts';

/** Block which only displays content if an expression is true */
export interface ConditionalBlockDef extends BlockDef {
  type: "conditional"

  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to be evaluated */
  expr: Expr

  /** Content to be displayed */
  content: BlockDef | null
}

export class ConditionalBlock extends Block<ConditionalBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    if (this.blockDef.content) {
      return [{ blockDef: this.blockDef.content, contextVars: contextVars }]
    }
    return []
  }

  validate(ctx: DesignCtx) { 
    return validateContextVarExpr({
      schema: ctx.schema,
      contextVars: ctx.contextVars,
      contextVarId: this.blockDef.contextVarId,
      expr: this.blockDef.expr,
      types: ["boolean"]
    })
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
  
  renderDesign(props: DesignCtx) {
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

  renderInstance(props: InstanceCtx) { 
    // Check expression value
    const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr)

    if (!value) {
      return <div/>
    }

    return <div>{props.renderChildBlock(props, this.blockDef.content)}</div>
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <h3>Conditional</h3>
        <LabeledProperty label="Conditional Expression">
          <ContextVarAndExprPropertyEditor
            contextVars={props.contextVars}
            schema={props.schema} 
            dataSource={props.dataSource} 
            aggrStatuses={["individual", "aggregate", "literal"]}
            types={["boolean"]}
            contextVarId={this.blockDef.contextVarId}
            expr={this.blockDef.expr} 
            onChange={(contextVarId, expr) => {
              props.store.replaceBlock({ ...this.blockDef, contextVarId, expr } as ConditionalBlockDef)
            }}
            />
        </LabeledProperty>
      </div>
    )
  }
}