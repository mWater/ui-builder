import * as React from "react"
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock"
import { Column, LocalizedString } from "mwater-expressions"
import { localize } from "../../localization"
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from "../../propertyEditors"
import { NumberInput, Checkbox, Select } from "react-library/lib/bootstrap"
import { DesignCtx } from "../../../contexts"

export interface NumberboxBlockDef extends ControlBlockDef {
  type: "numberbox"

  placeholder: LocalizedString | null

  /** True to display decimal places */
  decimal: boolean

  /** Number of decimal places to always display/restrict to */
  decimalPlaces?: number | null

  /** Width of number box (default "12em") */
  width?: "8em" | "12em" | "16em" | "100%"
}

export class NumberboxBlock extends ControlBlock<NumberboxBlockDef> {
  renderControl(props: RenderControlProps) {
    return (
      <NumberInput
        value={props.value}
        onChange={props.onChange}
        style={{ maxWidth: this.blockDef.width || "12em", width: "100%" }}
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
        <LabeledProperty label="Width">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="width">
            {(value, onChange) => 
              <Select 
                value={value || "12em"} 
                onChange={onChange}
                options={[
                  { value: "8em", label: "8em" },
                  { value: "12em", label: "12em" },
                  { value: "16em", label: "16em" },
                  { value: "100%", label: "100%" }
                ]}
              />
            }
          </PropertyEditor>
        </LabeledProperty>
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
