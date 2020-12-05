import * as _ from 'lodash'
import * as React from 'react';
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor, EmbeddedExprsEditor } from '../propertyEditors';
import { Select, Checkbox, Toggle } from 'react-library/lib/bootstrap';
import { WidgetDef } from '../widgets';
import produce from 'immer';
import { LocalizedString, Expr, ExprUtils } from 'mwater-expressions';
import { EmbeddedExpr, validateEmbeddedExprs, formatEmbeddedExprString } from '../../embeddedExprs';
import { ContextVar, createExprVariables, createExprVariableValues } from '../blocks';
import { localize } from '../localization';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { Page } from '../../PageStack';
import { evalContextVarExpr } from '../evalContextVarExpr';
import { ExprComponent } from 'mwater-expressions-ui';

/** Direct reference to another context variable */
interface ContextVarRef {
  type: "ref"
  
  /** Context variable whose value should be used */
  contextVarId: string
}

/** Null value for context value */
interface ContextVarNull {
  type: "null"
}

/** Literal value for context value */
interface ContextVarLiteral {
  type: "literal"

  /** Value of the variable. Is an expression for non-rowset/non-row types */
  value: any
}

/** Action which opens a page */
export interface OpenPageActionDef extends ActionDef {
  type: "openPage"

  pageType: "normal" | "modal"

  /** Size of the modal to open. Default is "large" */
  modalSize?: "small" | "normal" | "large" | "full"

  /** Title of page to open */
  title?: LocalizedString | null

  /** Expression embedded in the text string. Referenced by {0}, {1}, etc. */
  titleEmbeddedExprs?: EmbeddedExpr[] 

  /** id of the widget that will be displayed in the page */
  widgetId: string | null

  /** Values of context variables that widget inside page needs */
  contextVarValues: { [contextVarId: string]: ContextVarRef | ContextVarNull | ContextVarLiteral }

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
      const contextVarValue = this.actionDef.contextVarValues[widgetCV.id]
      if (contextVarValue.type == "ref") {
        const srcCV = designCtx.contextVars.find(cv => cv.id === contextVarValue.contextVarId)
        if (!srcCV || !areContextVarCompatible(srcCV, widgetCV)) {
          return "Invalid context variable"
        }
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

  async performAction(instanceCtx: InstanceCtx): Promise<void> {
    const contextVarValues = {}

    // Perform mappings 
    for (const cvid of Object.keys(this.actionDef.contextVarValues)) {
      const contextVarValue = this.actionDef.contextVarValues[cvid]
      if (contextVarValue.type == "ref") {
        // Look up outer context variable
        const outerCV = instanceCtx.contextVars.find(cv => cv.id == contextVarValue.contextVarId)
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

        // Inline variables used in rowsets as they may depend on context variables that aren't present in new page
        if (outerCV.type == "rowset") {
          outerCVValue = new ExprUtils(instanceCtx.schema, createExprVariables(instanceCtx.contextVars)).inlineVariableValues(outerCVValue, createExprVariableValues(instanceCtx.contextVars, instanceCtx.contextVarValues))
        }

        contextVarValues[cvid] = outerCVValue
      }
      else if (contextVarValue.type == "null") {
        contextVarValues[cvid] = null
      }
      else if (contextVarValue.type == "literal") {
        contextVarValues[cvid] = contextVarValue.value
      }
    }

    // Include global context variables
    for (const globalContextVar of instanceCtx.globalContextVars || []) {
      contextVarValues[globalContextVar.id] = instanceCtx.contextVarValues[globalContextVar.id]
    }

    // Get title
    let title = localize(this.actionDef.title, instanceCtx.locale)

    if (title) {
      // Get any embedded expression values
      const exprValues: any[] = []
      for (const ee of this.actionDef.titleEmbeddedExprs || []) {
        const contextVar = ee.contextVarId ? instanceCtx.contextVars.find(cv => cv.id == ee.contextVarId)! : null
        exprValues.push(await evalContextVarExpr({ 
          contextVar,
          contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
          ctx: instanceCtx,
          expr: ee.expr }))
      }

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
      modalSize: this.actionDef.modalSize || "large",
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

    const renderContextVarValue = (contextVar: ContextVar) => {
      const cvr = actionDef.contextVarValues[contextVar.id]
      const handleCVRChange = (cvr: ContextVarNull | ContextVarRef | ContextVarLiteral) => {
        props.onChange(produce(actionDef, (draft) => {
          draft.contextVarValues[contextVar.id] = cvr
        }))
      }

      // Create options list
      const options: { value: ContextVarNull | ContextVarRef | ContextVarLiteral, label: string }[] = [
        { value: { type: "null" }, label: "No Value" },
        { value: { type: "literal", value: null }, label: "Literal Value" }
      ]

      for (const cv of props.contextVars) {
        if (areContextVarCompatible(cv, contextVar)) {
          options.push({ value: { type: "ref", contextVarId: cv.id }, label: cv.name })
        }
      }

      return (
        <tr key={contextVar.id}>
          <td key="name">{contextVar.name}</td>
          <td key="value">
            <Select
              options={options}                    
              value={cvr && cvr.type == "literal" ? { type: "literal", value: null } : cvr}
              onChange={handleCVRChange}
              nullLabel="Select..."
            />
            { !cvr ? <span className="text-warning">Value not set</span> : null}
            { cvr && cvr.type == "literal" ?
              <ExprComponent
                schema={props.schema}
                dataSource={props.dataSource}
                table={contextVar.table || null}
                value={cvr.value}
                onChange={expr => { handleCVRChange({ ...cvr, value: expr })}}
              />
            : null }
          </td>
        </tr>
      )
}

    const renderContextVarValues = () => {
      if (!widgetDef) {
        return null
      }

      return (
        <table className="table table-bordered table-condensed">
          <tbody>
            { widgetDef.contextVars.map(renderContextVarValue) }
          </tbody>
        </table>
      )
    }

    return (
      <div>
        <LabeledProperty label="Page Type">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="pageType">
            {(value, onChange) => <Toggle value={value} onChange={onChange} options={[{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        { this.actionDef.pageType == "modal" ?
          <LabeledProperty label="Modal Size">
            <PropertyEditor obj={this.actionDef} onChange={onChange} property="modalSize">
              {(value, onChange) => 
                <Toggle 
                  value={value || "large"} 
                  onChange={onChange} 
                  options={[
                    { value: "small", label: "Small" },
                    { value: "normal", label: "Normal" }, 
                    { value: "large", label: "Large" }, 
                    { value: "full", label: "Full-screen" }
                  ]} 
                />
               }
            </PropertyEditor>
          </LabeledProperty>
      : null}

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

/** 
 * Determine if context variables are compatible to be passed in. 
 */
function areContextVarCompatible(cv1: ContextVar, cv2: ContextVar) {
  if (cv1.type != cv2.type) {
    return false
  } 
  if (cv1.table != cv2.table) {
    return false
  }
  if (cv1.idTable != cv2.idTable) {
    return false
  }
  if (cv1.enumValues && !cv2.enumValues) {
    return false
  }
  if (!cv1.enumValues && cv2.enumValues) {
    return false
  }
  if (cv1.enumValues && cv2.enumValues) {
    if (!_.isEqual(cv1.enumValues.map(ev => ev.id), cv2.enumValues.map(ev => ev.id))) {
      return false
    }
  }
  return true
}