import * as React from "react"
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock"
import { Column, LocalizedString } from "mwater-expressions"
import { localize } from "../../localization"
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from "../../propertyEditors"
import { NumberInput, Checkbox } from "react-library/lib/bootstrap"
import { DesignCtx } from "../../../contexts"

export interface NumberboxBlockDef extends ControlBlockDef {
  type: "numberbox"

  placeholder: LocalizedString | null

  /** True to display decimal places */
  decimal: boolean

  /** Number of decimal places to always display/restrict to */
  decimalPlaces?: number | null
}

export class NumberboxBlock extends ControlBlock<NumberboxBlockDef> {
  renderControl(props: RenderControlProps) {
    return (
      <NumberInput
        value={props.value}
        onChange={props.onChange}
        style={{ maxWidth: "12em", width: "100%" }}
        placeholder={localize(this.blockDef.placeholder, props.locale)}
        decimal={this.blockDef.decimal}
        decimalPlaces={this.blockDef.decimalPlaces != null ? this.blockDef.decimalPlaces : undefined}
      />
    )
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="placeholder">
            {(value, onChange) => (
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="decimal">
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              {" "}
              Decimal Number
            </Checkbox>
          )}
        </PropertyEditor>
        {this.blockDef.decimal ? (
          <LabeledProperty label="Decimal Places">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="decimalPlaces">
              {(value, onChange) => <NumberInput value={value} onChange={onChange} decimal={false} />}
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

    return column.type === "number"
  }
}
