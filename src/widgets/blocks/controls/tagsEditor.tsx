import _ from "lodash"
import React, { CSSProperties } from "react"
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock"
import { Column } from "mwater-expressions"
import AsyncCreatableSelect from "react-select/async-creatable"
import { Database, QueryOptions } from "../../../database/Database"
import ReactSelect from "react-select"

export interface TagsEditorBlockDef extends ControlBlockDef {
  type: "tagsEditor"
}

/** Block which shows a dropdown control to select existing or create new tags */
export class TagsEditorBlock extends ControlBlock<TagsEditorBlockDef> {
  renderControl(props: RenderControlProps) {
    const styles = {
      control: (base: React.CSSProperties) => ({ ...base, minWidth: 150 }),
      // Keep menu above other controls
      menuPortal: (style: React.CSSProperties) => ({ ...style, zIndex: 2000 })
    }

    // If can't be displayed properly
    const defaultControl = (
      <div style={{ padding: 5 }}>
        <ReactSelect classNamePrefix="react-select-short" styles={styles} menuPortalTarget={document.body} />
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

    return (
      <TagEditorInstance
        table={props.rowContextVar.table!}
        disabled={props.disabled}
        column={column.id}
        database={props.database}
        value={props.value}
        onChange={props.onChange}
      />
    )
  }

  /** Filter the columns that this control is for. Must be text[] */
  filterColumn(column: Column) {
    return !column.expr && column.type == "text[]"
  }
}

/** Allows editing of a series of tags, allowing selecting existing or creating new */
class TagEditorInstance extends React.Component<{
  table: string
  column: string
  database: Database
  value: string[] | null
  onChange?: (value: string[] | null) => void
  disabled: boolean
}> {
  /** Options to be displayed (unfiltered) */
  options: { value: string; label: string }[]

  async loadOptions() {
    const { table, column } = this.props

    // Query all distinct values, which will include possibly more than one copy of each text string, as it
    // can appear in different combinations
    const queryOptions: QueryOptions = {
      select: { value: { type: "field", table, column } },
      distinct: true,
      from: table,
      where: {
        type: "op",
        op: "is not null",
        table,
        exprs: [{ type: "field", table, column }]
      },
      limit: 250
    }

    try {
      const rows = await this.props.database.query(queryOptions, [], {})

      // Flatten and keep distinct
      const values = _.uniq(_.flatten(rows.map((r) => r.value))).sort()
      return values.map((v) => ({ value: v, label: v }))
    } catch (err) {
      // TODO localize
      alert("Unable to load options")
      return []
    }
  }

  getOptions = async (input: string) => {
    // Load options if not loaded
    if (!this.options) {
      this.options = await this.loadOptions()
    }

    // Filter by input string
    if (input) {
      return this.options.filter((o) => o.label.toLowerCase().startsWith(input.toLowerCase()))
    } else {
      return this.options
    }
  }

  handleChange = (value: any) => {
    if (!this.props.onChange) {
      return
    }

    if (value) {
      this.props.onChange(value.map((v: any) => v.value))
    } else {
      this.props.onChange(null)
    }
  }

  render() {
    const styles = {
      control: (style: CSSProperties) => ({ ...style }),
      menuPortal: (style: CSSProperties) => ({ ...style, zIndex: 2000 })
    }

    return (
      <AsyncCreatableSelect
        cacheOptions
        defaultOptions
        loadOptions={this.getOptions}
        styles={styles}
        value={this.props.value ? this.props.value.map((v) => ({ value: v, label: v })) : null}
        classNamePrefix="react-select-short"
        menuPortalTarget={document.body}
        isMulti={true}
        onChange={this.handleChange}
        isDisabled={this.props.disabled || !this.props.onChange}
      />
    )
  }
}
