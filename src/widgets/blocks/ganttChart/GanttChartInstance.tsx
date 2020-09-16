import _ from 'lodash'
import { useEffect, useState } from "react"
import { getFilteredContextVarValues, InstanceCtx } from "../../../contexts"
import { QueryOptions, useDatabaseChangeListener } from "../../../database/Database"
import { GanttChartBlock, GanttChartBlockDef } from "./GanttChart"
import canonical from 'canonical-json'
import React from "react"
import { GanttChart, GanttChartRow } from "react-library/lib/GanttChart"
import moment from 'moment'
import { produce } from 'immer'
import { localize } from '../../localization'

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

  // Gets the color of a row
  function getRowColor(row: GanttQueryRow) {
    return row.startDate == row.endDate || !row.startDate || !row.endDate 
      ? blockDef.milestoneColor || "#68cdee"
      : blockDef.barColor || "#68cdee"
  }

  // Create chart rows
  const chartRows = createChartRows({ queryRows: rows, getColor: getRowColor, prefixNumber: blockDef.autoNumberRows || false })

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

  /** Move a row logically down  */
  const handleMoveRowDown = (index: number) => {
    const chartRow = chartRows[index]

    // Find next sibling
    for (let i = index + 1 ; i < chartRows.length ; i++) {
      // If up a level, ignore
      if (chartRows[i].level < chartRow.level) {
        return
      }
      // If same level, use this one
      if (chartRows[i].level == chartRow.level) {
        // Swap orders
        const myRow = rows.find(r => r.id == chartRow.id)!
        const otherRow = rows.find(r => r.id == chartRows[i].id)!
        const txn = ctx.database.transaction()
        txn.updateRow(table, myRow.id, { order: otherRow.order })
        txn.updateRow(table, otherRow.id, { order: myRow.order })
        txn.commit()
        return
      }
    }
  }

  const handleMoveRowUp = (index: number) => {
    const chartRow = chartRows[index]

    // Find previous sibling
    for (let i = index - 1 ; i >= 0 ; i--) {
      // If up a level, ignore
      if (chartRows[i].level < chartRow.level) {
        return
      }
      // If same level, use this one
      if (chartRows[i].level == chartRow.level) {
        // Swap orders
        const myRow = rows.find(r => r.id == chartRow.id)!
        const otherRow = rows.find(r => r.id == chartRows[i].id)!
        const txn = ctx.database.transaction()
        txn.updateRow(table, myRow.id, { order: otherRow.order })
        txn.updateRow(table, otherRow.id, { order: myRow.order })
        txn.commit()
        return
      }
    }
  }

  const handleMoveRowLeft = (index: number) => {
    const chartRow = chartRows[index]
    const myRow = rows.find(r => r.id == chartRow.id)!

    // Find parent
    const parentRow = rows.find(r => r.id == myRow.parent)!

    const txn = ctx.database.transaction()

    // Set own parent to parent's parent and and set order to parent + 1
    txn.updateRow(table, myRow.id, { parent: parentRow.parent, order: parentRow.order + 1 })

    // Decrement order of all siblings after self
    for (const r of rows) {
      if (r.parent == myRow.parent && r.order > myRow.order) {
        txn.updateRow(table, r.id, { order: r.order - 1 })
      }
    }

    // Increment order of all siblings after parent
    for (const r of rows) {
      if (r.parent == parentRow.parent && r.order > parentRow.order) {
        txn.updateRow(table, r.id, { order: r.order + 1 })
      }
    }
    txn.commit()
  }

  const handleMoveRowRight = (index: number) => {
    const chartRow = chartRows[index]
    const myRow = rows.find(r => r.id == chartRow.id)!

    // Find new parent (previous row)
    const parentRow = rows.find(r => r.id == chartRows[index - 1].id)!

    const txn = ctx.database.transaction()

    // Set own parent to previous row's parent and set order to 0
    txn.updateRow(table, myRow.id, { parent: parentRow.id, order: 0 })

    // Decrement order of all siblings after parent
    for (const r of rows) {
      if (r.parent == parentRow.parent && r.order > parentRow.order) {
        txn.updateRow(table, r.id, { order: r.order - 1 })
      }
    }
    txn.commit()
  }

  const handleInsertChildRow = (index: number) => {
    const chartRow = chartRows[index]
    const myRow = rows.find(r => r.id == chartRow.id)!

    // Determine max order of child rows
    let order = 0
    for (const r of rows) {
      if (r.parent == myRow.parent && r.order >= order) {
        order = r.order + 1
      }
    }
    handleAddRow(myRow.id, order)
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

  const isOrdered = blockDef.rowOrderColumn != null
  const isHierarchical = blockDef.rowParentColumn != null

  return <GanttChart
    rows={chartRows}
    startDate={startDate}
    endDate={endDate}
    onMoveRowDown={isOrdered ? handleMoveRowDown : undefined}
    onMoveRowUp={isOrdered ? handleMoveRowUp : undefined}
    onMoveRowLeft={isOrdered && isHierarchical ? handleMoveRowLeft : undefined}
    onMoveRowRight={isOrdered && isHierarchical ? handleMoveRowRight : undefined}
    onInsertChildRow={isOrdered && isHierarchical ? handleInsertChildRow : undefined }
    onRowClick={blockDef.rowClickAction ? handleRowClick : undefined}
    onAddRow={blockDef.addRowAction ? handleAppendRow : undefined}
    addRowLabel={blockDef.addRowLabel ? [<i className="fa fa-plus"/>, " ", localize(blockDef.addRowLabel, ctx.locale)] : undefined }
    T={ctx.T} />
}

/** Results of the query. Note: This is *not* a chart row, which is a different structure and order! */
export interface GanttQueryRow {
  id: string | number
  label: string | null
  startDate: string | null
  endDate: string | null
  parent: string | number | null
  order: any
}

/** Chart rows with extra fields */
export interface EnhancedChartRow extends GanttChartRow {
  id: string | number
}

/** Performs operation to convert from query rows to chart rows
 * which involves making the results into a sorted tree and then 
 * returning the rows in depth-first order, adding any labels as
 * required.
 * prefixNumber adds 1.1, 1.2.3, etc before label
 */
export function createChartRows(options: {
  queryRows: GanttQueryRow[]
  getColor: (queryRow: GanttQueryRow) => string
  prefixNumber: boolean
}): EnhancedChartRow[] {
  const chartRows: EnhancedChartRow[] = []

  /** Add all rows, sorted, that have this as a parent */
  function addRows(parent: number | string | null, level: number, prefix: string) {
    const childRows = options.queryRows.filter(r => r.parent == parent)

    // Sort by order
    childRows.sort((a, b) => a.order > b.order ? 1 : -1)

    // Add each row, then add its children
    childRows.forEach((row, index) => {
      chartRows.push({
        id: row.id,
        color: options.getColor(row), 
        level: level, 
        startDate: row.startDate, 
        endDate: row.endDate, 
        label: options.prefixNumber ? `${prefix}${index + 1}. ${row.label}` || "" : row.label || ""
      })

      addRows(row.id, level + 1, `${prefix}${index + 1}.`)
    })
  }
  addRows(null, 0, "")

  return chartRows
}