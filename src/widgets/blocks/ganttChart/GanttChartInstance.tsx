import _ from 'lodash'
import { useEffect, useState } from "react"
import { getFilteredContextVarValues, InstanceCtx } from "../../../contexts"
import { QueryOptions, useDatabaseChangeListener } from "../../../database/Database"
import { GanttChartBlock, GanttChartBlockDef } from "./GanttChart"
import canonical from 'canonical-json'
import React from "react"
import { GanttChart } from "react-library/lib/GanttChart"
import moment from 'moment'
import { produce } from 'immer'

export function GanttChartInstance(props: {
  block: GanttChartBlock
  ctx: InstanceCtx
}) {

  const { block, ctx } = props
  const blockDef = block.blockDef

  const rowsetCV = ctx.contextVars.find(cv => cv.id == blockDef.rowsetContextVarId)!
  const rowCV = block.createRowContextVar(rowsetCV)

  /** Incremented when database changed */
  const dbChanged = useDatabaseChangeListener(ctx.database)

  // Get row expressions that depend on rowCV
  const rowClickAction = blockDef.rowClickAction ? ctx.actionLibrary.createAction(blockDef.rowClickAction) : undefined
  const rowExprs = rowClickAction ? rowClickAction.getContextVarExprs(rowCV) : []

  const table = rowsetCV.table!

  // Determine type of order column
  const orderType = ctx.schema.getColumn(table, blockDef.rowOrderColumn!)!.type

  /** Creates a query */
  const createQuery = () => {
    // Create query
    const query: QueryOptions = {
      select: {
        id: { type: "id", table: table }, 
        label: blockDef.rowLabelExpr,
        startDate: blockDef.rowStartDateExpr,
        endDate: blockDef.rowEndDateExpr,
        order: blockDef.rowOrderColumn ? { type: "field", table: table, column: blockDef.rowOrderColumn } : null,
        parent: blockDef.rowParentColumn ? { type: "field", table: table, column: blockDef.rowParentColumn } : null,
      },
      from: table,
      where: blockDef.filter
    }

    // Add expressions for rowClickAction as e0, e1, etc.
    rowExprs.forEach((expr, index) => {
      query.select[`e${index}`] = expr
    })

    return query
  }

  // Query data
  const performQuery = async () => {
    // Perform actual query
    const rows = await ctx.database.query(createQuery(), ctx.contextVars, getFilteredContextVarValues(ctx))
    setRows(rows as GanttQueryRow[])
  }

  const [rows, setRows] = useState<GanttQueryRow[]>()

  // Perform query when database changed, or if context var values change
  useEffect(() => {
    performQuery()
  }, [dbChanged, canonical(getFilteredContextVarValues(ctx))])

  // Show spinner if not loaded
  if (!rows) {
    return <div><i className="fa fa-spinner fa-spin"/></div>
  }

  // Create chart rows
  const chartRows = rows.slice().sort((a, b) => a.order > b.order ? 1 : -1).map(row => ({
    id: row.id,
    color: blockDef.barColor || "#68cdee", 
    level: 0, 
    startDate: row.startDate, 
    endDate: row.endDate, 
    label: row.label || ""
  }))

  /** Create instance ctx for a clicked row */
  function createRowInstanceCtx(row: GanttQueryRow): InstanceCtx {
    const innerContextVars = ctx.contextVars.concat(rowCV)

    // Row context variable value
    const cvvalue = row.id

    return {
      ...ctx, 
      contextVars: innerContextVars,
      contextVarValues: { ...ctx.contextVarValues, [rowCV.id]: cvvalue },
      getContextVarExprValue: (cvid, expr) => {
        if (cvid !== rowCV.id) {
          return ctx.getContextVarExprValue(cvid, expr)
        }
        // Look up expression
        const exprIndex = rowExprs.findIndex(rowExpr => _.isEqual(expr, rowExpr))
        return row[`e${exprIndex}`]
      }
    }
  }

  const handleRowClick = (chartRowIndex: number) => {
    // Lookup row
    const row = rows.find(r => r.id == chartRows[chartRowIndex].id)!

    // Create context with variables 
    rowClickAction!.performAction(createRowInstanceCtx(row))
  }
  
  const handleAddRow = (parent: any, order: number) => {
    // Create context with additional variables
    const innerCtx = produce(ctx, draft => {
      const rowOrderContextVar = block.createAddRowOrderContextVar(rowsetCV)
      const rowParentContextVar = block.createAddRowParentContextVar(rowsetCV)
      draft.contextVars.push(rowOrderContextVar)
      draft.contextVars.push(rowParentContextVar)
      draft.contextVarValues[rowOrderContextVar.id] = order
      draft.contextVarValues[rowParentContextVar.id] = parent
    })

    ctx.actionLibrary.createAction(blockDef.addRowAction!).performAction(innerCtx)
  }

  /** Append row to bottom of chart */
  function handleAppendRow() {
    let order: any = null

    // Add order as next number of ordered column if type is number
    if (orderType == "number") {
      order = 0
      for (const row of rows!) {
        if (!row.parent && row.order >= order) {
          order = row.order + 1
        }
      }
    }
    handleAddRow(null, order)
  }

  let startDate: string
  let endDate: string
  
  // Use override if present
  if (blockDef.startDate) {
    startDate = blockDef.startDate
  }
  else {
    // Go earliest with a buffer
    const minStartDate = rows.reduce((acc, row) => !acc || (row.startDate && row.startDate < acc!) ? row.startDate : acc, null)
    if (minStartDate) {
      startDate = moment(minStartDate, "YYYY-MM-DD").subtract(1, "month").format("YYYY-MM-DD")
    }
    else {
      // Start of year
      startDate = moment().startOf("year").format("YYYY-MM-DD")
    }
  }

  // Use override if present
  if (blockDef.endDate) {
    endDate = blockDef.endDate
  }
  else {
    // Go earliest with a buffer
    const maxEndDate = rows.reduce((acc, row) => !acc || (row.endDate && row.endDate > acc!) ? row.endDate : acc, null)
    if (maxEndDate) {
      endDate = moment(maxEndDate, "YYYY-MM-DD").add(1, "month").format("YYYY-MM-DD")
    }
    else {
      // End of year
      endDate = moment().endOf("year").format("YYYY-MM-DD")
    }
  }

  return <GanttChart
    rows={chartRows}
    startDate={startDate}
    endDate={endDate}
    onRowClick={blockDef.rowClickAction ? handleRowClick : undefined}
    onAddRow={blockDef.addRowAction ? handleAppendRow : undefined}
    T={ctx.T} />
}

/** Results of the query. Note: This is *not* a chart row, which is a different structure and order! */
interface GanttQueryRow {
  id: string | number
  label: string | null
  startDate: string | null
  endDate: string | null
  parent: string | number | null
  order: any
}

