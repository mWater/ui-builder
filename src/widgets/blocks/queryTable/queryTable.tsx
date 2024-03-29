import produce from "immer"
import * as React from "react"
import * as _ from "lodash"
import { Block, BlockDef, ContextVar, ChildBlock, createExprVariables } from "../../blocks"
import {
  Expr,
  Schema,
  ExprUtils,
  ExprValidator,
  LocalizedString,
  Row,
  DataSource,
  Variable
} from "mwater-expressions"
import { OrderBy } from "../../../database/Database"
import QueryTableBlockInstance from "./QueryTableBlockInstance"
import {
  LabeledProperty,
  PropertyEditor,
  ContextVarPropertyEditor,
  ActionDefEditor,
  OrderByArrayEditor,
  LocalizedTextPropertyEditor,
  TableColumnWidthEditor
} from "../../propertyEditors"
import { NumberInput, Checkbox, Toggle } from "react-library/lib/bootstrap"
import { ExprComponent } from "mwater-expressions-ui"
import { ActionDef } from "../../actions"
import { DesignCtx, InstanceCtx } from "../../../contexts"
import uuid from "uuid"
import { TextBlockDef } from "../text"

export interface QueryTableBlockDef extends BlockDef {
  type: "queryTable"

  /** Determines if one table row contains one or multiple database table rows */
  mode: "singleRow" | "multiRow"

  /** Content blocks. The length of this array determines number of columns */
  contents: Array<BlockDef | null>

  /** Header blocks. Always same length as contents. */
  headers: Array<BlockDef | null>

  /** Column information. May not be present in legacy block defs. Can be null if no info */
  columnInfos?: Array<QueryTableColumnInfo | null>

  /** Footer blocks. Always same length as contents (if exist). */
  footers?: Array<BlockDef | null>

  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  /** Limit of rows displayed. Can be soft limit (prompts for more) or hard limit */
  limit: number | null

  /** Limit type. "soft" means to enable "Show more..." prompt, "hard" means that only the limit of rows will be shown. Default is "soft" */
  limitType?: "soft" | "hard"

  where: Expr
  orderBy: OrderBy[] | null

  /** Action to be executed when row is clicked */
  rowClickAction: ActionDef | null

  /** Message to display when there are no rows */
  noRowsMessage?: LocalizedString | null

  /** True to hide headers */
  hideHeaders?: boolean

  /** Borders (default is "horizontal") */
  borders?: "horizontal" | "all" | "none"

  /** Table padding (default is "normal") */
  padding?: "normal" | "compact"

  /** Striping of table */
  striped?: boolean

  /** Sticky headers of the table */
  stickyHeaders?: boolean

  /** Maximum height of the table with a scrollbar if exceeds */
  maxHeight?: number | null
}

interface QueryTableColumnInfo {
  /** Column order expressions. When present for a column, makes it orderable via icon at top */
  orderExpr: Expr

  /** Initial order of ordered column. Null for not initially ordered. Only first column with this set
   * is used as the initial ordering.
   */
  initialOrderDir: "asc" | "desc" | null

  /** Column width in CSS format (e.g. "auto", "50%", "30px")
   * If not present, defaults to auto
   */
  columnWidth?: string

  /** Vertical alignment (default top) */
  verticalAlign?: "top" | "middle" | "bottom"
}

export class QueryTableBlock extends Block<QueryTableBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Get rowset context variable
    const rowsetCV = contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId)

    const headerChildren: ChildBlock[] = _.compact(this.blockDef.headers).map((bd) => ({
      blockDef: bd!,
      contextVars: contextVars
    }))
    const contentChildren: ChildBlock[] = _.compact(this.blockDef.contents).map((bd) => ({
      blockDef: bd!,
      contextVars: rowsetCV ? contextVars.concat(this.createRowContextVar(rowsetCV)) : contextVars
    }))
    const footerChildren: ChildBlock[] = _.compact(this.blockDef.footers || []).map((bd) => ({
      blockDef: bd!,
      contextVars: contextVars
    }))
    return headerChildren.concat(contentChildren).concat(footerChildren)
  }

  validate(designCtx: DesignCtx) {
    // Validate rowset
    const rowsetCV = designCtx.contextVars.find(
      (cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset"
    )
    if (!rowsetCV) {
      return "Rowset required"
    }

    const exprValidator = new ExprValidator(designCtx.schema, createExprVariables(designCtx.contextVars))
    let error: string | null

    // Validate where
    error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table, types: ["boolean"] })
    if (error) {
      return error
    }

    // Validate orderBy
    for (const orderBy of this.blockDef.orderBy || []) {
      error = exprValidator.validateExpr(orderBy.expr, { table: rowsetCV.table })
      if (error) {
        return error
      }
    }

    // Validate action
    if (this.blockDef.rowClickAction) {
      const action = designCtx.actionLibrary.createAction(this.blockDef.rowClickAction)

      // Create row context variable
      const rowCV = this.createRowContextVar(rowsetCV)
      error = action.validate({ ...designCtx, contextVars: designCtx.contextVars.concat(rowCV) })
      if (error) {
        return error
      }
    }

    return null
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const headers = this.blockDef.headers.map((b) => action(b))
    const contents = this.blockDef.contents.map((b) => action(b))
    const footers = this.blockDef.footers ? this.blockDef.footers.map((b) => action(b)) : undefined

    return produce(this.blockDef, (draft) => {
      draft.headers = headers
      draft.contents = contents
      draft.footers = footers
    })
  }

  /** Create the context variable used */
  createRowContextVar(rowsetCV: ContextVar): ContextVar {
    switch (this.blockDef.mode) {
      case "singleRow":
        return {
          id: this.getRowContextVarId(),
          name: `Table row of ${rowsetCV.name}`,
          type: "row",
          table: rowsetCV.table
        }
      case "multiRow":
        return {
          id: this.getRowContextVarId(),
          name: `Table row rowset of ${rowsetCV.name}`,
          type: "rowset",
          table: rowsetCV.table
        }
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
    const rowsetCV = contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return []
    }

    let exprs: Expr[] = []

    const rowCV = this.createRowContextVar(rowsetCV)

    // Get expressions for all content blocks
    for (const contentBlockDef of this.blockDef.contents) {
      if (contentBlockDef) {
        exprs = exprs.concat(
          ctx.createBlock(contentBlockDef).getSubtreeContextVarExprs(rowCV, {
            ...ctx,
            contextVars: contextVars.concat([rowCV])
          })
        )
      }
    }

    return exprs
  }

  /**
   * Get the value of the row context variable for a specific row.
   * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
   * contextVars: includes rowsetCV and row one
   */
  getRowContextVarValue(
    row: Row,
    rowExprs: Expr[],
    schema: Schema,
    rowsetCV: ContextVar,
    contextVars: ContextVar[],
    rowsetContextVarValue: Expr
  ): any {
    switch (this.blockDef.mode) {
      case "singleRow":
        return row.id
      case "multiRow":
        const exprUtils = new ExprUtils(schema, createExprVariables(contextVars))

        // Create "and" filter
        const ands: Expr[] = []

        // Add overall rowset filter
        if (rowsetContextVarValue) {
          ands.push(rowsetContextVarValue)
        }

        rowExprs.forEach((expr, index) => {
          if (exprUtils.getExprAggrStatus(expr) === "individual") {
            ands.push({
              type: "op",
              op: "=",
              table: rowsetCV.table!,
              exprs: [expr, { type: "literal", valueType: exprUtils.getExprType(expr)!, value: row["e" + index] }]
            })
          }
        })
        return ands.length > 0 ? { type: "op", op: "and", table: rowsetCV.table!, exprs: ands } : null
    }
  }

  renderDesign(props: DesignCtx) {
    const setHeader = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(
        this.id,
        produce((b) => {
          b!.headers[index] = blockDef
        }),
        blockDef.id
      )
    }

    const setContent = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(
        this.id,
        produce((b) => {
          b!.contents[index] = blockDef
        }),
        blockDef.id
      )
    }

    const setFooter = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(
        this.id,
        produce((b) => {
          b!.footers[index] = blockDef
        }),
        blockDef.id
      )
    }

    const rowsetCV = props.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    let contentProps = props

    // Add context variable if knowable
    if (rowsetCV) {
      contentProps = { ...contentProps, contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) }
    }

    const divStyle: React.CSSProperties = {}
    const tableStyle: React.CSSProperties = {}

    if (getFixedWidth(this.blockDef)) {
      tableStyle.width = getFixedWidth(this.blockDef)!
      divStyle.overflowX = "auto"
    }

    let className = "ui-builder-table"
    switch (this.blockDef.borders || "horizontal") {
      case "all":
        className += " ui-builder-table-bordered"
        break
      case "none":
        className += " ui-builder-table-borderless"
        break
    }

    switch (this.blockDef.padding || "normal") {
      case "compact":
        className += " ui-builder-table-condensed"
        break
    }

    if (this.blockDef.striped) {
      className += " ui-builder-table-striped"
    }

    const getColumnVerticalAlign = (colIndex: number) => {
      const columnInfos = this.blockDef.columnInfos
      return columnInfos && columnInfos[colIndex] ? columnInfos[colIndex]!.verticalAlign || "top" : "top"
    }

    return (
      <div style={divStyle}>
        <table className={className} style={tableStyle}>
          <colgroup>
            {this.blockDef.contents.map((b, colIndex) => {
              // Determine width
              const columnInfos = this.blockDef.columnInfos
              const width = columnInfos && columnInfos[colIndex] ? columnInfos[colIndex]!.columnWidth || "auto" : "auto"
              return <col key={colIndex} style={{ width: width }} />
            })}
          </colgroup>
          {!this.blockDef.hideHeaders ? (
            <thead>
              <tr key="header">
                {this.blockDef.headers.map((b, index) => {
                  return <th key={index}>{props.renderChildBlock(props, b, setHeader.bind(null, index))}</th>
                })}
              </tr>
            </thead>
          ) : null}
          <tbody>
            <tr key="child">
              {this.blockDef.contents.map((b, index) => {
                return (
                  <td key={index} style={{ verticalAlign: getColumnVerticalAlign(index) }}>
                    {props.renderChildBlock(contentProps, b, setContent.bind(null, index))}
                  </td>
                )
              })}
            </tr>
          </tbody>
          {this.blockDef.footers ? (
            <tfoot>
              <tr key="footer">
                {this.blockDef.footers.map((b, index) => {
                  return <td key={index}>{props.renderChildBlock(props, b, setFooter.bind(null, index))}</td>
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    )
  }

  renderInstance(props: InstanceCtx) {
    return <QueryTableBlockInstance block={this} instanceCtx={props} />
  }

  renderEditor(props: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = props.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId)

    const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null

    const handleAddColumn = () => {
      props.store.replaceBlock(
        produce(this.blockDef, (b) => {
          setLength(b.contents, this.blockDef.contents.length + 1)
          setLength(b.headers, this.blockDef.contents.length + 1)
          if (b.footers) {
            setLength(b.footers, this.blockDef.contents.length + 1)
          }
          b.headers[b.headers.length - 1] = {
            id: uuid.v4(),
            type: "text",
            text: { _base: "en", en: "Header" },
            style: "div"
          } as TextBlockDef
          b.columnInfos = b.columnInfos || []
          setLength(b.columnInfos, this.blockDef.contents.length + 1)
        })
      )
    }

    // Remove last column
    const handleRemoveColumn = () => {
      props.store.replaceBlock(
        produce(this.blockDef, (b) => {
          if (b.contents.length > 1) {
            setLength(b.contents, this.blockDef.contents.length - 1)
            setLength(b.headers, this.blockDef.contents.length - 1)
            if (b.footers) {
              setLength(b.footers, this.blockDef.contents.length - 1)
            }
            b.columnInfos = b.columnInfos || []
            setLength(b.columnInfos, this.blockDef.contents.length - 1)
          }
        })
      )
    }

    const handleAddFooters = () => {
      props.store.replaceBlock(
        produce(this.blockDef, (b) => {
          b.footers = [] as BlockDef[]
          setLength(b.footers, this.blockDef.contents.length)
        })
      )
    }

    const handleRemoveFooters = () => {
      props.store.replaceBlock(
        produce(this.blockDef, (b) => {
          delete b.footers
        })
      )
    }

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowsetContextVarId">
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

        <LabeledProperty label="Mode">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="mode">
            {(value, onChange) => (
              <Toggle
                value={value}
                onChange={onChange}
                options={[
                  { value: "singleRow", label: "One item per row" },
                  { value: "multiRow", label: "Multiple item per row" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>

        {rowsetCV ? (
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
                  table={rowsetCV!.table!}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        {rowCV ? (
          <LabeledProperty label="Ordering">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="orderBy">
              {(value, onChange) => (
                <OrderByArrayEditor
                  value={value}
                  onChange={onChange}
                  schema={props.schema}
                  dataSource={props.dataSource}
                  contextVars={props.contextVars}
                  table={rowsetCV!.table!}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        <LabeledProperty label="Maximum rows">
          <div>
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="limit">
              {(value, onChange) => (
                <NumberInput value={value} onChange={onChange} decimal={false} style={{ display: "inline-block" }} />
              )}
            </PropertyEditor>
            {this.blockDef.limit != null ? (
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="limitType">
                {(value, onChange) => (
                  <div style={{ paddingLeft: 10, display: "inline-block" }}>
                    <Checkbox value={value != "hard"} onChange={(v) => onChange(v !== false ? "soft" : "hard")}>
                      Enable 'Show More...'
                    </Checkbox>
                  </div>
                )}
              </PropertyEditor>
            ) : null}
          </div>
        </LabeledProperty>

        {rowCV ? (
          <LabeledProperty label="When row clicked">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowClickAction">
              {(value, onChange) => (
                <ActionDefEditor
                  value={value}
                  onChange={onChange}
                  designCtx={{ ...props, contextVars: props.contextVars.concat(rowCV) }}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        <LabeledProperty label="Message to display when no rows">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="noRowsMessage">
            {(value, onChange) => (
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="hideHeaders">
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              Hide Headers
            </Checkbox>
          )}
        </PropertyEditor>

        <LabeledProperty label="Borders">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="borders">
            {(value, onChange) => (
              <Toggle
                value={value || "horizontal"}
                onChange={onChange}
                options={[
                  { value: "none", label: "None" },
                  { value: "horizontal", label: "Horizontal" },
                  { value: "all", label: "All" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Padding">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="padding">
            {(value, onChange) => (
              <Toggle
                value={value || "normal"}
                onChange={onChange}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "compact", label: "Compact" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="striped">
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              Striped
            </Checkbox>
          )}
        </PropertyEditor>

        <LabeledProperty label="Maximum height" hint="Scrolls if exceeds">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="maxHeight">
            {(value, onChange) => (
              <NumberInput value={value} onChange={onChange} decimal={false} style={{ display: "inline-block" }} placeholder="Unlimited" />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="stickyHeaders">
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              Sticky Headers (may not work in all settings)
            </Checkbox>
          )}
        </PropertyEditor>

        {rowCV ? (
          <LabeledProperty label="Columns">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="columnInfos">
              {(value, onChange) => (
                <ColumnInfosEditor
                  value={value}
                  onChange={onChange}
                  schema={props.schema}
                  dataSource={props.dataSource}
                  table={rowCV.table!}
                  numColumns={this.blockDef.contents.length}
                  variables={createExprVariables(props.contextVars)}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        <div>
          <button type="button" className="btn btn-link btn-sm" onClick={handleAddColumn}>
            <i className="fa fa-plus" /> Add Column
          </button>
          <button type="button" className="btn btn-link btn-sm" onClick={handleRemoveColumn}>
            <i className="fa fa-minus" /> Remove Column
          </button>
        </div>
        {this.blockDef.footers != null ? (
          <button type="button" className="btn btn-link btn-sm" onClick={handleRemoveFooters}>
            Remove Footer
          </button>
        ) : (
          <button type="button" className="btn btn-link btn-sm" onClick={handleAddFooters}>
            Add Footer
          </button>
        )}
      </div>
    )
  }
}

/** Edits column info */
const ColumnInfosEditor = (props: {
  value?: Array<QueryTableColumnInfo | null>
  onChange: (value: Array<QueryTableColumnInfo | null>) => void
  numColumns: number
  table: string
  schema: Schema
  dataSource: DataSource
  variables: Variable[]
}) => {
  const handleOrderExprChange = (colIndex: number, expr: Expr) => {
    props.onChange(
      produce(props.value || [], (draft) => {
        // Make sure exists
        draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null }
        draft[colIndex]!.orderExpr = expr
      })
    )
  }

  const handleInitialOrderDirChange = (colIndex: number, initialOrderDir: "asc" | "desc" | null) => {
    props.onChange(
      produce(props.value || [], (draft) => {
        // Make sure exists
        draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null }
        draft[colIndex]!.initialOrderDir = initialOrderDir
      })
    )
  }

  const handleColumnWidthChange = (colIndex: number, columnWidth: string) => {
    props.onChange(
      produce(props.value || [], (draft) => {
        // Make sure exists
        draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null }
        draft[colIndex]!.columnWidth = columnWidth
      })
    )
  }

  const handleVerticalAlignChange = (colIndex: number, verticalAlign: "top" | "middle" | "bottom") => {
    props.onChange(
      produce(props.value || [], (draft) => {
        // Make sure exists
        draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null }
        draft[colIndex]!.verticalAlign = verticalAlign
      })
    )
  }

  return (
    <ul className="list-group">
      {_.map(_.range(props.numColumns), (colIndex) => {
        return (
          <li className="list-group-item" key={colIndex}>
            <LabeledProperty label="Sort Icons" hint="Allow dynamic sorting if present" key="sort">
              <div style={{ display: "inline-block", paddingLeft: 5, paddingRight: 10 }}>
                <ExprComponent
                  schema={props.schema}
                  dataSource={props.dataSource}
                  onChange={handleOrderExprChange.bind(null, colIndex)}
                  table={props.table}
                  value={props.value && props.value[colIndex] ? props.value[colIndex]!.orderExpr : null}
                  types={["text", "number", "date", "datetime"]}
                  variables={props.variables}
                />
              </div>
              {props.value && props.value[colIndex] && props.value[colIndex]!.orderExpr ? (
                <Toggle
                  options={[
                    { value: "asc", label: "Asc" },
                    { value: "desc", label: "Desc" },
                    { value: null, label: "No Initial Sort" }
                  ]}
                  allowReset={false}
                  value={props.value && props.value[colIndex] ? props.value[colIndex]!.initialOrderDir : null}
                  onChange={handleInitialOrderDirChange.bind(null, colIndex)}
                  size="sm"
                />
              ) : null}
            </LabeledProperty>
            <LabeledProperty label="Width" key="width">
              <TableColumnWidthEditor
                columnWidth={
                  props.value && props.value[colIndex] ? props.value[colIndex]!.columnWidth || "auto" : "auto"
                }
                onChange={handleColumnWidthChange.bind(null, colIndex)}
              />
            </LabeledProperty>
            <LabeledProperty label="Vertical Alignment">
              <Toggle
                value={props.value && props.value[colIndex] ? props.value[colIndex]!.verticalAlign || "top" : "top"}
                onChange={handleVerticalAlignChange.bind(null, colIndex)}
                size="sm"
                options={[
                  { value: "top", label: "Top" },
                  { value: "middle", label: "Middle" },
                  { value: "bottom", label: "Bottom" }
                ]}
              />
            </LabeledProperty>
          </li>
        )
      })}
    </ul>
  )
}

/** Set the length of an array, adding/removing nulls as necessary */
function setLength(arr: any[], length: number) {
  // Shorten
  if (arr.length > length) {
    arr.splice(length, arr.length - length)
  }
  if (arr.length < length) {
    const toAdd = length - arr.length
    for (let i = 0; i < toAdd; i++) {
      arr.push(null)
    }
  }
}

/** Determine if table is fixed width and if it is, return the width in pixels */
export function getFixedWidth(blockDef: QueryTableBlockDef): number | null {
  if (
    blockDef.columnInfos &&
    blockDef.columnInfos.every((ci) => ci && ci.columnWidth && ci.columnWidth.match(/[0-9]+px/))
  ) {
    return _.sum(blockDef.columnInfos.map((ci) => parseFloat(ci!.columnWidth!)))
  }
  return null
}
