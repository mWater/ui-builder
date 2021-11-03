import _ from "lodash"
import React, { useState } from "react"
import LeafBlock from "../LeafBlock"
import { BlockDef, ContextVar } from "../blocks"
import {
  LabeledProperty,
  LocalizedTextPropertyEditor,
  PropertyEditor,
  ActionDefEditor,
  EmbeddedExprsEditor
} from "../propertyEditors"
import { localize } from "../localization"
import { ActionDef } from "../actions"
import { Select, Checkbox, Toggle } from "react-library/lib/bootstrap"
import { Expr, LocalizedString } from "mwater-expressions"
import { DesignCtx, InstanceCtx } from "../../contexts"
import { EmbeddedExpr, validateEmbeddedExprs, formatEmbeddedExprString } from "../../embeddedExprs"

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
  icon?:
    | "plus"
    | "times"
    | "pencil"
    | "print"
    | "upload"
    | "download"
    | "info-circle"
    | "link"
    | "external-link"
    | "search"
    | "question-circle"
    | "folder-open"
    | "refresh"
    | "arrow-right"

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
      contextVars: designCtx.contextVars
    })

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
      exprs = exprs.concat(
        _.compact(_.map(this.blockDef.labelEmbeddedExprs, (ee) => (ee.contextVarId === contextVar.id ? ee.expr : null)))
      )
    }

    return exprs
  }

  renderDesign(props: DesignCtx) {
    const label = localize(this.blockDef.label, props.locale)
    return <ButtonComponent label={label} blockDef={this.blockDef} />
  }

  renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any> {
    return <ButtonInstance blockDef={this.blockDef} instanceCtx={instanceCtx} />
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Label">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="label">
            {(value, onChange) => (
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            )}
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
                contextVars={props.contextVars}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Style">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="style">
            {(value, onChange) => (
              <Toggle
                value={value}
                onChange={onChange}
                options={[
                  { value: "default", label: "Default" },
                  { value: "primary", label: "Primary" },
                  { value: "link", label: "Link" },
                  { value: "plainlink", label: "Plain Link" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        {this.blockDef.style != "plainlink" ? (
          <LabeledProperty label="Size">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="size">
              {(value, onChange) => (
                <Toggle
                  value={value}
                  onChange={onChange}
                  options={[
                    { value: "normal", label: "Default" },
                    { value: "small", label: "Small" },
                    { value: "large", label: "Large" },
                    { value: "extrasmall", label: "X-small (deprecated)" }
                  ]}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        <LabeledProperty label="Icon">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="icon">
            {(value, onChange) => (
              <Select
                value={value}
                onChange={onChange}
                nullLabel="None"
                options={[
                  { value: "plus", label: "Add" },
                  { value: "pencil", label: "Edit" },
                  { value: "times", label: "Remove" },
                  { value: "print", label: "Print" },
                  { value: "upload", label: "Upload" },
                  { value: "download", label: "Download" },
                  { value: "info-circle", label: "Information" },
                  { value: "link", label: "Link" },
                  { value: "external-link", label: "External Link" },
                  { value: "search", label: "Search" },
                  { value: "question-circle", label: "Help" },
                  { value: "folder-open", label: "Open" },
                  { value: "refresh", label: "Refresh" },
                  { value: "arrow-right", label: "Right Arrow" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        {this.blockDef.style != "plainlink" ? (
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="block">
            {(value, onChange) => (
              <Checkbox value={value} onChange={onChange}>
                Block-style
              </Checkbox>
            )}
          </PropertyEditor>
        ) : null}
        <LabeledProperty label="When button clicked">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="actionDef">
            {(value, onChange) => <ActionDefEditor value={value} onChange={onChange} designCtx={props} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Confirm message">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="confirmMessage">
            {(value, onChange) => (
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            )}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

function ButtonInstance(props: { instanceCtx: InstanceCtx; blockDef: ButtonBlockDef }) {
  const { instanceCtx, blockDef } = props

  // Track when action in process
  const [busy, setBusy] = useState(false)

  const handleClick = async (ev: React.MouseEvent) => {
    // Ensure button doesn't trigger other actions
    ev.stopPropagation()

    // Confirm if confirm message
    if (blockDef.confirmMessage) {
      if (!confirm(localize(blockDef.confirmMessage, instanceCtx.locale))) {
        return
      }
    }

    // Run action
    if (blockDef.actionDef) {
      const action = instanceCtx.actionLibrary.createAction(blockDef.actionDef)
      try {
        setBusy(true)
        await action.performAction(instanceCtx)
      } finally {
        setBusy(false)
      }
    }
  }

  // Get label
  let label = localize(blockDef.label, instanceCtx.locale)

  if (label) {
    // Get any embedded expression values
    const exprValues = _.map(blockDef.labelEmbeddedExprs || [], (ee) =>
      instanceCtx.getContextVarExprValue(ee.contextVarId!, ee.expr)
    )

    // Format and replace
    label = formatEmbeddedExprString({
      text: label,
      embeddedExprs: blockDef.labelEmbeddedExprs || [],
      exprValues: exprValues,
      schema: instanceCtx.schema,
      contextVars: instanceCtx.contextVars,
      locale: instanceCtx.locale,
      formatLocale: instanceCtx.formatLocale
    })
  }

  return <ButtonComponent blockDef={blockDef} label={label} onClick={handleClick} busy={busy} />
}

/** Draws the button */
function ButtonComponent(props: {
  blockDef: ButtonBlockDef
  label: string
  onClick?: (ev: React.MouseEvent) => void
  busy?: boolean
}) {
  const { label, onClick, blockDef } = props

  const icon = blockDef.icon ? <i className={`fa fa-fw fa-${blockDef.icon}`} /> : null

  // Special case of plain link
  if (blockDef.style == "plainlink") {
    return (
      <div>
        <a className="link-plain" onClick={props.onClick}>
          {icon}
          {icon && label ? "\u00A0" : null}
          {label}
        </a>
      </div>
    )
  }
  let className = "btn btn-" + (blockDef.style == "default" ? "secondary" : blockDef.style)

  switch (blockDef.size) {
    case "normal":
      break
    case "small":
      className += ` btn-sm`
      break
    // DEPRECATED
    case "extrasmall":
      className += ` btn-sm`
      break
    case "large":
      className += ` btn-lg`
      break
  }

  if (blockDef.block) {
    className += " btn-block"
  }

  const style: React.CSSProperties = {}
  if (!blockDef.block) {
    style.margin = 5
  }
  else {
    style.display = "grid"
    style.marginBottom = 5
  }

  return (
    <div style={style} >
      <button type="button" className={className} onClick={props.onClick} disabled={props.busy}>
        {props.busy && icon ? <i className="fa fa-spinner fa-spin fa-fw" /> : icon}
        {icon && label ? "\u00A0" : null}
        {label}
      </button>
    </div>
  )
}
