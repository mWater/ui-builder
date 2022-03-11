import _ from "lodash"
import { default as React, useEffect, useState } from "react"
import LeafBlock from "../LeafBlock"
import { BlockDef, createExprVariables, Filter } from "../blocks"
import { Expr, ExprValidator, NullDataSource } from "mwater-expressions"
import {
  LabeledProperty,
  ContextVarPropertyEditor,
  PropertyEditor} from "../propertyEditors"
import { FilterExprComponent } from "mwater-expressions-ui"
import { DesignCtx, InstanceCtx } from "../../contexts"

export interface ExpressionFilterBlockDef extends BlockDef {
  type: "expressionFilter"

  /** Id of context variable of rowset to filter */
  rowsetContextVarId: string | null

  /** Default filter to apply. Boolean expression */
  defaultFilterExpr: Expr
}

/** Filter by a customizable expression
 */
export class ExpressionFilterBlock extends LeafBlock<ExpressionFilterBlockDef> {
  validate(options: DesignCtx) {
    // Validate rowset
    const rowsetCV = options.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return "Rowset required"
    }

    // Validate filter
    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    const error = exprValidator.validateExpr(this.blockDef.defaultFilterExpr, { table: rowsetCV.table, types: ["boolean"] })
    if (error) {
      return error
    }

    return null
  }

  getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[] {
    if (contextVarId == this.blockDef.rowsetContextVarId) {
      if (this.blockDef.defaultFilterExpr) {
        return [{
          id: this.blockDef.id,
          expr: this.blockDef.defaultFilterExpr
        }]
      }
    }
    return []
  }

  renderDesign(props: DesignCtx) {
    const rowsetCV = props.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV?.table) {
      return <a className="link-plain">+ Add Filter</a>
    }

    return <FilterExprComponent
      schema={props.schema}
      dataSource={props.dataSource}
      table={rowsetCV.table}
      value={this.blockDef.defaultFilterExpr}
    />
  }

  renderInstance(ctx: InstanceCtx) {
    return <ExpressionFilterInstance blockDef={this.blockDef} ctx={ctx} />
  }

  renderEditor(ctx: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = ctx.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId)

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="rowsetContextVarId">
            {(value, onChange) => (
              <ContextVarPropertyEditor
                value={value}
                onChange={onChange}
                contextVars={ctx.contextVars}
                types={["rowset"]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>

        {rowsetCV ? (
          <LabeledProperty label="Default filter expression">
            <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="defaultFilterExpr">
              {(value, onChange) => (
                <FilterExprComponent
                  value={value}
                  schema={ctx.schema}
                  dataSource={ctx.dataSource}
                  onChange={onChange}
                  table={rowsetCV.table!}
                  variables={createExprVariables(ctx.contextVars)}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
      </div>
    )
  }
}

function ExpressionFilterInstance(props: { blockDef: ExpressionFilterBlockDef; ctx: InstanceCtx }) {
  const { blockDef, ctx } = props
  const [filterExpr, setFilterExpr] = useState(blockDef.defaultFilterExpr)

  // Get rowset context variable
  const rowsetCV = ctx.contextVars.find((cv) => cv.id === blockDef.rowsetContextVarId)!

  // Set filter
  useEffect(() => {
    ctx.setFilter(blockDef.rowsetContextVarId!, {
      id: blockDef.id,
      expr: filterExpr
    })
  }, [filterExpr])

  return (
    <FilterExprComponent
      schema={ctx.schema}
      dataSource={ctx.dataSource || new NullDataSource()}
      table={rowsetCV.table!}
      value={filterExpr}
      onChange={setFilterExpr}
      variables={createExprVariables(ctx.contextVars)}
    />
  )
}
