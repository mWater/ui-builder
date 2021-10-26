import _ from "lodash"
import ClickOutHandler from "react-onclickout"
import DatePicker from "react-datepicker"
import moment from "moment"
import React from "react"
import { Expr, LocalizedString } from "mwater-expressions"
import "react-datepicker/dist/react-datepicker.css"
import "./datepicker-tweaks.css"
import { localize } from "../../localization"

/** Either range or preset id or null */
export type DateValue = [string | null, string | null] | string | null

interface Props {
  value: DateValue
  onChange: (value: DateValue) => void
  /** true to use datetime */
  datetime: boolean
  table: string
  placeholder?: string
  locale: string
}

interface State {
  dropdownOpen: boolean
  /** True when custom dates displayed */
  custom: boolean
}

interface Preset {
  id: string
  name: LocalizedString
}

const presets: Preset[] = [
  {
    id: "thisyear",
    name: {
      _base: "en",
      en: "This Year",
      es: "Este año"
    }
  },
  {
    id: "lastyear",
    name: {
      _base: "en",
      en: "Last Year",
      es: "El año pasado"
    }
  },
  {
    id: "thismonth",
    name: {
      _base: "en",
      en: "This Month",
      es: "Este mes"
    }
  },
  {
    id: "lastmonth",
    name: {
      _base: "en",
      en: "Last Month",
      es: "Último Mes"
    }
  },
  {
    id: "today",
    name: {
      _base: "en",
      en: "Today",
      es: "Hoy"
    }
  },
  {
    id: "yesterday",
    name: {
      _base: "en",
      en: "Yesterday",
      es: "Ayer"
    }
  },
  {
    id: "last24hours",
    name: {
      _base: "en",
      en: "In Last 24 Hours",
      es: "En las últimas 24 horas"
    }
  },
  {
    id: "last7days",
    name: {
      _base: "en",
      en: "In Last 7 Days",
      es: "En los últimos 7 días"
    }
  },
  {
    id: "last30days",
    name: {
      _base: "en",
      en: "In Last 30 Days",
      es: "En los últimos 30 días"
    }
  },
  {
    id: "last365days",
    name: {
      _base: "en",
      en: "In Last 365 Days",
      es: "En los últimos 365 días"
    }
  }
]

const toLiteral = (datetime: boolean, value: string | null): Expr => {
  if (!value) {
    return null
  }

  if (datetime) {
    return { type: "literal", valueType: "datetime", value: value }
  } else {
    return { type: "literal", valueType: "date", value: value }
  }
}

/** Convert a filter value to an expression */
export const createDateFilterExpr = (table: string, expr: Expr, datetime: boolean, value: DateValue): Expr => {
  if (!value) {
    return null
  }

  if (Array.isArray(value)) {
    return {
      type: "op",
      op: "between",
      table: table,
      exprs: [expr, toLiteral(datetime, value[0]), toLiteral(datetime, value[1])]
    }
  }

  // Preset
  return {
    type: "op",
    op: value,
    table: table,
    exprs: [expr]
  }
}

/** Allows selection of a date range including presets */
export default class DateExprComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      dropdownOpen: false,
      custom: false
    }
  }

  toMoment(value: string | null) {
    if (!value) {
      return null
    }

    if (this.props.datetime) {
      return moment(value, moment.ISO_8601)
    } else {
      return moment(value, "YYYY-MM-DD")
    }
  }

  fromMoment(value?: moment.Moment) {
    if (!value) {
      return null
    }

    if (this.props.datetime) {
      return value.toISOString()
    } else {
      return value.format("YYYY-MM-DD")
    }
  }

  handleClickOut = () => {
    this.setState({ dropdownOpen: false })
  }

  handleCustom = () => {
    this.setState({ custom: true })
  }

  handleStartChange = (value: moment.Moment) => {
    // Clear end if after
    if (_.isArray(this.props.value) && this.props.value[1] && this.fromMoment(value)! > this.props.value[1]!) {
      this.props.onChange([this.fromMoment(value), null])
    } else {
      this.props.onChange([this.fromMoment(value), _.isArray(this.props.value) ? this.props.value[1] : null])
    }
  }

  handleEndChange = (value: moment.Moment) => {
    // Go to end of day if datetime
    if (this.props.datetime) {
      value = moment(value)
      value.endOf("day")
    }

    // Clear start if before
    if (_.isArray(this.props.value) && this.props.value[0] && this.fromMoment(value)! < this.props.value[0]!) {
      this.props.onChange([null, this.fromMoment(value)])
    } else {
      this.props.onChange([_.isArray(this.props.value) ? this.props.value[0] : null, this.fromMoment(value)])
    }

    this.setState({ dropdownOpen: false })
  }

  handlePreset = (preset: Preset) => {
    this.props.onChange(preset.id)
    this.setState({ dropdownOpen: false })
  }

  handleOpen = () => {
    this.setState({ dropdownOpen: true, custom: false })
  }

  renderClear() {
    return (
      <div
        style={{ position: "absolute", right: 10, top: 7, color: "#AAA" }}
        onClick={this.props.onChange.bind(null, null)}
      >
        <i className="fa fa-remove" />
      </div>
    )
  }

  renderSummary() {
    if (!this.props.value) {
      return <span className="text-muted">{this.props.placeholder || ""}</span>
    }

    const preset = presets.find((p) => p.id === this.props.value)
    if (preset) {
      return localize(preset.name, this.props.locale)
    }

    if (Array.isArray(this.props.value)) {
      const startDate = this.toMoment(this.props.value[0])
      const endDate = this.toMoment(this.props.value[1])

      // Add/subtract hours to work around https://github.com/moment/moment/issues/2749
      if (this.props.datetime) {
        return (
          (startDate ? startDate.add("hours", 3).format("ll") : "") +
          " - " +
          (endDate ? endDate.subtract("hours", 3).format("ll") : "")
        )
      } else {
        return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "")
      }
    }

    return "???"
  }

  renderPresets() {
    return (
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 4000,
          padding: 5,
          border: "solid 1px #AAA",
          backgroundColor: "white",
          borderRadius: 4
        }}
      >
        <ul className="nav nav-pills nav-stacked">
          {presets.map((preset) => {
            return (
              <li key={preset.id}>
                <a style={{ padding: 5 }} onClick={this.handlePreset.bind(null, preset)}>
                  {localize(preset.name, this.props.locale)}
                </a>
              </li>
            )
          })}
          <li>
            <a style={{ padding: 5 }} onClick={this.handleCustom}>
              {localize(
                {
                  _base: "en",
                  en: "Custom Date Range...",
                  es: "Rango de fechas personalizado...."
                },
                this.props.locale
              )}
            </a>
          </li>
        </ul>
      </div>
    )
  }

  renderDropdown() {
    if (this.state.custom) {
      return this.renderCustomDropdown()
    } else {
      return this.renderPresets()
    }
  }

  renderCustomDropdown() {
    const startDate = this.toMoment(_.isArray(this.props.value) ? this.props.value[0] : null) || undefined
    const endDate = this.toMoment(_.isArray(this.props.value) ? this.props.value[1] : null) || undefined

    return (
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 4000,
          padding: 5,
          border: "solid 1px #AAA",
          backgroundColor: "white",
          borderRadius: 4
        }}
      >
        <div style={{ whiteSpace: "nowrap" }}>
          <div style={{ display: "inline-block", verticalAlign: "top" }}>
            <DatePicker
              inline={true}
              selectsStart={true}
              selected={startDate}
              startDate={startDate}
              endDate={endDate}
              showYearDropdown={true}
              onChange={this.handleStartChange}
            />
          </div>

          <div style={{ display: "inline-block", verticalAlign: "top" }}>
            <DatePicker
              inline={true}
              selectsEnd={true}
              selected={endDate}
              startDate={startDate}
              endDate={endDate}
              showYearDropdown={true}
              onChange={this.handleEndChange}
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    return (
      <ClickOutHandler onClickOut={this.handleClickOut}>
        <div style={{ display: "inline-block", position: "relative" }}>
          <div className="form-control" style={{ width: 220, height: 34 }} onClick={this.handleOpen}>
            {this.renderSummary()}
          </div>
          {this.props.value && this.props.onChange ? this.renderClear() : null}
          {this.state.dropdownOpen ? this.renderDropdown() : null}
        </div>
      </ClickOutHandler>
    )
  }
}
