import produce from 'immer'
import * as React from 'react'
import { Block, BlockDef, ContextVar, ChildBlock, createExprVariables } from '../../blocks'
import { DesignCtx, InstanceCtx } from '../../../contexts'
import LeafBlock from '../../LeafBlock'
import { GanttChart } from 'react-library/lib/GanttChart'
import { Expr, ExprValidator, LocalizedString } from 'mwater-expressions'
import { ActionDefEditor, ContextVarPropertyEditor, EmbeddedExprsEditor, LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor } from '../../propertyEditors'
import { ExprComponent } from 'mwater-expressions-ui'
import { localize } from '../../localization'
import { Select, TextInput } from 'react-library/lib/bootstrap'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { GanttChartInstance } from './GanttChartInstance'
import { ActionDef } from '../../actions'

/** Gantt chart */
export interface GanttChartBlockDef extends BlockDef {
  type: "ganttChart"

  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  /** Filter which rows are included */
  filter: Expr

  /** Allows overriding start date of chart */
  startDate: string | null

  /** Allows overriding end date of chart */
  endDate: string | null

  /** Expression which gives start date of rows */
  rowStartDateExpr: Expr

  /** Expression which gives end date of rows */
  rowEndDateExpr: Expr

  /** Expression which gives label of rows */
  rowLabelExpr: Expr

  /** Column that determines order of the rows. Should be number column to be re-orderable */
  rowOrderColumn: string | null

  /** Column that is parent row. Should be id type if present */
  rowParentColumn: string | null

  /** Action to perform when row is clicked */
  rowClickAction?: ActionDef | null

  /** Action to perform when row is added */
  addRowAction?: ActionDef | null

  /** Color of bars. Defaults to #68cdee */
  barColor: string | null
}

export class GanttChartBlock extends LeafBlock<GanttChartBlockDef> {
  validate(designCtx: DesignCtx) { 
    // Validate rowset
    const rowsetCV = designCtx.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return "Rowset required"
    }

    const exprValidator = new ExprValidator(designCtx.schema, createExprVariables(designCtx.contextVars))
    let error: string | null
    
    // Validate filter
    error = exprValidator.validateExpr(this.blockDef.filter, { table: rowsetCV.table, types: ["boolean"] })
    if (error) {
      return error
    }

    // Validate rowStartDateExpr
    error = exprValidator.validateExpr(this.blockDef.rowStartDateExpr, { table: rowsetCV.table, types: ["date", "datetime"] })
    if (error) {
      return error
    }
    
    // Validate rowEndDateExpr
    error = exprValidator.validateExpr(this.blockDef.rowEndDateExpr, { table: rowsetCV.table, types: ["date", "datetime"] })
    if (error) {
      return error
    }
    
    // Validate rowLabelExpr
    error = exprValidator.validateExpr(this.blockDef.rowLabelExpr, { table: rowsetCV.table, types: ["text"] })
    if (error) {
      return error
    }

    // Validate rowOrderColumn
    if (this.blockDef.rowOrderColumn) {
      const col = designCtx.schema.getColumn(rowsetCV.table!, this.blockDef.rowOrderColumn)
      if (!col) {
        return "Order column not found"
      }
    }
    else {
      return "Order column required"
    }

    // Validate rowParentColumn
    if (this.blockDef.rowParentColumn) {
      const col = designCtx.schema.getColumn(rowsetCV.table!, this.blockDef.rowParentColumn)
      if (!col) {
        return "Parent column not found"
      }
      if (col.type != "id" || col.idTable != rowsetCV.table) {
        return "Parent column invalid"
      }
    }

    // Validate actions
    if (this.blockDef.rowClickAction) {
      const action = designCtx.actionLibrary.createAction(this.blockDef.rowClickAction)

      // Create row context variable
      const rowCV = this.createRowContextVar(rowsetCV)
      error = action.validate({ ...designCtx, contextVars: designCtx.contextVars.concat(rowCV) })
      if (error) {
        return error
      }
    }

    if (this.blockDef.addRowAction) {
      const action = designCtx.actionLibrary.createAction(this.blockDef.addRowAction)
      error = action.validate({ ...designCtx, contextVars: designCtx.contextVars.concat([
        this.createAddRowOrderContextVar(rowsetCV),
        this.createAddRowParentContextVar(rowsetCV),
       ]) })
      if (error) {
        return error
      }
    }

    return null
  }

  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] { 
    let exprs: Expr[] = []

    // Include action expressions
    if (this.blockDef.rowClickAction) {
      const action = ctx.actionLibrary.createAction(this.blockDef.rowClickAction)
      exprs = exprs.concat(action.getContextVarExprs(contextVar))
    }

    if (this.blockDef.addRowAction) {
      const action = ctx.actionLibrary.createAction(this.blockDef.addRowAction)
      exprs = exprs.concat(action.getContextVarExprs(contextVar))
    }

    return [] 
  }

  /** Create the context variable used */
  createRowContextVar(rowsetCV: ContextVar): ContextVar {
    return { id: this.blockDef.id + "_row", name: `GANTT Row of ${rowsetCV.name}`, type: "row", table: rowsetCV.table }
  }

  /** Create context variables that add row action receives */
  createAddRowOrderContextVar(rowsetCV: ContextVar): ContextVar {
    return { id: this.blockDef.id + "_add_order", name: `Order of new GANTT row`, type: "number" }
  }

  /** Create context variables that add row action receives */
  createAddRowParentContextVar(rowsetCV: ContextVar): ContextVar {
    return { id: this.blockDef.id + "_add_parent", name: `Parent of new GANTT row`, type: "id", table: rowsetCV.table! }
  }
  
  renderDesign(ctx: DesignCtx) {
    const barColor = this.blockDef.barColor || "#68cdee" 
    
    return <GanttChart
      rows={[
        { color: barColor, level: 0, startDate: "2020-01-14", endDate: "2020-05-23", label: "Activity 1" },
        { color: barColor, level: 1, startDate: "2020-02-14", endDate: "2020-06-23", label: "Activity 2" },
        { color: barColor, level: 2, startDate: "2020-04-12", endDate: null, label: "Activity 3" }
      ]}
      startDate="2020-01-01"
      endDate="2020-07-01"
      T={ctx.T} />
  }

  renderInstance(ctx: InstanceCtx) {
    return <GanttChartInstance block={this} ctx={ctx} />
  }

  renderEditor(props: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowsetContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        { rowsetCV ?
          <LabeledProperty label="Label">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowLabelExpr">
              {(value: Expr, onChange) => (
                  <ExprComponent 
                    value={value} 
                    onChange={onChange} 
                    schema={props.schema} 
                    dataSource={props.dataSource} 
                    types={["text"]}
                    variables={createExprVariables(props.contextVars)}
                    table={rowsetCV!.table!}/>
                )}
            </PropertyEditor>
          </LabeledProperty>
        : null }

        { rowsetCV ?
          <LabeledProperty label="Start Date of Rows">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowStartDateExpr">
              {(value: Expr, onChange) => (
                  <ExprComponent 
                    value={value} 
                    onChange={onChange} 
                    schema={props.schema} 
                    dataSource={props.dataSource} 
                    types={["date", "datetime"]}
                    variables={createExprVariables(props.contextVars)}
                    table={rowsetCV!.table!}/>
                )}
            </PropertyEditor>
          </LabeledProperty>
        : null }

        { rowsetCV ?
          <LabeledProperty label="End Date of Rows">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowEndDateExpr">
              {(value: Expr, onChange) => (
                  <ExprComponent 
                    value={value} 
                    onChange={onChange} 
                    schema={props.schema} 
                    dataSource={props.dataSource} 
                    types={["date", "datetime"]}
                    variables={createExprVariables(props.contextVars)}
                    table={rowsetCV!.table!}/>
                )}
            </PropertyEditor>
          </LabeledProperty>
        : null }

        { rowsetCV ?
          <LabeledProperty label="Filter">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="filter">
              {(value: Expr, onChange) => (
                  <ExprComponent 
                    value={value} 
                    onChange={onChange} 
                    schema={props.schema} 
                    dataSource={props.dataSource} 
                    types={["boolean"]}
                    variables={createExprVariables(props.contextVars)}
                    table={rowsetCV!.table!}/>
                )}
            </PropertyEditor>
          </LabeledProperty>
        : null }

      { rowsetCV ?
        <LabeledProperty label="Order By Column">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowOrderColumn">
            {(value, onChange) => {
              const columnOptions = props.schema.getColumns(rowsetCV.table!)
                .filter(c => c.type == "date" || c.type == "datetime" || c.type == "number")
                .map(c => ({ value: c.id, label: localize(c.name) }))
              return <Select value={value} onChange={onChange} nullLabel="Select column" options={columnOptions}/>
            }}
          </PropertyEditor>
        </LabeledProperty>
        : null }

      { rowsetCV ?
        <LabeledProperty label="Parent Column" hint="Optional column to make hierarchical">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowParentColumn">
            {(value, onChange) => {
              const columnOptions = props.schema.getColumns(rowsetCV.table!)
                .filter(c => c.type == "id" && c.idTable == rowsetCV.table)
                .map(c => ({ value: c.id, label: localize(c.name) }))
              return <Select value={value} onChange={onChange} nullLabel="None" options={columnOptions}/>
            }}
          </PropertyEditor>
        </LabeledProperty>
        : null }

      <LabeledProperty label="Override Start Date">
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="startDate">
          {(value: string | null, onChange) => (
            <DatePicker
              selected={value ? moment(value, "YYYY-MM-DD") : null}
              onChange={(momentDate) => { onChange(momentDate!.format("YYYY-MM-DD")) }}
              dateFormat="ll"
              isClearable={true}
              className="form-control"
            />
          )}
        </PropertyEditor>
      </LabeledProperty>

      <LabeledProperty label="Override End Date">
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="endDate">
          {(value: string | null, onChange) => (
            <DatePicker
              selected={value ? moment(value, "YYYY-MM-DD") : null}
              onChange={(momentDate) => { onChange(momentDate!.format("YYYY-MM-DD")) }}
              dateFormat="ll"
              isClearable={true}
              className="form-control"
            />
          )}
        </PropertyEditor>
      </LabeledProperty>

      <LabeledProperty label="Bar color" hint="CSS format">
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="barColor">
          {(value: string | null, onChange) => (
            <TextInput
              value={value}
              onChange={onChange}
              emptyNull={true}
              placeholder="#68cdee"
            />
          )}
        </PropertyEditor>
      </LabeledProperty>

      { rowCV ? 
        <LabeledProperty label="When row clicked">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowClickAction">
            {(value, onChange) => (
              <ActionDefEditor 
                value={value} 
                onChange={onChange} 
                designCtx={{ ...props, contextVars: props.contextVars.concat(rowCV) }} />
            )}
          </PropertyEditor>
        </LabeledProperty>
      : null } 

      { rowCV && rowsetCV ? 
        <LabeledProperty label="When row added">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="addRowAction">
            {(value, onChange) => (
              <ActionDefEditor 
                value={value} 
                onChange={onChange} 
                designCtx={{ ...props, contextVars: props.contextVars.concat([this.createAddRowOrderContextVar(rowsetCV), this.createAddRowParentContextVar(rowsetCV)]) }} />
            )}
          </PropertyEditor>
        </LabeledProperty>
      : null } 

    </div>)
  }
}
