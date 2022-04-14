import produce from "immer"
import * as React from "react"
import { Block, BlockDef, ContextVar, ChildBlock, createExprVariables } from "../blocks"
import * as _ from "lodash"
import { Expr, ExprUtils, LiteralExpr, Schema } from "mwater-expressions"
import ContextVarsInjector from "../ContextVarsInjector"
import { TextInput } from "react-library/lib/bootstrap"
import { PropertyEditor, LabeledProperty } from "../propertyEditors"
import { DesignCtx, InstanceCtx } from "../../contexts"
import { ContextVarExpr } from "../../ContextVarExpr"
import { ContextVarExprPropertyEditor, validateContextVarExpr } from "../.."
import { RowsetBlockDef } from "./rowset"

/** Block which evaluates and expression and creates context variable with a literal value */
export interface VariableBlockDef extends BlockDef {
  type: "variable"

  /** Name of the new context variable */
  name?: string | null

  /** Expression to evaluate */
  contextVarExpr?: ContextVarExpr

  /** Block which is in the rowset */
  content: BlockDef | null
}

export class VariableBlock extends Block<VariableBlockDef> {
  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] {
    if (this.blockDef.contextVarExpr != null && this.blockDef.contextVarExpr.contextVarId == contextVar.id) {
      return [this.blockDef.contextVarExpr.expr]
    }
    return []
  }

  getChildren(contextVars: ContextVar[], schema: Schema): ChildBlock[] {
    if (this.blockDef.content) {
      const contextVar = this.createContextVar(contextVars, schema)
      return [
        { blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }
      ]
    }
    return []
  }

  createContextVar(contextVars: ContextVar[], schema: Schema): ContextVar | null {
    if (!this.blockDef.contextVarExpr) {
      return null
    }

    // Determine type of context variable
    const exprUtils = new ExprUtils(schema, createExprVariables(contextVars))
    const type = exprUtils.getExprType(this.blockDef.contextVarExpr!.expr)

    if (type) {
      // Type of variable matches the type of the expression
      return { type: type, id: this.blockDef.id, name: this.blockDef.name || "Unnamed" }
    }
    return null
  }

  validate(ctx: DesignCtx) {
    if (!this.blockDef.contextVarExpr) {
      return "Expression required"
    }

    return validateContextVarExpr({
      schema: ctx.schema,
      contextVars: ctx.contextVars,
      contextVarId: this.blockDef.contextVarExpr.contextVarId,
      expr: this.blockDef.contextVarExpr.expr
    })
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)
    return produce(this.blockDef, (draft) => {
      draft.content = content
    })
  }

  renderDesign(ctx: DesignCtx) {
    const handleSetContent = (blockDef: BlockDef) => {
      ctx.store.alterBlock(
        this.id,
        produce((b: RowsetBlockDef) => {
          b.content = blockDef
          return b
        }),
        blockDef.id
      )
    }

    // Create props for child
    const contextVar = this.createContextVar(ctx.contextVars, ctx.schema)
    let contentCtx = ctx

    // Add context variable if knowable
    if (contextVar) {
      contentCtx = { ...contentCtx, contextVars: ctx.contextVars.concat([contextVar]) }
    }

    const contentNode = ctx.renderChildBlock(contentCtx, this.blockDef.content, handleSetContent)

    return <div style={{ paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" }}>{contentNode}</div>
  }

  renderInstance(ctx: InstanceCtx) {
    const contextVar = this.createContextVar(ctx.contextVars, ctx.schema)!

    // Get the literal value
    const literalValue = ctx.getContextVarExprValue(this.blockDef.contextVarExpr!.contextVarId, this.blockDef.contextVarExpr!.expr)

    // Get the type of the context variable
    const exprUtils = new ExprUtils(ctx.schema, createExprVariables(ctx.contextVars))
    const literalType = exprUtils.getExprType(this.blockDef.contextVarExpr!.expr)!

    // Create literal value
    const literalExpr: LiteralExpr = { type: "literal", valueType: literalType, value: literalValue }

    // Inject context variable
    return (
      <ContextVarsInjector
        injectedContextVars={[contextVar]}
        injectedContextVarValues={{ [contextVar.id]: literalExpr }}
        innerBlock={this.blockDef.content!}
        instanceCtx={ctx}
      >
        {(instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
          if (loading) {
            return (
              <div style={{ color: "#AAA", textAlign: "center" }}>
                <i className="fa fa-circle-o-notch fa-spin" />
              </div>
            )
          }
          return ctx.renderChildBlock(instanceCtx, this.blockDef.content)
        }}
      </ContextVarsInjector>
    )
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Expression to evaluate">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="contextVarExpr">
            {(value, onChange) =>
              <ContextVarExprPropertyEditor
                contextVarExpr={value}
                contextVars={props.contextVars}
                schema={props.schema} 
                dataSource={props.dataSource}
                onChange={onChange}
              />
            }
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Name of the variable">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="name">
            {(value, onChange) => <TextInput value={value || null} onChange={onChange} placeholder="Unnamed" />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
