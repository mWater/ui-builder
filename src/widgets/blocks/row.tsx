import produce from "immer"
import React from "react"
import { Block, BlockDef, ContextVar, ChildBlock, createExprVariables, validateContextVarExpr } from "../blocks"
import _ from "lodash"
import { Expr, ExprValidator } from "mwater-expressions"
import ContextVarsInjector from "../ContextVarsInjector"
import { TextInput, Toggle } from "react-library/lib/bootstrap"
import { FilterExprComponent } from "mwater-expressions-ui"
import {
  PropertyEditor,
  LabeledProperty,
  TableSelect,
  ContextVarAndExprPropertyEditor,
  OrderByArrayEditor
} from "../propertyEditors"
import { localize } from "../localization"
import { useEffect, useState } from "react"
import { DesignCtx, InstanceCtx, getFilteredContextVarValues } from "../../contexts"
import { ContextVarExpr } from "../../ContextVarExpr"
import { OrderBy, useDatabaseChangeListener } from "../../database/Database"

/** Block which creates a new row context variable */
export interface RowBlockDef extends BlockDef {
  type: "row"

  /** Table that the row is from */
  table?: string

  /** Name of the row context variable */
  name?: string | null

  /** Mode to use to get the one row. Either by specifying a filter or by specifying an id. Default "filter" */
  mode?: "filter" | "id"

  /** For mode = "filter": Filter which filters table down to find one row. Boolean expression */
  filter?: Expr

  /** Order of rows when filtered. Order is used, as first row matching filter is used. */
  filterOrderBy?: OrderBy[] | null

  /** For mode = "id": context var expression to get the id to use */
  idContextVarExpr?: ContextVarExpr

  /** Block which is in the row */
  content: BlockDef | null
}

export class RowBlock extends Block<RowBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    if (this.blockDef.content) {
      const contextVar = this.createContextVar()
      return [
        { blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }
      ]
    }
    return []
  }

  createContextVar(): ContextVar | null {
    if (this.blockDef.table) {
      return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Unnamed", table: this.blockDef.table }
    }
    return null
  }

  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] {
    if (this.blockDef.idContextVarExpr && contextVar.id == this.blockDef.idContextVarExpr.contextVarId) {
      return [this.blockDef.idContextVarExpr.expr]
    }
    return []
  }

  validate(options: DesignCtx) {
    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    let error: string | null

    if (!this.blockDef.table) {
      return "Missing table"
    }

    const mode = this.blockDef.mode || "filter"

    // Validate filter
    if (mode == "filter") {
      error = exprValidator.validateExpr(this.blockDef.filter || null, {
        table: this.blockDef.table,
        types: ["boolean"]
      })
      if (error) {
        return error
      }

      // Validate orderBy
      for (const orderBy of this.blockDef.filterOrderBy || []) {
        error = exprValidator.validateExpr(orderBy.expr, { table: this.blockDef.table })
        if (error) {
          return error
        }
      }
    }

    // Validate idContextVarExpr
    if (mode == "id") {
      if (!this.blockDef.idContextVarExpr) {
        return "Id expression required"
      }

      error = validateContextVarExpr({
        contextVars: options.contextVars,
        schema: options.schema,
        contextVarId: this.blockDef.idContextVarExpr.contextVarId,
        expr: this.blockDef.idContextVarExpr.expr,
        idTable: this.blockDef.table,
        types: ["id"],
        aggrStatuses: ["literal", "individual"]
      })
      if (error) {
        return error
      }
    }

    return null
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)
    return produce(this.blockDef, (draft) => {
      draft.content = content
    })
  }

  renderDesign(props: DesignCtx) {
    const handleSetContent = (blockDef: BlockDef) => {
      props.store.alterBlock(
        this.id,
        produce((b: RowBlockDef) => {
          b.content = blockDef
          return b
        }),
        blockDef.id
      )
    }

    // Create props for child
    const contextVar = this.createContextVar()
    let contentProps = props

    // Add context variable if knowable
    if (contextVar) {
      contentProps = { ...contentProps, contextVars: props.contextVars.concat([contextVar]) }
    }

    const contentNode = props.renderChildBlock(contentProps, this.blockDef.content, handleSetContent)

    return <div style={{ paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" }}>{contentNode}</div>
  }

  renderInstance(props: InstanceCtx) {
    const contextVar = this.createContextVar()!
    return <RowInstance contextVar={contextVar} blockDef={this.blockDef} instanceProps={props} />
  }

  renderEditor(props: DesignCtx) {
    const handleTableChange = (tableId: string) => {
      const table = props.schema.getTable(tableId)!
      props.store.replaceBlock(
        produce(this.blockDef, (bd) => {
          bd.table = tableId
          bd.name = bd.name || localize(table.name)
        })
      )
    }

    const mode = this.blockDef.mode || "filter"

    return (
      <div>
        <h3>Row</h3>
        <LabeledProperty label="Table">
          <TableSelect
            schema={props.schema}
            locale={props.locale}
            value={this.blockDef.table || null}
            onChange={handleTableChange}
          />
        </LabeledProperty>
        <LabeledProperty label="Name">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="name">
            {(value, onChange) => <TextInput value={value || null} onChange={onChange} placeholder="Unnamed" />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Mode" key="mode">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="mode">
            {(value, onChange) => (
              <Toggle
                value={value || "filter"}
                onChange={onChange}
                options={[
                  { value: "filter", label: "By Filter" },
                  { value: "id", label: "By ID" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        {this.blockDef.table && mode == "filter" ? (
          <LabeledProperty label="Filter">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="filter">
              {(value, onChange) => (
                <FilterExprComponent
                  value={value}
                  onChange={onChange}
                  schema={props.schema}
                  dataSource={props.dataSource}
                  table={this.blockDef.table!}
                  variables={createExprVariables(props.contextVars)}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        <LabeledProperty
          label="Filter Order"
          key="filterOrderBy"
          hint="If filter matches more than one row, first one is taken"
        >
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="filterOrderBy">
            {(value, onChange) => (
              <OrderByArrayEditor
                value={value || []}
                onChange={onChange}
                schema={props.schema}
                dataSource={props.dataSource}
                contextVars={props.contextVars}
                table={this.blockDef.table!}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>

        {this.blockDef.table && mode == "id" ? (
          <LabeledProperty label="ID of row">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idContextVarExpr">
              {(value, onChange) => (
                <ContextVarAndExprPropertyEditor
                  contextVars={props.contextVars}
                  contextVarId={value ? value.contextVarId : null}
                  expr={value ? value.expr : null}
                  onChange={(contextVarId, expr) => {
                    onChange({ contextVarId, expr })
                  }}
                  schema={props.schema}
                  dataSource={props.dataSource}
                  idTable={this.blockDef.table}
                  types={["id"]}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
      </div>
    )
  }
}

const RowInstance = (props: { blockDef: RowBlockDef; instanceProps: InstanceCtx; contextVar: ContextVar }) => {
  const { blockDef, instanceProps, contextVar } = props
  const database = instanceProps.database
  const table = contextVar.table!

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string | null>()

  const mode = blockDef.mode || "filter"

  // Increment when database is changed
  const refreshTrigger = useDatabaseChangeListener(database)

  useEffect(() => {
    if (mode == "filter") {
      // Query to get match
      database.query(
        {
          select: { id: { type: "id", table: table } },
          from: table,
          where: blockDef.filter,
          orderBy: blockDef.filterOrderBy || undefined,
          limit: 1
        },
        instanceProps.contextVars,
        getFilteredContextVarValues(instanceProps)
      )
        .then((rows) => {
          if (rows.length > 0) {
            setId(rows[0].id)
          } else {
            setId(null)
          }
          setLoading(false)
        })
        .catch((err) => {
          setError(err)
          setLoading(false)
        })
    } else {
      // Just set id from context var
      const exprValue = instanceProps.getContextVarExprValue(
        blockDef.idContextVarExpr!.contextVarId,
        blockDef.idContextVarExpr!.expr
      )
      setId(exprValue)
      setLoading(false)
    }
  }, [refreshTrigger])

  if (loading) {
    return (
      <div style={{ color: "#AAA", textAlign: "center" }}>
        <i className="fa fa-circle-o-notch fa-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-danger">Error loading results: {error.message}</div>
  }

  // Inject context variable
  return (
    <ContextVarsInjector
      injectedContextVars={[contextVar]}
      injectedContextVarValues={{ [contextVar.id]: id }}
      innerBlock={blockDef.content!}
      instanceCtx={instanceProps}
    >
      {(instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
        if (loading) {
          return (
            <div style={{ color: "#AAA", textAlign: "center" }}>
              <i className="fa fa-circle-o-notch fa-spin" />
            </div>
          )
        }
        return instanceProps.renderChildBlock(instanceCtx, blockDef.content)
      }}
    </ContextVarsInjector>
  )
}
