import * as _ from 'lodash'
import * as React from 'react';
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, LocalizedTextPropertyEditor, EmbeddedExprsEditor } from '../propertyEditors';
import { Select, Checkbox } from 'react-library/lib/bootstrap';
import { WidgetDef } from '../widgets';
import produce from 'immer';
import { LocalizedString, Expr } from 'mwater-expressions';
import { EmbeddedExpr, validateEmbeddedExprs, formatEmbeddedExprString } from '../../embeddedExprs';
import { ContextVar } from '../blocks';
import { localize } from '../localization';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { Page } from '../../PageStack';

/** Direct reference to another context variable */
interface ContextVarRef {
  type: "ref"
  
  /** Context variable whose value should be used */
  contextVarId: string
}

/** Action which opens a page */
export interface OpenPageActionDef extends ActionDef {
  type: "openPage"

  pageType: "normal" | "modal"

  /** Title of page to open */
  title?: LocalizedString | null

  /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
  titleEmbeddedExprs?: EmbeddedExpr[] 

  /** id of the widget that will be displayed in the page */
  widgetId: string | null

  /** Values of context variables that widget inside page needs */
  contextVarValues: { [contextVarId: string]: ContextVarRef }

  /** True to replace current page */
  replacePage?: boolean
}

export class OpenPageAction extends Action<OpenPageActionDef> {
  validate(designCtx: DesignCtx) {
    // Find widget
    if (!this.actionDef.widgetId) {
      return "Widget required"
    }

    // Ensure that widget exists 
    const widget = designCtx.widgetLibrary.widgets[this.actionDef.widgetId]
    if (!widget) {
      return "Invalid widget"
    }

    // Ensure that all context variables are correctly mapped
    for (const widgetCV of widget.contextVars) {
      // Don't allow unmapped variables
      if (!this.actionDef.contextVarValues[widgetCV.id]) {
        return "Missing variable mapping"
      }

      // Ensure that mapping is to available context var
      const srcCV = designCtx.contextVars.find(cv => cv.id === this.actionDef.contextVarValues[widgetCV.id].contextVarId)
      if (!srcCV || srcCV.table !== widgetCV.table || srcCV.type !== widgetCV.type) {
        return "Invalid context variable"
      }
    }

    // Validate expressions
    const err = validateEmbeddedExprs({
      embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
      schema: designCtx.schema,
      contextVars: designCtx.contextVars})
    if (err) {
      return err
    }

    return null
  }

  /** Get any context variables expressions that this action needs */
  getContextVarExprs(contextVar: ContextVar): Expr[] {
    if (this.actionDef.titleEmbeddedExprs) {
      return _.compact(_.map(this.actionDef.titleEmbeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null))
    }
    return []
  }

  performAction(instanceCtx: InstanceCtx): Promise<void> {
    const contextVarValues = {}

    // Perform mappings 
    for (const cvid of Object.keys(this.actionDef.contextVarValues)) {
      // Look up outer context variable
      const outerCV = instanceCtx.contextVars.find(cv => cv.id == this.actionDef.contextVarValues[cvid].contextVarId)
      if (!outerCV) {
        throw new Error("Outer context variable not found")
      }

      // Get value 
      let outerCVValue = instanceCtx.contextVarValues[outerCV.id]

      // Add filters if rowset
      if (outerCV.type == "rowset") {
        outerCVValue = {
          type: "op",
          op: "and",
          table: outerCV.table!,
          exprs: _.compact([outerCVValue].concat(_.map(instanceCtx.getFilters(outerCV.id), f => f.expr)))
        }
      }

      contextVarValues[cvid] = outerCVValue
    }

    // Get title
    let title = localize(this.actionDef.title, instanceCtx.locale)

    if (title) {
      // Get any embedded expression values
      const exprValues = _.map(this.actionDef.titleEmbeddedExprs || [], ee => instanceCtx.getContextVarExprValue(ee.contextVarId!, ee.expr))

      // Format and replace
      title = formatEmbeddedExprString({
        text: title, 
        embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
        exprValues: exprValues,
        schema: instanceCtx.schema,
        contextVars: instanceCtx.contextVars,
        locale: instanceCtx.locale, 
        formatLocale: instanceCtx.formatLocale
      })
    }

    const page: Page = {
      type: this.actionDef.pageType,
      database: instanceCtx.database,
      widgetId: this.actionDef.widgetId!,
      contextVarValues: contextVarValues,
      title: title
    }

    if (this.actionDef.replacePage) {
      instanceCtx.pageStack.replacePage(page)
    }
    else {
      instanceCtx.pageStack.openPage(page)
    }

    return Promise.resolve()
  }
  
  /** Render an optional property editor for the action. This may use bootstrap */
  renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null { 
    // Create widget options 
    const widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(w => ({ label: w.name, value: w.id })), "label")

    const actionDef = this.actionDef as OpenPageActionDef

    const onChange = props.onChange as (actionDef: OpenPageActionDef) => void

    const handleWidgetIdChange = (widgetId: string | null) => {
      onChange({ ...actionDef, widgetId: widgetId, contextVarValues: {} })
    }
    
    const widgetDef: WidgetDef | null = actionDef.widgetId ? props.widgetLibrary.widgets[actionDef.widgetId] : null

    const renderContextVarValues = () => {
      if (!widgetDef) {
        return null
      }

      return (
        <table className="table table-bordered table-condensed">
          <tbody>
            { widgetDef.contextVars.map(contextVar => {
              const cvr = actionDef.contextVarValues[contextVar.id]
              const handleCVRChange = (contextVarId: string) => {
                props.onChange(produce(actionDef, (draft) => {
                  draft.contextVarValues[contextVar.id] = { type: "ref", contextVarId: contextVarId }
                }))
              }

              return (
                <tr key={contextVar.id}>
                  <td>{contextVar.name}</td>
                  <td>
                    <ContextVarPropertyEditor 
                      contextVars={props.contextVars}  
                      types={[contextVar.type]}
                      table={contextVar.table}
                      value={ cvr ? cvr.contextVarId : null }
                      onChange={ handleCVRChange }
                    />
                    { !cvr ? <span className="text-warning">Value not set</span> : null}          
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    }

    return (
      <div>
        <LabeledProperty label="Page Type">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="pageType">
            {(value, onChange) => <Select value={value} onChange={onChange} options={[{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Page Widget">
          <Select value={actionDef.widgetId} onChange={handleWidgetIdChange} options={widgetOptions} nullLabel="Select Widget" />
        </LabeledProperty>

        <PropertyEditor obj={this.actionDef} onChange={onChange} property="replacePage">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Replace current page</Checkbox>}
        </PropertyEditor>

        <LabeledProperty label="Variables">
          {renderContextVarValues()}
        </LabeledProperty>

        <LabeledProperty label="Page Title">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="title">
            {(value, onChange) => 
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            }
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Page Title embedded expressions" help="Reference in text as {0}, {1}, etc.">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="titleEmbeddedExprs">
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
      </div>
    )
  }
}