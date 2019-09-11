import * as React from 'react';
import { BlockDef, RenderEditorProps, ValidateBlockOptions, createExprVariables } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, EnumValue, Expr, ExprValidator, ExprCompiler, LocalizedString } from 'mwater-expressions';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import ReactSelect from "react-select"
import { IdLiteralComponent, ExprComponent, FilterExprComponent } from 'mwater-expressions-ui';
import { NumberInput, Checkbox } from 'react-library/lib/bootstrap';

export interface NumberboxBlockDef extends ControlBlockDef {
  type: "numberbox"

  placeholder: LocalizedString | null

  /** True to display decimal places */
  decimal: boolean

  /** Number of decimal places to always display/restrict to */
  decimalPlaces?: number
}

export class NumberboxBlock extends ControlBlock<NumberboxBlockDef> {
  renderControl(props: RenderControlProps) {
    return <NumberInput
      value={props.value} 
      onChange={props.onChange}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      decimal={this.blockDef.decimal}
      decimalPlaces={this.blockDef.decimalPlaces}
    />
  }


  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="decimal">
          {(value, onChange) => <Checkbox 
            value={value} 
            onChange={onChange}> Decimal Number
            </Checkbox>
          }
        </PropertyEditor>
        { this.blockDef.decimal ?
          <LabeledProperty label="Decimal Places">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="decimalPlaces">
              {(value, onChange) => <NumberInput value={value} onChange={onChange} decimal={false} /> }
            </PropertyEditor>
        </LabeledProperty>
       : null}
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
