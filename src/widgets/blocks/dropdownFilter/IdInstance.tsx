import _ from 'lodash'
import React from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils, Expr } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { Database, OrderBy } from "../../../database/Database";
import { Styles } from 'react-select/lib/styles';
import { IdDropdownComponent } from '../controls/IdDropdownComponent';
import { formatEmbeddedExprString } from '../../../embeddedExprs';
import { InstanceCtx } from '../../../contexts';
import { localize } from '../../localization';

/** Styles for react-select */
const dropdownStyles: Partial<Styles> = { 
  // Keep menu above other controls
  menu: style => ({ ...style, zIndex: 2000 }),
  menuPortal: style => ({ ...style, zIndex: 2000 }),
  control: style => ({ ...style, minHeight: 34, height: 34 }),
  valueContainer: style => ({ ...style, top: -2 })
}

/** Dropdown filter that is an id */
export const IdInstance = (props: {
  blockDef: DropdownFilterBlockDef
  ctx: InstanceCtx
  value: any
  onChange: (value: any) => void
  locale: string
}) => {
  const exprUtils = new ExprUtils(props.ctx.schema, createExprVariables(props.ctx.contextVars))
  const idTable = exprUtils.getExprIdTable(props.blockDef.filterExpr)

  const formatIdLabel = (labelValues: any[]): string => {
    if (props.blockDef.idMode == "advanced") {
      return formatEmbeddedExprString({
        text: localize(props.blockDef.idLabelText, props.ctx.locale),
        contextVars: [],
        embeddedExprs: props.blockDef.idLabelEmbeddedExprs!,
        exprValues: labelValues,
        formatLocale: props.ctx.formatLocale,
        locale: props.ctx.locale,
        schema: props.ctx.schema
      })
    }
    else {
      return labelValues[0]
    }
  }

  let labelEmbeddedExprs: Expr[]
  let searchExprs: Expr[]
  let orderBy: OrderBy[]

  // Handle modes
  if (props.blockDef.idMode == "advanced") {
    labelEmbeddedExprs = (props.blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr)
    searchExprs = props.blockDef.idSearchExprs! || []
    orderBy = props.blockDef.idOrderBy! || []
  }
  else {
    labelEmbeddedExprs = [props.blockDef.idLabelExpr!]
    searchExprs = [props.blockDef.idLabelExpr!]
    orderBy = [{ expr: props.blockDef.idLabelExpr!, dir: "asc" }]
  }

  return <IdDropdownComponent
    database={props.ctx.database}
    table={idTable!}
    value={props.value}
    onChange={props.onChange}
    multi={false}
    labelEmbeddedExprs={labelEmbeddedExprs}
    searchExprs={searchExprs}
    orderBy={orderBy}
    filterExpr={props.blockDef.idFilterExpr || null}
    formatLabel={formatIdLabel}
    contextVars={props.ctx.contextVars}
    contextVarValues={props.ctx.contextVarValues}
    styles={dropdownStyles} />
}
