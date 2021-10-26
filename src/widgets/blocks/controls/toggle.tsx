import _ from "lodash"
import * as React from "react"
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock"
import { Column, LocalizedString } from "mwater-expressions"
import { localize } from "../../localization"
import { LabeledProperty, PropertyEditor, EnumArrayEditor, LocalizedTextPropertyEditor } from "../../propertyEditors"
import { DesignCtx } from "../../../contexts"

export interface ToggleBlockDef extends ControlBlockDef {
  type: "toggle"

  /** Values to include (if present, only include them) */
  includeValues?: any[] | null

  /** Values to exclude (if present, exclude them) */
  excludeValues?: any[] | null

  /** Label for true value if boolean. Default is "Yes" */
  trueLabel?: LocalizedString | null

  /** Label for false value if boolean. Default is "No" */
  falseLabel?: LocalizedString | null
}

/** Block which shows a toggle to control an enum or boolean or enumset */
export class ToggleBlock extends ControlBlock<ToggleBlockDef> {
  renderControl(props: RenderControlProps) {
    // If can't be displayed properly
    const defaultControl = (
      <div className="btn-group">
        <button key="1" type="button" className="btn btn-primary active">
          Option 1
        </button>
        <button key="2" type="button" className="btn btn-default">
          Option 2
        </button>
      </div>
    )

    // If can't be rendered due to missing context variable, just show error
    if (!props.rowContextVar || !this.blockDef.column) {
      return defaultControl
    }

    // Get column
    const column = props.schema.getColumn(props.rowContextVar.table!, this.blockDef.column)!
    if (!column) {
      return defaultControl
    }

    if (column.type === "enum") {
      return this.renderEnum(props, column)
    }
    if (column.type === "enumset") {
      return this.renderEnumset(props, column)
    }
    if (column.type === "boolean") {
      return this.renderBoolean(props, column)
    }
    throw new Error("Unsupported type")
  }

  renderEnum(props: RenderControlProps, column: Column) {
    var enumValues = column.enumValues!

    // Handle include/exclude
    if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
      enumValues = enumValues.filter((ev) => this.blockDef.includeValues!.includes(ev.id))
    }
    if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
      enumValues = enumValues.filter((ev) => !this.blockDef.excludeValues!.includes(ev.id))
    }

    return (
      <div className="btn-group">
        {enumValues.map((option) => {
          return (
            <button
              key={option.id}
              type="button"
              disabled={props.disabled || !props.onChange}
              className={props.value == option.id ? "btn btn-primary active" : "btn btn-default"}
              onClick={
                props.onChange != null ? () => props.onChange!(option.id == props.value ? null : option.id) : undefined
              }
            >
              {localize(option.name, props.locale)}
            </button>
          )
        })}
      </div>
    )
  }

  renderEnumset(props: RenderControlProps, column: Column) {
    var enumValues = column.enumValues!

    // Handle include/exclude
    if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
      enumValues = enumValues.filter((ev) => this.blockDef.includeValues!.includes(ev.id))
    }
    if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
      enumValues = enumValues.filter((ev) => !this.blockDef.excludeValues!.includes(ev.id))
    }

    const handleToggle = (id: any) => {
      if ((props.value || []).includes(id)) {
        const newValue = _.difference(props.value || [], [id])
        props.onChange!(newValue.length > 0 ? newValue : null)
      } else {
        const newValue = _.union(props.value || [], [id])
        props.onChange!(newValue)
      }
    }

    return (
      <div className="btn-group">
        {enumValues.map((option) => {
          return (
            <button
              key={option.id}
              type="button"
              disabled={props.disabled || !props.onChange}
              className={(props.value || []).includes(option.id) ? "btn btn-primary active" : "btn btn-default"}
              onClick={handleToggle.bind(null, option.id)}
            >
              {localize(option.name, props.locale)}
            </button>
          )
        })}
      </div>
    )
  }

  renderBoolean(props: RenderControlProps, column: Column) {
    return (
      <div className="btn-group">
        <button
          key="true"
          type="button"
          disabled={props.disabled || !props.onChange}
          className={props.value == true ? "btn btn-primary active" : "btn btn-default"}
          onClick={props.onChange ? () => props.onChange!(props.value === true ? null : true) : undefined}
        >
          {localize(this.blockDef.trueLabel, props.locale) || "Yes"}
        </button>
        <button
          key="false"
          type="button"
          disabled={props.disabled || !props.onChange}
          className={props.value == false ? "btn btn-primary active" : "btn btn-default"}
          onClick={props.onChange ? () => props.onChange!(props.value === false ? null : false) : undefined}
        >
          {localize(this.blockDef.falseLabel, props.locale) || "No"}
        </button>
      </div>
    )
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: DesignCtx) {
    const contextVar = props.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId)
    let column: Column | null = null

    if (contextVar && contextVar.table && this.blockDef.column) {
      column = props.schema.getColumn(contextVar.table, this.blockDef.column)
    }

    return (
      <div>
        {column && (column.type === "enum" || column.type === "enumset") ? (
          <LabeledProperty label="Include Values" key="includeValues">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="includeValues">
              {(value, onChange) => (
                <EnumArrayEditor value={value} onChange={onChange} enumValues={column!.enumValues!} />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {column && (column.type === "enum" || column.type === "enumset") ? (
          <LabeledProperty label="Exclude Values" key="excludeValues">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="excludeValues">
              {(value, onChange) => (
                <EnumArrayEditor value={value} onChange={onChange} enumValues={column!.enumValues!} />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {column && column.type === "boolean" ? (
          <LabeledProperty label="Label for true" key="trueLabel" hint="Must be set to allow localization">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="trueLabel">
              {(value, onChange) => (
                <LocalizedTextPropertyEditor
                  value={value}
                  onChange={onChange}
                  locale={props.locale}
                  placeholder="Yes"
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {column && column.type === "boolean" ? (
          <LabeledProperty label="Label for false" key="falseLabel" hint="Must be set to allow localization">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="falseLabel">
              {(value, onChange) => (
                <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} placeholder="No" />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
      </div>
    )
  }

  /** Filter the columns that this control is for. Can't be expression */
  filterColumn(column: Column) {
    if (column.expr) {
      return false
    }

    return column.type === "enum" || column.type === "enumset" || column.type === "boolean"
  }
}
