import * as React from 'react';
import { RenderEditorProps } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, LocalizedString } from 'mwater-expressions';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor, DateFormatEditor, DatetimeFormatEditor } from '../../propertyEditors';
import DatePicker from 'react-datepicker'
import moment, { Moment } from 'moment'

export interface DatefieldBlockDef extends ControlBlockDef {
  type: "datefield"

  placeholder: LocalizedString | null

  /** moment.js format for date (default ll) and datetime (default lll)  */
  format: string | null
}

/** Block that is a text input control linked to a specific field */
export class DatefieldBlock extends ControlBlock<DatefieldBlockDef> {
  renderControl(props: RenderControlProps) {
    // Get column
    let column

    if (props.rowContextVar && this.blockDef.column) {
      column = props.schema.getColumn(props.rowContextVar.table!, this.blockDef.column)
    }

    const datetime = column ? column.type === "datetime" : false
    const format = this.blockDef.format ? this.blockDef.format : (datetime ? "lll" : "ll")

    return <Datefield
      value={props.value} 
      onChange={props.onChange}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      disabled={props.disabled}
      datetime={datetime}
      format={format}
      />
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: RenderEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)

    // Get column
    let column
    if (contextVar && this.blockDef.column) {
      column = props.schema.getColumn(contextVar.table!, this.blockDef.column)
    }

    return (
      <div>
        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>

        { column && column.type === "date" ?
          <LabeledProperty label="Date Format">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="format">
              {(value: string, onChange) => (
                <DateFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { column && column.type === "datetime" ?
          <LabeledProperty label="Date/time Format">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="format">
              {(value: string, onChange) => (
                <DatetimeFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

      </div>
    )
  }

  /** Filter the columns that this control is for */
  filterColumn(column: Column) {
    return column.type === "date" || column.type === "datetime" 
  }

  /** Clear format */
  processColumnChanged(blockDef: DatefieldBlockDef): DatefieldBlockDef {
    return { ...blockDef, format: null }
  }
}

interface DatefieldProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled: boolean
  datetime: boolean
  format: string
}

/** Text box that updates only on blur */
class Datefield extends React.Component<DatefieldProps> {
  handleChange = (value: Moment) => {
    if (this.props.datetime) {
      this.props.onChange(value ? value.toISOString() : null)
    }
    else {
      this.props.onChange(value ? value.format("YYYY-MM-DD") : null)
    }
  }

  render() {
    return (
      <DatePicker
        placeholderText={this.props.placeholder}
        disabled={this.props.disabled}
        selected={this.props.value ? moment(this.props.value, moment.ISO_8601) : null}
        onChange={this.handleChange}
        showTimeSelect={this.props.datetime}
        timeFormat="HH:mm"
        dateFormat={this.props.format}
        className="form-control"
      />
    )
  }
}