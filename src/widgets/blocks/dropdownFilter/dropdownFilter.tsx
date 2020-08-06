import * as React from 'react';
import LeafBlock from '../../LeafBlock'
import { BlockDef, Filter, ContextVar, createExprVariables } from '../../blocks'
import { Expr, ExprValidator, Schema, ExprUtils, LocalizedString } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor, EmbeddedExprsEditor, OrderByArrayEditor } from '../../propertyEditors';
import { ExprComponent, FilterExprComponent } from 'mwater-expressions-ui';
import { localize } from '../../localization';
import ReactSelect from "react-select"
import EnumInstance from './EnumInstance';
import TextInstance from './TextInstance';
import DateExprComponent, { toExpr, DateValue } from './DateExprComponent';
import produce from 'immer';
import { DesignCtx, InstanceCtx } from '../../../contexts';
import EnumsetInstance from './EnumsetInstance';
import { EmbeddedExpr, validateEmbeddedExprs } from '../../../embeddedExprs';
import { OrderBy } from '../../../database/Database';
import { IdInstance } from './IdInstance';
import { Toggle } from 'react-library/lib/bootstrap';
import ListEditor from '../../ListEditor';

export interface DropdownFilterBlockDef extends BlockDef {
  type: "dropdownFilter"

  /** Placeholder in box */
  placeholder: LocalizedString | null

  /** Id of context variable of rowset to filter */
  rowsetContextVarId: string | null

  /** Expression to filter on */
  filterExpr: Expr

  /** Default value of filter */
  defaultValue?: any

  /** Additional rowsets to be filtered by same value */
  extraFilters?: ExtraFilter[]

  // ----------- date type options
  

  // ----------- id type options
  /** True to use "within" operator. Only for hierarchical tables  */
  idWithin?: boolean

  /** Optional filter to limit the id choices */
  idFilterExpr?: Expr

  /** There are two modes for id fields: simple (just a label expression) and advanced (custom format for label, separate search and order) */
  idMode?: "simple" | "advanced"

  /** Simple mode: Text expression to display for entries of type id */
  idLabelExpr?: Expr

  /** Advanced mode: Label for id selections with {0}, {1}, etc embedded in it */
  idLabelText?: LocalizedString | null

  /** Advanced mode: Expressions embedded in the id label text string. Referenced by {0}, {1}, etc. Context variable is ignored */
  idLabelEmbeddedExprs?: EmbeddedExpr[] 

  /** Advanced mode: Text/enum expressions to search on */
  idSearchExprs?: Expr[]

  /** Advanced mode: sort order of results */
  idOrderBy?: OrderBy[] | null  
}

/** Additional rowset to be filtered */
interface ExtraFilter {
  /** Id of context variable of rowset to filter */
  rowsetContextVarId: string | null

  /** Expression to filter on  */
  filterExpr: Expr
}

export class DropdownFilterBlock extends LeafBlock<DropdownFilterBlockDef> {
  validate(options: DesignCtx) {
    // Validate rowset
    const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return "Rowset required"
    }

    if (!this.blockDef.filterExpr) {
      return "Filter expression required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    
    // Validate expr
    let error
    error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "enumset", "text", "date", "datetime", "id"] })
    if (error) {
      return error
    }

    const exprUtils = new ExprUtils(options.schema, createExprVariables(options.contextVars))
    const valueType = exprUtils.getExprType(this.blockDef.filterExpr)!
    const valueIdTableId = exprUtils.getExprIdTable(this.blockDef.filterExpr)

    // Validate extra filter exprs
    if (this.blockDef.extraFilters) {
      for (const extraFilter of this.blockDef.extraFilters) {
        // Validate rowset
        const extraRowsetCV = options.contextVars.find(cv => cv.id === extraFilter.rowsetContextVarId && cv.type === "rowset")
        if (!extraRowsetCV) {
          return "Rowset required"
        }

        if (!extraFilter.filterExpr) {
          return "Filter expression required"
        }

        // Validate expr
        let error
        error = exprValidator.validateExpr(extraFilter.filterExpr, { 
          table: extraRowsetCV.table, 
          types: [valueType],
          idTable: valueIdTableId || undefined
        })
        if (error) {
          return error
        }
      }
    }

    if (valueType === "id") {
      if (!valueIdTableId) {
        return "Id table required"
      }
      const valueIdTable = options.schema.getTable(valueIdTableId)
      if (!valueIdTable) {
        return "Id table missing"
      }

      const idMode = this.blockDef.idMode || "simple"
      const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))

      if (this.blockDef.idWithin && !valueIdTable.ancestry && !valueIdTable.ancestryTable) {
        return "Within requires hierarchical table"
      }

      if (idMode == "simple") {
        if (!this.blockDef.idLabelExpr)  {
          return "Label Expression required"
        }

        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.idLabelExpr || null, { table: valueIdTableId, types: ["text"] })
        if (error) {
          return error
        }
      }
      else {
        // Complex mode
        if (!this.blockDef.idLabelText) {
          return "Label required"
        }
        if (!this.blockDef.idLabelEmbeddedExprs || this.blockDef.idLabelEmbeddedExprs.length == 0) {
          return "Label embedded expressions required"
        }
        if (!this.blockDef.idOrderBy || this.blockDef.idOrderBy.length == 0) {
          return "Label order by required"
        }
        if (!this.blockDef.idSearchExprs || this.blockDef.idSearchExprs.length == 0) {
          return "Label search required"
        }

        // Validate embedded expressions
        error = validateEmbeddedExprs({
          embeddedExprs: this.blockDef.idLabelEmbeddedExprs,
          schema: options.schema,
          contextVars: this.generateEmbedContextVars(valueIdTableId)
        })

        if (error) {
          return error
        }

        // Validate orderBy
        for (const orderBy of this.blockDef.idOrderBy || []) {
          error = exprValidator.validateExpr(orderBy.expr, { table: valueIdTableId })
          if (error) {
            return error
          }
        }

        // Validate search
        for (const searchExpr of this.blockDef.idSearchExprs) {
          if (!searchExpr) {
            return "Search expression required"
          }
    
          // Validate expr
          error = exprValidator.validateExpr(searchExpr, { table: valueIdTableId, types: ["text", "enum", "enumset"] })
          if (error) {
            return error
          }
        }
      }
    }

    return null
  }

  /** Generate a single synthetic context variable to allow embedded expressions to work in label */
  generateEmbedContextVars(idTable: string): ContextVar[] {
    return [
      { id: "dropdown-embed", name: "Label", table: idTable, type: "row" }
    ]
  }
  
  createFilter(rowsetContextVarId: string, filterExpr: Expr, schema: Schema, contextVars: ContextVar[], value: any): Filter {
    const exprUtils = new ExprUtils(schema, createExprVariables(contextVars))
    const valueType = exprUtils.getExprType(filterExpr)
    const valueIdTable = exprUtils.getExprIdTable(filterExpr)
    const contextVar = contextVars.find(cv => cv.id === rowsetContextVarId)!
    const table = contextVar.table!

    switch (valueType) {
      case "enum":
        return {
          id: this.blockDef.id,
          expr: value ? { type: "op", table: table, op: "=", exprs: [filterExpr!, { type: "literal", valueType: "enum", value: value }]} : null,
          memo: value
        }
      case "enumset":
        return {
          id: this.blockDef.id,
          expr: value ? { type: "op", table: table, op: "intersects", exprs: [filterExpr!, { type: "literal", valueType: "enumset", value: value }]} : null,
          memo: value
        }
      case "text":
        return {
          id: this.blockDef.id,
          expr: value ? { type: "op", table: table, op: "=", exprs: [filterExpr!, { type: "literal", valueType: "text", value: value }]} : null,
          memo: value
        }
      case "date":
        return {
          id: this.blockDef.id,
          expr: toExpr(table, filterExpr!, false, value),
          memo: value
        }
      case "datetime":
        return {
          id: this.blockDef.id,
          expr: toExpr(table, filterExpr!, true, value),
          memo: value
        }
      case "id":
        return {
          id: this.blockDef.id,
          expr: value ? { 
            type: "op", 
            table: table, 
            op: this.blockDef.idWithin ? "within" : "=", 
            exprs: [filterExpr!, { type: "literal", valueType: "id", idTable: valueIdTable!, value: value }]
          } : null,
          memo: value
        }
    }

    throw new Error("Unknown type")
  }

  renderDesign(props: DesignCtx) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const styles = {
      control: (base: React.CSSProperties) => ({ ...base, minWidth: 150 }),
      // Keep menu above other controls
      menuPortal: (style: React.CSSProperties) => ({ ...style, zIndex: 2000 })
    }

    const placeholder = localize(this.blockDef.placeholder, props.locale)
    const valueType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr)

    const handleSetDefault = (defaultValue: any) => {
      props.store.alterBlock(this.blockDef.id, (bd) => {
        return { ...bd, defaultValue }
      })
    }

    if (valueType === "date" || valueType === "datetime") {
      // Fake table
      const table = contextVar ? contextVar.table || "" : ""
      return (
        <div style={{ padding: 5 }}>
          <DateExprComponent 
            table={table} 
            datetime={valueType === "datetime"} 
            value={this.blockDef.defaultValue} 
            onChange={handleSetDefault} 
            placeholder={placeholder}
            locale={props.locale}/>
        </div>
      )
    }

    // Allow setting default for enum and enumset
    switch (valueType) {
      case "enum":
        return <EnumInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={this.blockDef.defaultValue}
          onChange={handleSetDefault}
          locale={props.locale} />
      case "enumset":
        return <EnumsetInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={this.blockDef.defaultValue}
          onChange={handleSetDefault}
          locale={props.locale} />
    }

    return <div style={{ padding: 5 }}>
      <ReactSelect 
        classNamePrefix="react-select-short" 
        styles={styles} 
        placeholder={placeholder}
        menuPortalTarget={document.body}
      />
    </div>
  }

  getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[] { 
    const filters: Filter[] = []
    if (contextVarId == this.blockDef.rowsetContextVarId) {
      if (this.blockDef.defaultValue) {
        filters.push(this.createFilter(this.blockDef.rowsetContextVarId, this.blockDef.filterExpr, instanceCtx.schema, instanceCtx.contextVars, this.blockDef.defaultValue))
      }
    }

    // Add extra filters
    for (const extraFilter of this.blockDef.extraFilters || []) {
      if (contextVarId == extraFilter.rowsetContextVarId) {
        if (this.blockDef.defaultValue) {
          filters.push(this.createFilter(extraFilter.rowsetContextVarId, extraFilter.filterExpr, instanceCtx.schema, instanceCtx.contextVars, this.blockDef.defaultValue))
        }
      }
    }

    return filters
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)!
    const filter = props.getFilters(this.blockDef.rowsetContextVarId!).find(f => f.id === this.blockDef.id)
    const value = filter ? filter.memo : null

    const handleChange = (newValue: any) => {
      // Create filter
      const newFilter = this.createFilter(this.blockDef.rowsetContextVarId!, this.blockDef.filterExpr, props.schema, props.contextVars, newValue)
      props.setFilter(contextVar.id, newFilter)

      // Create extra filters
      for (const extraFilter of this.blockDef.extraFilters || []) {
        const newExtraFilter = this.createFilter(extraFilter.rowsetContextVarId!, extraFilter.filterExpr, props.schema, props.contextVars, newValue)
        props.setFilter(extraFilter.rowsetContextVarId!, newExtraFilter)
      }
    }

    const exprUtils = new ExprUtils(props.schema, createExprVariables(props.contextVars))
    const valueType = exprUtils.getExprType(this.blockDef.filterExpr)
    const placeholder = localize(this.blockDef.placeholder, props.locale)

    let elem: React.ReactElement<any>

    switch (valueType) {
      case "enum":
        elem = <EnumInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          onChange={handleChange}
          locale={props.locale} />
        break
      case "enumset":
        elem = <EnumsetInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          onChange={handleChange}
          locale={props.locale} />
        break
      case "text":
        elem = <TextInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          database={props.database}
          onChange={handleChange}
          locale={props.locale} />
        break
      case "date":
        elem = <DateExprComponent 
          datetime={false} 
          table={contextVar.table!} 
          value={value} 
          onChange={handleChange} 
          placeholder={placeholder}
          locale={props.locale}
         />
        break
      case "datetime":
        elem = <DateExprComponent 
          datetime={true} 
          table={contextVar.table!} 
          value={value} 
          onChange={handleChange} 
          placeholder={placeholder}
          locale={props.locale}
        />
        break
      case "id":
        elem = <IdInstance 
          blockDef={this.blockDef}
          ctx={props}
          value={value}
          onChange={handleChange}
          locale={props.locale} />
        break
      default:
        elem = <div/>
    }

    return <div style={{ padding: 5 }}>{elem}</div>
  }    

  renderEditor(ctx: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = ctx.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const idMode = this.blockDef.idMode || "simple"
    const exprUtils = new ExprUtils(ctx.schema, createExprVariables(ctx.contextVars))
    const isIdType = exprUtils.getExprType(this.blockDef.filterExpr) == "id"
    const idTableId = exprUtils.getExprIdTable(this.blockDef.filterExpr)
    const idTable = idTableId ? ctx.schema.getTable(idTableId) : null
    const isIdTableHierarchical = idTable ? idTable.ancestryTable != null || idTable.ancestry != null : null

    const handleExprChange = (expr: Expr) => {
      ctx.store.replaceBlock(produce(this.blockDef, (draft) => {
        // Clear default value if expression changes
        draft.filterExpr = expr
        delete draft.defaultValue
      }))
    }

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="rowsetContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={ctx.contextVars} types={["rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        {rowsetCV ?
          <LabeledProperty label="Filter expression">
            <ExprComponent 
              value={this.blockDef.filterExpr} 
              schema={ctx.schema} 
              dataSource={ctx.dataSource} 
              onChange={handleExprChange} 
              table={rowsetCV.table!} 
              types={["enum", "enumset", "text", "date", "datetime", "id"]} />
          </LabeledProperty>
        : null}

        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={ctx.locale} />}
          </PropertyEditor>
        </LabeledProperty>

        { isIdType ?
          <LabeledProperty label="Mode" key="mode">
            <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idMode">
              {(value, onChange) => 
                <Toggle 
                  value={value || "simple"} 
                  onChange={onChange} 
                  options={[
                    { value: "simple", label: "Simple" },
                    { value: "advanced", label: "Advanced" }
                  ]} />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { isIdTableHierarchical ?
          <LabeledProperty label="Match Mode" key="within">
            <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idWithin">
              {(value, onChange) => 
                <Toggle 
                  value={value || false} 
                  onChange={onChange} 
                  options={[
                    { value: false, label: "Exact" },
                    { value: true, label: "Is Within" }
                  ]} />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { isIdType && idMode == "simple" ?
          <LabeledProperty label="Label Expression" key="idLabelExpr">
            <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idLabelExpr">
              {(value, onChange) => <ExprComponent 
                value={value || null} 
                onChange={onChange} 
                schema={ctx.schema}
                dataSource={ctx.dataSource}
                types={["text"]}
                table={idTableId!}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { isIdType && idMode == "advanced" ?
          <div>
            <LabeledProperty label="Label" key="idLabelText">
              <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idLabelText">
                {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={ctx.locale} />}
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty label="Embedded label expressions" help="Reference in text as {0}, {1}, etc." key="idLabelEmbeddedExprs">
              <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idLabelEmbeddedExprs">
                {(value: EmbeddedExpr[] | null | undefined, onChange) => (
                  <EmbeddedExprsEditor 
                    value={value} 
                    onChange={onChange} 
                    schema={ctx.schema} 
                    dataSource={ctx.dataSource}
                    contextVars={this.generateEmbedContextVars(idTableId!)} />
                )}
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty label="Option ordering" key="idOrderBy">
              <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idOrderBy">
                {(value, onChange) => 
                  <OrderByArrayEditor 
                    value={value || []} 
                    onChange={onChange} 
                    schema={ctx.schema} 
                    dataSource={ctx.dataSource} 
                    contextVars={ctx.contextVars}
                    table={idTableId!} /> }
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty label="Search expressions" key="idSearchExprs">
              <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idSearchExprs">
                {(value, onItemsChange) => {
                  const handleAddSearchExpr = () => {
                    onItemsChange((value || []).concat(null))
                  }
                  return (
                    <div>
                      <ListEditor items={value || []} onItemsChange={onItemsChange}>
                        { (expr: Expr, onExprChange) => (
                          <ExprComponent value={expr} schema={ctx.schema} dataSource={ctx.dataSource} onChange={onExprChange} table={idTableId!} types={["text", "enum", "enumset"]} />
                        )}
                      </ListEditor>
                      <button type="button" className="btn btn-link btn-sm" onClick={handleAddSearchExpr}>
                        + Add Expression
                      </button>
                    </div>
                  )
                }}
              </PropertyEditor>
            </LabeledProperty>
          </div>
        : null }
        { isIdType ?
          <LabeledProperty label="Filter expression for id table" key="idFilterExpr">
            <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="idFilterExpr">
              {(value, onChange) => <FilterExprComponent 
                value={value} 
                onChange={onChange} 
                schema={ctx.schema}
                dataSource={ctx.dataSource}
                table={idTableId!}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { rowsetCV && this.blockDef.filterExpr ?
          <LabeledProperty label="Additional filters on other rowsets">
            <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="extraFilters">
              {(value, onItemsChange) => {
                const handleAddExtraFilter = () => {
                  onItemsChange((value || []).concat({ rowsetContextVarId: null, filterExpr: null }))
                }
                return (
                  <div>
                    <ListEditor items={value || []} onItemsChange={onItemsChange}>
                      { (extraFilter: ExtraFilter, onExtraFilterChange) => {
                        const extraFilterCV = ctx.contextVars.find(cv => cv.id === extraFilter.rowsetContextVarId)
                        return <div>
                          <LabeledProperty label="Rowset">
                            <PropertyEditor obj={extraFilter} onChange={onExtraFilterChange} property="rowsetContextVarId">
                              {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={ctx.contextVars} types={["rowset"]} />}
                            </PropertyEditor>
                          </LabeledProperty>
                  
                          { extraFilterCV ?
                            <LabeledProperty label="Filter expression">
                              <PropertyEditor obj={extraFilter} onChange={onExtraFilterChange} property="filterExpr">
                                {(value, onChange) => <ExprComponent 
                                  value={value} 
                                  schema={ctx.schema} 
                                  dataSource={ctx.dataSource} 
                                  onChange={onChange} 
                                  table={extraFilterCV.table!} 
                                  types={["enum", "enumset", "text", "date", "datetime", "id"]} /> 
                                }
                              </PropertyEditor>
                            </LabeledProperty>
                          : null}
                        </div>                      
                      }}
                    </ListEditor>
                    <button type="button" className="btn btn-link btn-sm" onClick={handleAddExtraFilter}>
                      + Add Filter
                    </button>
                  </div>
                )
              }}
            </PropertyEditor>
          </LabeledProperty>
          : null }
      </div>
    )
  }
}
