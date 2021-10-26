import _ from "lodash"
import { default as React, useEffect, useState } from "react"
import LeafBlock from "../LeafBlock"
import { BlockDef, ContextVar, createExprVariables } from "../blocks"
import { Expr, ExprValidator, Schema, LocalizedString, DataSource } from "mwater-expressions"
import {
  LabeledProperty,
  ContextVarPropertyEditor,
  PropertyEditor,
  LocalizedTextPropertyEditor
} from "../propertyEditors"
import { ExprComponent } from "mwater-expressions-ui"
import { localize } from "../localization"
import { DesignCtx, InstanceCtx } from "../../contexts"
import { Checkbox, Toggle } from "react-library/lib/bootstrap"
import ListEditor from "../ListEditor"

export interface ToggleFilterBlockDef extends BlockDef {
  type: "toggleFilter"

  /** Options to display */
  options: ToggleFilterOption[]

  /** Which option is initially selected */
  initialOption: number | null

  /** True to require a selection at all times */
  forceSelection: boolean

  /** Size of the toggle (default is normal) */
  size?: "normal" | "small" | "large" | "extrasmall"
}

/** Single option to display */
interface ToggleFilterOption {
  /** Label to be displayed */
  label: LocalizedString

  /** Rowset filters to apply */
  filters: RowsetFilter[]
}

/** Filters to be applied to a rowset */
interface RowsetFilter {
  /** Id of context variable of rowset to filter */
  rowsetContextVarId: string | null

  /** Filter to apply. Boolean expression */
  filterExpr: Expr
}

/** Dropdown that filters one or more rowsets. The value of the filter is stored in the memo of the rowset filter
 * and depends on which type of filter it is.
 */
export class ToggleFilterBlock extends LeafBlock<ToggleFilterBlockDef> {
  validate(options: DesignCtx) {
    // Check that at least one option
    if (this.blockDef.options.length == 0) {
      return "At least one option required"
    }

    for (const option of this.blockDef.options) {
      // Validate filters
      for (const filter of option.filters) {
        // Validate rowset
        const rowsetCV = options.contextVars.find((cv) => cv.id === filter.rowsetContextVarId && cv.type === "rowset")
        if (!rowsetCV) {
          return "Rowset required"
        }

        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
        const error = exprValidator.validateExpr(filter.filterExpr, { table: rowsetCV.table, types: ["boolean"] })
        if (error) {
          return error
        }
      }

      // Ensure that a max of one filter per rowset
      if (_.uniq(option.filters.map((f) => f.rowsetContextVarId)).length < option.filters.length) {
        return "Maximum of one filter per rowset per option"
      }
    }

    return null
  }

  canonicalize() {
    if (this.blockDef.forceSelection && this.blockDef.options.length > 0 && this.blockDef.initialOption == null) {
      return { ...this.blockDef, initialOption: 0 }
    }
    return this.blockDef
  }

  renderDesign(props: DesignCtx) {
    const options = this.blockDef.options.map((o, index) => ({ value: index, label: localize(o.label, props.locale) }))
    return (
      <Toggle
        options={options}
        value={this.blockDef.initialOption}
        onChange={(index) =>
          props.store.replaceBlock({ ...this.blockDef, initialOption: index } as ToggleFilterBlockDef)
        }
        allowReset={!this.blockDef.forceSelection}
        size={mapToggleSize(this.blockDef.size)}
      />
    )
  }

  renderInstance(ctx: InstanceCtx) {
    return <ToggleFilterInstance blockDef={this.blockDef} ctx={ctx} />
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Size">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="size">
            {(value, onChange) => (
              <Toggle
                value={value || "normal"}
                onChange={onChange}
                options={[
                  { value: "normal", label: "Default" },
                  { value: "small", label: "Small" },
                  { value: "extrasmall", label: "Extra-small" },
                  { value: "large", label: "Large" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <PropertyEditor
          obj={this.blockDef}
          onChange={props.store.replaceBlock}
          property="forceSelection"
          key="forceSelection"
        >
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              Force Selection
            </Checkbox>
          )}
        </PropertyEditor>
        <LabeledProperty label="Options" key="options">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="options">
            {(value, onOptionsChange) => {
              const handleAddSearchExpr = () => {
                onOptionsChange((value || []).concat({ label: { _base: "en", en: "Option" }, filters: [] }))
              }

              return (
                <div>
                  <ListEditor items={value || []} onItemsChange={onOptionsChange}>
                    {(option: ToggleFilterOption, onOptionChange) => (
                      <EditOptionComponent
                        option={option}
                        contextVars={props.contextVars}
                        schema={props.schema}
                        dataSource={props.dataSource}
                        onChange={onOptionChange}
                        locale={props.locale}
                      />
                    )}
                  </ListEditor>
                  <button type="button" className="btn btn-link btn-sm" onClick={handleAddSearchExpr}>
                    + Add Option
                  </button>
                </div>
              )
            }}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

/** Edits a single toggle option */
function EditOptionComponent(props: {
  option: ToggleFilterOption
  contextVars: ContextVar[]
  schema: Schema
  dataSource: DataSource
  locale: string
  onChange: (option: ToggleFilterOption) => void
}) {
  return (
    <div>
      <LabeledProperty label="Label" key="label">
        <PropertyEditor obj={props.option} onChange={props.onChange} property="label">
          {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="Filters" key="filters">
        <PropertyEditor obj={props.option} onChange={props.onChange} property="filters">
          {(value, onChange) => {
            function handleAddFilter() {
              onChange([...value, { rowsetContextVarId: null, filterExpr: null }])
            }

            return (
              <div>
                <ListEditor items={value} onItemsChange={onChange}>
                  {(filter, onFilterChange) => {
                    return (
                      <EditFilterComponent
                        filter={filter}
                        onChange={onFilterChange}
                        contextVars={props.contextVars}
                        schema={props.schema}
                        dataSource={props.dataSource}
                      />
                    )
                  }}
                </ListEditor>
                <button type="button" className="btn btn-link btn-xs" onClick={handleAddFilter}>
                  + Add Filter
                </button>
              </div>
            )
          }}
        </PropertyEditor>
      </LabeledProperty>
    </div>
  )
}

/** Edits a single filter of an option */
function EditFilterComponent(props: {
  filter: RowsetFilter
  onChange: (filter: RowsetFilter) => void
  contextVars: ContextVar[]
  schema: Schema
  dataSource: DataSource
}) {
  const extraFilterCV = props.contextVars.find((cv) => cv.id === props.filter.rowsetContextVarId)

  return (
    <div>
      <LabeledProperty label="Rowset">
        <PropertyEditor obj={props.filter} onChange={props.onChange} property="rowsetContextVarId">
          {(value, onChange) => (
            <ContextVarPropertyEditor
              value={value}
              onChange={onChange}
              contextVars={props.contextVars}
              types={["rowset"]}
            />
          )}
        </PropertyEditor>
      </LabeledProperty>

      {extraFilterCV ? (
        <LabeledProperty label="Filter expression">
          <PropertyEditor obj={props.filter} onChange={props.onChange} property="filterExpr">
            {(value, onChange) => (
              <ExprComponent
                value={value}
                schema={props.schema}
                dataSource={props.dataSource}
                onChange={onChange}
                table={extraFilterCV.table!}
                variables={createExprVariables(props.contextVars)}
                types={["boolean"]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
      ) : null}
    </div>
  )
}

function ToggleFilterInstance(props: { blockDef: ToggleFilterBlockDef; ctx: InstanceCtx }) {
  const { blockDef, ctx } = props
  const [selectedIndex, setSelectedIndex] = useState(blockDef.initialOption)

  // Set filter
  useEffect(() => {
    // Get all rowset variables possibly used
    const rowsetCVIds = _.uniq(
      _.flattenDeep(blockDef.options.map((o) => o.filters).map((fs) => fs.map((f) => f.rowsetContextVarId!)))
    )

    // For each rowset
    for (const rowsetCVId of rowsetCVIds) {
      // Determine filter
      const option = selectedIndex != null ? blockDef.options[selectedIndex] : null
      const filter = option ? option.filters.find((f) => f.rowsetContextVarId == rowsetCVId) : null
      if (filter) {
        ctx.setFilter(rowsetCVId, {
          id: blockDef.id,
          expr: filter.filterExpr
        })
      } else {
        ctx.setFilter(rowsetCVId, {
          id: blockDef.id,
          expr: null
        })
      }
    }
  }, [selectedIndex])

  const options = blockDef.options.map((o, index) => ({ value: index, label: localize(o.label, ctx.locale) }))

  return (
    <Toggle
      options={options}
      value={selectedIndex}
      onChange={setSelectedIndex}
      allowReset={!blockDef.forceSelection}
      size={mapToggleSize(blockDef.size)}
    />
  )
}

/** Map to toggle sizes */
function mapToggleSize(size: "normal" | "small" | "large" | "extrasmall" | undefined): "xs" | "sm" | "lg" | undefined {
  if (size == "small") {
    return "sm"
  }
  if (size == "large") {
    return "lg"
  }
  if (size == "extrasmall") {
    return "xs"
  }
  return undefined
}
