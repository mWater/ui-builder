import _ from 'lodash'
import React, { useCallback, useMemo } from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils, Expr } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { Database, OrderBy } from "../../../database/Database";
import { IdDropdownComponent } from '../controls/IdDropdownComponent';
import { formatEmbeddedExprString } from '../../../embeddedExprs';
import { InstanceCtx } from '../../../contexts';
import { localize } from '../../localization';
import { useStabilizeFunction, useStabilizeValue } from '../../../stabilizingHooks';
import { Styles } from 'react-select';

/** Dropdown filter that is an id */
export const IdInstance = (props: {
  blockDef: DropdownFilterBlockDef
  ctx: InstanceCtx
  value: any
  onChange: (value: any) => void
  locale: string
}) => {
  const { blockDef } = props
  const exprUtils = new ExprUtils(props.ctx.schema, createExprVariables(props.ctx.contextVars))
  const idTable = exprUtils.getExprIdTable(props.blockDef.filterExpr)

  const locale = props.ctx.locale
  const schema = props.ctx.schema
  const formatLocale = props.ctx.formatLocale

  const formatIdLabel = useCallback((labelValues: any[]): string => {
    if (props.blockDef.idMode == "advanced") {
      return formatEmbeddedExprString({
        text: localize(blockDef.idLabelText, props.ctx.locale),
        contextVars: [],
        embeddedExprs: blockDef.idLabelEmbeddedExprs!,
        exprValues: labelValues,
        formatLocale: formatLocale,
        locale: locale,
        schema: schema
      })
    }
    else {
      return labelValues[0]
    }
  }, [blockDef, locale, schema, formatLocale])

  const labelEmbeddedExprs: Expr[] = useMemo(() => {
    return blockDef.idMode == "advanced"
      ? (blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr)
      : [blockDef.idLabelExpr!]
  }, [blockDef])

  const searchExprs: Expr[] = useMemo(() => {
    return blockDef.idMode == "advanced"
      ? blockDef.idSearchExprs! || []
      : [blockDef.idLabelExpr!]
  }, [blockDef])

  const orderBy: OrderBy[] = useMemo(() => {
    return blockDef.idMode == "advanced"
      ? blockDef.idOrderBy! || []
      : [{ expr: blockDef.idLabelExpr!, dir: "asc" }]
  }, [blockDef])

  const styles = useMemo<Partial<Styles>>(() => {
    return { menuPortal: style => ({ ...style, zIndex: 2000 })}
  }, [])

  // Stabilize functions and values
  const onChange = useStabilizeFunction(props.onChange)
  const contextVars = useStabilizeValue(props.ctx.contextVars)
  const contextVarValues = useStabilizeValue(props.ctx.contextVarValues)

  return <IdDropdownComponent
    database={props.ctx.database}
    table={idTable!}
    value={props.value}
    onChange={onChange}
    multi={false}
    labelEmbeddedExprs={labelEmbeddedExprs}
    searchExprs={searchExprs}
    orderBy={orderBy}
    filterExpr={props.blockDef.idFilterExpr || null}
    formatLabel={formatIdLabel}
    placeholder={localize(props.blockDef.placeholder, props.locale)}
    contextVars={contextVars}
    contextVarValues={contextVarValues}
    styles={styles}
  />
}
