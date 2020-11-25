import _ from 'lodash'
import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, ContextVar } from '../blocks'
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, ActionDefEditor, EmbeddedExprsEditor } from '../propertyEditors';
import { localize } from '../localization';
import { ActionDef } from '../actions';
import { Select, Checkbox, Toggle } from 'react-library/lib/bootstrap';
import { Expr, LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { EmbeddedExpr, validateEmbeddedExprs, formatEmbeddedExprString } from '../../embeddedExprs';

export interface ButtonBlockDef extends BlockDef {
  type: "button"
  label: LocalizedString | null

  /** Expressions embedded in the label string. Referenced by {0}, {1}, etc. */
  labelEmbeddedExprs?: EmbeddedExpr[] 

  /** Action to perform when button is clicked */
  actionDef?: ActionDef | null

  /** plainlink is a plain link without padding */
  style: "default" | "primary" | "link" | "plainlink"
  size: "normal" | "small" | "large" | "extrasmall"
  icon?: "plus" | "times" | "pencil" | "print" | "upload" | "download"

  /** True to make block-style button */
  block?: boolean

  /** If present, message to display when confirming action */
  confirmMessage?: LocalizedString | null
}

export class ButtonBlock extends LeafBlock<ButtonBlockDef> {
  validate(designCtx: DesignCtx) { 
    let error: string | null

    // Validate expressions
    error = validateEmbeddedExprs({
      embeddedExprs: this.blockDef.labelEmbeddedExprs || [],
      schema: designCtx.schema,
      contextVars: designCtx.contextVars})

    if (error) {
      return error
    }
    
    // Validate action
    if (this.blockDef.actionDef) {
      const action = designCtx.actionLibrary.createAction(this.blockDef.actionDef)

      error = action.validate(designCtx)
      if (error) {
        return error
      }
    }
    return null 
  }

  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] { 
    let exprs: Expr[] = []

    if (this.blockDef.labelEmbeddedExprs) {
      exprs = exprs.concat(_.compact(_.map(this.blockDef.labelEmbeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null)))
    }

    return exprs
  }
 
  renderButton(label: string, onClick: () => void) {
    const icon = this.blockDef.icon ? <i className={`fa fa-${this.blockDef.icon}`}/> : null

    const handleClick = (ev: React.MouseEvent) => {
      // Ensure button doesn't trigger other actions
      ev.stopPropagation()
      onClick()
    }

    // Special case of plain link
    if (this.blockDef.style == "plainlink") {
      return <a onClick={handleClick} style={{ cursor: "pointer" }}>
        { icon }
        { icon && label ? "\u00A0" : null }
        { label }
      </a>
    }
    let className = "btn btn-" + this.blockDef.style

    switch (this.blockDef.size) {
      case "normal":
        break
      case "small":
        className += ` btn-sm`
        break
      case "extrasmall":
        className += ` btn-xs`
        break
        case "large":
        className += ` btn-lg`
        break
    }

    if (this.blockDef.block) {
      className += " btn-block"
    }

    const style: React.CSSProperties = {}
    if (!this.blockDef.block) {
      style.margin = 5
    }

    return (
      <button type="button" className={className} onClick={handleClick} style={style}>
        { icon }
        { icon && label ? "\u00A0" : null }
        { label }
      </button>
    )
  }

  renderDesign(props: DesignCtx) {
    const label = localize(this.blockDef.label, props.locale)
    return this.renderButton(label, (() => null))
  }

  renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any> {
    const handleClick = () => {
      // Confirm if confirm message
      if (this.blockDef.confirmMessage) {
        if (!confirm(localize(this.blockDef.confirmMessage, instanceCtx.locale))) {
          return
        }
      }

      // Run action
      if (this.blockDef.actionDef) {
        const action = instanceCtx.actionLibrary.createAction(this.blockDef.actionDef)

        action.performAction(instanceCtx)
      }
    }

    // Get label
    let label = localize(this.blockDef.label, instanceCtx.locale)

    if (label) {
      // Get any embedded expression values
      const exprValues = _.map(this.blockDef.labelEmbeddedExprs || [], ee => instanceCtx.getContextVarExprValue(ee.contextVarId!, ee.expr))

      // Format and replace
      label = formatEmbeddedExprString({
        text: label, 
        embeddedExprs: this.blockDef.labelEmbeddedExprs || [],
        exprValues: exprValues,
        schema: instanceCtx.schema,
        contextVars: instanceCtx.contextVars,
        locale: instanceCtx.locale, 
        formatLocale: instanceCtx.formatLocale
      })
    }

    return this.renderButton(label, handleClick)
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Label">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="label">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Label embedded expressions" help="Reference in text as {0}, {1}, etc.">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="labelEmbeddedExprs">
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
        <LabeledProperty label="Style">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="style">
            {(value, onChange) => 
            <Toggle value={value} onChange={onChange}
              options={[
                { value: "default", label: "Default"},
                { value: "primary", label: "Primary"},
                { value: "link", label: "Link"},
                { value: "plainlink", label: "Plain Link"},
              ]}
            /> }
          </PropertyEditor>
        </LabeledProperty>
        { this.blockDef.style != "plainlink" ?
        <LabeledProperty label="Size">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="size">
            {(value, onChange) => 
            <Toggle value={value} onChange={onChange}
              options={[
                { value: "normal", label: "Default"},
                { value: "small", label: "Small"},
                { value: "extrasmall", label: "Extra-small"},
                { value: "large", label: "Large"}
            ]}/> }
          </PropertyEditor>
        </LabeledProperty>
        : null }
        <LabeledProperty label="Icon">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="icon">
            {(value, onChange) => 
            <Select value={value} onChange={onChange}
              nullLabel="None"
              options={[
                { value: "plus", label: "Add"},
                { value: "pencil", label: "Edit"},
                { value: "times", label: "Remove"},
                { value: "print", label: "Print"},
                { value: "upload", label: "Upload"},
                { value: "download", label: "Download"}
            ]}/> }
          </PropertyEditor>
        </LabeledProperty>
        { this.blockDef.style != "plainlink" ?
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="block">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Block-style</Checkbox>}
        </PropertyEditor>
        : null }
        <LabeledProperty label="When button clicked">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="actionDef">
            {(value, onChange) => (
              <ActionDefEditor 
                value={value} 
                onChange={onChange} 
                designCtx={props} />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Confirm message">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="confirmMessage">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
