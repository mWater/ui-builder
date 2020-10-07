import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { LabeledProperty, PropertyEditor, EmbeddedExprsEditor } from '../propertyEditors';
import { TextInput, Checkbox } from 'react-library/lib/bootstrap';
import { EmbeddedExpr, validateEmbeddedExprs, formatEmbeddedExprString } from '../../embeddedExprs';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { ContextVar } from '../blocks';
import { Expr } from 'mwater-expressions';
import { evalContextVarExpr } from '../evalContextVarExpr';

export interface GotoUrlActionDef extends ActionDef {
  type: "gotoUrl"
  url?: string | null

  /** True to open in new tab */
  newTab?: boolean

  /** Expression embedded in the url string. Referenced by {0}, {1}, etc. */
  urlEmbeddedExprs?: EmbeddedExpr[] 
}

/** Opens a URL optionally in a new tab */
export class GotoUrlAction extends Action<GotoUrlActionDef> {
  validate(designCtx: DesignCtx) {
    // Check that url is present
    if (!this.actionDef.url) {
      return "URL required"
    }

    // Validate expressions
    const err = validateEmbeddedExprs({
      embeddedExprs: this.actionDef.urlEmbeddedExprs || [],
      schema: designCtx.schema,
      contextVars: designCtx.contextVars})
    if (err) {
      return err
    }

    return null
  }

  renderEditor(props: RenderActionEditorProps) {
    const onChange = props.onChange as (actionDef: GotoUrlActionDef) => void
    return (
      <div>
        <LabeledProperty label="URL">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="url">
            {(value, onChange) => 
              <TextInput value={value || null} onChange={onChange}/>
            }
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="URL embedded expressions" help="Reference in text as {0}, {1}, etc.">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="urlEmbeddedExprs">
            {(value: EmbeddedExpr[] | null | undefined, onChange) => (
              <EmbeddedExprsEditor 
                value={value} 
                onChange={onChange} 
                schema={props.schema} 
                dataSource={props.dataSource}
                contextVars={props.contextVars} />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.actionDef} onChange={onChange} property="newTab">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Open in new tab</Checkbox>}
        </PropertyEditor>
      </div>
    )
  }

  async performAction(instanceCtx: InstanceCtx): Promise<void> {
    let url = this.actionDef.url!

    // Get any embedded expression values
    const exprValues: any[] = []
    for (const ee of this.actionDef.urlEmbeddedExprs || []) {
      const contextVar = ee.contextVarId ? instanceCtx.contextVars.find(cv => cv.id == ee.contextVarId)! : null
      exprValues.push(await evalContextVarExpr({ 
        contextVar,
        contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
        ctx: instanceCtx,
        expr: ee.expr }))
    }

    // Format and replace
    url = formatEmbeddedExprString({
      text: url, 
      embeddedExprs: this.actionDef.urlEmbeddedExprs || [],
      exprValues: exprValues,
      schema: instanceCtx.schema,
      contextVars: instanceCtx.contextVars,
      locale: instanceCtx.locale, 
      formatLocale: instanceCtx.formatLocale
    })

    window.open(url, this.actionDef.newTab ? "_blank" : "_self")
  }
}

