import React from "react"
import _ from "lodash"
import { ActionDef, Action, RenderActionEditorProps } from "../actions"
import { LabeledProperty, PropertyEditor } from "../propertyEditors"
import { DesignCtx, InstanceCtx } from "../../contexts"
import { evalContextVarExpr } from "../evalContextVarExpr"
import { ContextVarExpr } from "../../ContextVarExpr"
import { ActionDefEditor, ContextVarExprPropertyEditor, validateContextVarExpr } from "../.."

export interface ConditionalActionDef extends ActionDef {
  type: "conditional"

  /** Condition to test */
  ifExpr?: ContextVarExpr

  /** Actions to perform if true */
  thenAction: ActionDef | null

  /** Actions to perform if false */
  elseAction: ActionDef | null
}

/** Action that does one of two things depending on an expression */
export class ConditionalAction extends Action<ConditionalActionDef> {
  validate(designCtx: DesignCtx) {
    if (this.actionDef.ifExpr) {
      const error = validateContextVarExpr({
        schema: designCtx.schema,
        contextVars: designCtx.contextVars,
        contextVarId: this.actionDef.ifExpr.contextVarId,
        expr: this.actionDef.ifExpr.expr,
        types: ["boolean"],
      })
      if (error) {
        return error
      }
    }

    if (this.actionDef.thenAction) {
      const action = designCtx.actionLibrary.createAction(this.actionDef.thenAction)

      const error = action.validate(designCtx)
      if (error) {
        return error
      }
    }

    if (this.actionDef.elseAction) {
      const action = designCtx.actionLibrary.createAction(this.actionDef.elseAction)

      const error = action.validate(designCtx)
      if (error) {
        return error
      }
    }

    return null
  }

  renderEditor(props: RenderActionEditorProps) {
    const onChange = props.onChange as (actionDef: ConditionalActionDef) => void
    return (
      <div>
        <LabeledProperty label="Conditional Expression">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="ifExpr">
            {(value, onChange) => (
              <ContextVarExprPropertyEditor
                contextVars={props.contextVars}
                schema={props.schema}
                dataSource={props.dataSource}
                aggrStatuses={["individual", "literal"]}
                types={["boolean"]}
                contextVarExpr={value}
                onChange={onChange}
              />
            )}  
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Action if true">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="thenAction">
            {(value, onChange) => <ActionDefEditor value={value} onChange={onChange} designCtx={props} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Action if false">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="elseAction">
            {(value, onChange) => <ActionDefEditor value={value} onChange={onChange} designCtx={props} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }

  async performAction(instanceCtx: InstanceCtx): Promise<void> {
    if (!this.actionDef.ifExpr) {
      return
    }

    // Evaluate if
    const contextVar = instanceCtx.contextVars.find((cv) => cv.id == this.actionDef.ifExpr!.contextVarId)!
    const ifValue = await evalContextVarExpr({
      contextVar: contextVar,
      contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
      ctx: instanceCtx,
      expr: this.actionDef.ifExpr.expr
    })

    if (ifValue) {
      if (this.actionDef.thenAction) {
        const action = instanceCtx.actionLibrary.createAction(this.actionDef.thenAction)
        await action.performAction(instanceCtx)
      }
    }
    else {
      if (this.actionDef.elseAction) {
        const action = instanceCtx.actionLibrary.createAction(this.actionDef.elseAction)
        await action.performAction(instanceCtx)
      }
    }
  }
}
