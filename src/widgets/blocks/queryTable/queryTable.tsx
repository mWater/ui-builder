import produce from 'immer'
import * as React from 'react';
import * as _ from 'lodash'
import CompoundBlock from '../../CompoundBlock';
import { BlockDef, ContextVar, ChildBlock, ValidateBlockOptions, createExprVariables } from '../../blocks'
import { Expr, Schema, ExprUtils, ExprValidator, LocalizedString, Row } from 'mwater-expressions';
import { OrderBy } from '../../../database/Database';
import QueryTableBlockInstance from './QueryTableBlockInstance';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, ActionDefEditor, OrderByArrayEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import { NumberInput, Select, Checkbox } from 'react-library/lib/bootstrap';
import { ExprComponent } from 'mwater-expressions-ui';
import { ActionDef } from '../../actions';
import { WidgetLibrary } from '../../../designer/widgetLibrary';
import { ActionLibrary } from '../../ActionLibrary';
import { DesignCtx, InstanceCtx } from '../../../contexts';

export interface QueryTableBlockDef extends BlockDef {
  type: "queryTable"

  /** Determines if one table row contains one or multiple database table rows */
  mode: "singleRow" | "multiRow"  
  headers: Array<BlockDef | null>
  contents: Array<BlockDef | null>

  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  limit: number | null
  where: Expr
  orderBy: OrderBy[] | null

  /** Action to be executed when row is clicked */
  rowClickAction: ActionDef | null

  /** Message to display when there are no rows */
  noRowsMessage?: LocalizedString | null

  /** True to hide headers */
  hideHeaders?: boolean

  /** Borders (default is "horizontal") */
  borders?: "horizontal" | "all"

  /** Table padding (default is "normal") */
  padding?: "normal" | "compact"
}

export class QueryTableBlock extends CompoundBlock<QueryTableBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Get rowset context variable
    const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const headerChildren: ChildBlock[] = _.compact(this.blockDef.headers).map(bd => ({ blockDef: bd!, contextVars: contextVars }))
    const contentChildren: ChildBlock[] = _.compact(this.blockDef.contents).map(bd => ({ blockDef: bd!, contextVars: rowsetCV ? contextVars.concat(this.createRowContextVar(rowsetCV)) : contextVars }))
    return headerChildren.concat(contentChildren)
  }

  validate(options: ValidateBlockOptions) { 
    // Validate rowset
    const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return "Rowset required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    let error: string | null
    
    // Validate where
    error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table })
    if (error) {
      return error
    }

    // TODO Validate order by

    // Validate action
    if (this.blockDef.rowClickAction) {
      const action = options.actionLibrary.createAction(this.blockDef.rowClickAction)

      // Create row context variable
      const rowCV = this.createRowContextVar(rowsetCV)
      error = action.validate({
        schema: options.schema,
        contextVars: options.contextVars.concat(rowCV),
        widgetLibrary: options.widgetLibrary
      })
      if (error) {
        return error
      }
    }

    return null
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const headers = this.blockDef.headers.map(b => action(b))
    const contents = this.blockDef.contents.map(b => action(b))

    return produce(this.blockDef, draft => {
      draft.headers = headers
      draft.contents = contents
    })
  }

  /** Create the context variable used */
  createRowContextVar(rowsetCV: ContextVar): ContextVar {
    switch (this.blockDef.mode) {
      case "singleRow":
        return { id: this.getRowContextVarId(), name: "Table row", type: "row", table: rowsetCV.table }
      case "multiRow":
        return { id: this.getRowContextVarId(), name: "Table row rowset", type: "rowset", table: rowsetCV.table }
    }
    throw new Error("Unknown mode")
  }

  getRowContextVarId() {
    switch (this.blockDef.mode) {
      case "singleRow":
        return this.blockDef.id + "_row"
      case "multiRow":
        return this.blockDef.id + "_rowset"
    }
  }

  /** Get list of expressions used in a row by content blocks */
  getRowExprs(contextVars: ContextVar[], ctx: DesignCtx | InstanceCtx): Expr[] {
    const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return []
    }

    let exprs: Expr[] = []
    
    const rowCV = this.createRowContextVar(rowsetCV)

    // Get expressions for all content blocks
    for (const contentBlockDef of this.blockDef.contents) {
      if (contentBlockDef) {
        exprs = exprs.concat(this.createBlock(contentBlockDef).getSubtreeContextVarExprs(rowCV, {
          ...ctx,
          contextVars: contextVars.concat([rowCV])
        }))
      }
    }

    // Get action expressions too
    if (this.blockDef.rowClickAction) {
      const action = ctx.actionLibrary.createAction(this.blockDef.rowClickAction)
      exprs = exprs.concat(action.getContextVarExprs(rowCV))
    }
    return exprs
  }

  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] { 
    // Include action expressions
    if (this.blockDef.rowClickAction) {
      const action = ctx.actionLibrary.createAction(this.blockDef.rowClickAction)
      return action.getContextVarExprs(contextVar)
    }

    return [] 
  }


  /** 
   * Get the value of the row context variable for a specific row. 
   * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
   * contextVars: includes rowsetCV and row one
   */
  getRowContextVarValue(row: Row, rowExprs: Expr[], schema: Schema, rowsetCV: ContextVar, contextVars: ContextVar[]): any {
    switch (this.blockDef.mode) {
      case "singleRow":
        return row.id
      case "multiRow":
        const exprUtils = new ExprUtils(schema, createExprVariables(contextVars))

        // Create "and" filter
        const ands: Expr[] = []
        rowExprs.forEach((expr, index) => {
          if (exprUtils.getExprAggrStatus(expr) === "individual") {
            ands.push({
              type: "op",
              op: "=",
              table: rowsetCV.table!,
              exprs: [
                expr,
                { type: "literal", valueType: exprUtils.getExprType(expr)!, value: row["e" + index] }
              ]
            })
          }
        })
        return (ands.length > 0) ? { type: "op", op: "and", table: rowsetCV.table!, exprs: ands } : null
    }
  }

  renderDesign(props: DesignCtx) {
    const setHeader = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce(b => {
        b!.headers[index] = blockDef
      }), blockDef.id)
    }

    const setContent = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce(b => {
        b!.contents[index] = blockDef
      }), blockDef.id)
    }

    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    let contentProps = props
    
    // Add context variable if knowable
    if (rowsetCV) {
      contentProps = { ...contentProps, contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) }
    }

    let className = "table"
    switch (this.blockDef.borders || "horizontal") {
      case "all":
        className += " table-bordered"
        break
    }

    switch (this.blockDef.padding || "normal") {
      case "compact":
        className += " table-condensed"
        break
    }

    return (
      <table className={className}>
        { !this.blockDef.hideHeaders ? 
        <thead>
          <tr>
            { this.blockDef.headers.map((b, index) => {
              return <th key={index}>{props.renderChildBlock(props, b, setHeader.bind(null, index))}</th>
            })}
          </tr>
        </thead>
        : null }
        <tbody>
          <tr>
            { this.blockDef.contents.map((b, index) => {
              return <td key={index}>{props.renderChildBlock(contentProps, b, setContent.bind(null, index))}</td>
            })}
          </tr>
        </tbody>
      </table>
    )
  }

  renderInstance(props: InstanceCtx) {
    return <QueryTableBlockInstance block={this} instanceCtx={props}/>
  }

  renderEditor(props: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null

    const handleAddColumn = () => {
      props.store.replaceBlock(produce(this.blockDef, b => {
        b.headers.push(null)
        b.contents.push(null)
      }))
    }

    // Remove last column
    const handleRemoveColumn = () => {
      props.store.replaceBlock(produce(this.blockDef, b => {
        if (b.headers.length > 1) {
          b.headers.splice(b.headers.length - 1, 1)
          b.contents.splice(b.contents.length - 1, 1)
        }
      }))
    }

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowsetContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Mode">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="mode">
            {(value, onChange) => <Select value={value} onChange={onChange} options={[{ value: "singleRow", label: "One item per row" }, { value: "multiRow", label: "Multiple item per row" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        { rowsetCV ?
          <LabeledProperty label="Filter">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="where">
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

        { rowCV ? 
        <LabeledProperty label="Ordering">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="orderBy">
            {(value, onChange) => 
              <OrderByArrayEditor 
                value={value} 
                onChange={onChange} 
                schema={props.schema} 
                dataSource={props.dataSource} 
                contextVars={props.contextVars}
                table={rowsetCV!.table!} /> }
          </PropertyEditor>
        </LabeledProperty>
        : null }

        <LabeledProperty label="Maximum rows">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="limit">
            {(value, onChange) => <NumberInput value={value} onChange={onChange} decimal={false} />}
          </PropertyEditor>
        </LabeledProperty>
        
        { rowCV ? 
          <LabeledProperty label="When row clicked">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowClickAction">
              {(value, onChange) => (
                <ActionDefEditor 
                  value={value} 
                  onChange={onChange} 
                  locale={props.locale}
                  schema={props.schema}
                  dataSource={props.dataSource}
                  actionLibrary={props.actionLibrary} 
                  widgetLibrary={props.widgetLibrary}
                  contextVars={props.contextVars.concat(rowCV)} />
              )}
            </PropertyEditor>
          </LabeledProperty>
        : null } 

        <LabeledProperty label="Message to display when no rows">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="noRowsMessage">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="hideHeaders">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Hide Headers</Checkbox>}
        </PropertyEditor>

        <LabeledProperty label="Borders">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="borders">
            {(value, onChange) => <Select value={value || "horizontal"} onChange={onChange} options={[{ value: "horizontal", label: "Horizontal" }, { value: "all", label: "All" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Padding">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="padding">
            {(value, onChange) => <Select value={value || "normal"} onChange={onChange} options={[{ value: "normal", label: "Normal" }, { value: "compact", label: "Compact" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        <button type="button" className="btn btn-link btn-sm" onClick={handleAddColumn}>
          <i className="fa fa-plus"/> Add Column
        </button>
        <button type="button" className="btn btn-link btn-sm" onClick={handleRemoveColumn}>
          <i className="fa fa-minus"/> Remove Column
        </button>
      </div>
    )
  }
}

