import { RenderInstanceProps, ContextVar, BlockDef, CreateBlock, Filter } from "./blocks";
import * as React from "react";
import { Expr, ExprUtils, Schema } from "mwater-expressions";
import { QueryOptions } from "../Database";
import * as canonical from 'canonical-json'
import * as _ from "lodash";

interface Props {
  contextVar: ContextVar
  value: any
  renderInstanceProps: RenderInstanceProps
  contextVarExprs?: Expr[]
  initialFilters?: Filter[]
  schema: Schema
  children: (renderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => React.ReactElement<any>
}

interface State {
  filters: Filter[]
  loading: boolean
  refreshing: boolean
  /** Value of expressions. Index by canonicalized JSON */
  exprValues: { [exprJson: string]: any }
}

/** Injects one context variable into the inner render instance props. 
 * Holds state of the filters that are applied to rowset-type context vars
 * Computes values of expressions for row and rowset types
 */
export default class ContextVarsInjector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      filters: props.initialFilters || [],
      loading: true,
      refreshing: false,
      exprValues: {}
    }
  }

  componentDidMount() {
    this.performQueries()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (!_.isEqual(prevProps.value, this.props.value) || !_.isEqual(prevState.filters, this.state.filters)) {
      this.performQueries()
    }
  }

  async performQueries() {
    this.setState({ refreshing: true })

    // Query database if row TODO null value?
    if (this.props.contextVar.type === "row" && this.props.contextVarExprs!.length > 0) {
      const table: string = this.props.contextVar.table!

      const queryOptions: QueryOptions = {
        select: {},
        from: table,
        where: { 
          type: "op",
          op: "=",
          table: table,
          exprs: [{ type: "id", table: table }, { type: "literal", valueType: "id", idTable: table, value: this.props.value }]
        }
      }

      // Add expressions as selects
      for (let i = 0 ; i < this.props.contextVarExprs!.length ; i++) {
        queryOptions.select["e" + i] = this.props.contextVarExprs![i]
      }

      // Perform query
      const rows = await this.props.renderInstanceProps.database.query(queryOptions)
      if (rows.length === 0) {
        this.setState({ exprValues: {} })
      }
      else {
        const exprValues = {}
        for (let i = 0 ; i < this.props.contextVarExprs!.length ; i++) {
          exprValues[canonical(this.props.contextVarExprs![i])] = rows[0]["e" + i]
        }
        this.setState({ exprValues, loading: false })
      }
    }

    // Query database if rowset
    this.setState({ loading: true })
    if (this.props.contextVar.type === "rowset" && this.props.contextVarExprs!.length > 0) {
      const table: string = this.props.contextVar.table!

      const queryOptions: QueryOptions = {
        select: {},
        from: table,
        where: this.props.value as Expr
      }

      // Add expressions as selects (only if aggregate for rowset)
      const exprUtils = new ExprUtils(this.props.schema)
      const nonAggrExpressions = this.props.contextVarExprs!.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate")

      // Add expressions as selects
      for (let i = 0 ; i < nonAggrExpressions.length ; i++) {
        queryOptions.select["e" + i] = nonAggrExpressions[i]
      }

      // Add filters
      if (this.state.filters.length > 0) {
        queryOptions.where = {
          type: "op",
          table: table,
          op: "and",
          exprs: _.compact([queryOptions.where].concat(this.state.filters.map(f => f.expr)))
        }
      }

      // Perform query
      const rows = await this.props.renderInstanceProps.database.query(queryOptions)
      if (rows.length === 0) {
        this.setState({ exprValues: {} })
      }
      else {
        const exprValues = {}
        for (let i = 0 ; i < nonAggrExpressions.length ; i++) {
          exprValues[canonical(nonAggrExpressions[i])] = rows[0]["e" + i]
        }
        this.setState({ exprValues })
      }
    }
    this.setState({ refreshing: false, loading: false })
  }
  
  render() {
    const outer = this.props.renderInstanceProps

    // Create inner props
    const innerProps: RenderInstanceProps = {
      locale: outer.locale,
      database: outer.database,
      schema: outer.schema,
      actionFactory: outer.actionFactory,
      onSelectContextVar: outer.onSelectContextVar,
      renderChildBlock: outer.renderChildBlock,
      contextVars: outer.contextVars.concat(this.props.contextVar),
      getContextVarValue: (contextVarId) => {
        if (contextVarId === this.props.contextVar.id) {
          return this.props.value
        }
        else {
          return outer.getContextVarValue(contextVarId)
        }
      },
      getContextVarExprValue: (contextVarId, expr) => {
        if (contextVarId === this.props.contextVar.id) {
          return this.state.exprValues[canonical(expr)]
        }
        else {
          return outer.getContextVarExprValue(contextVarId, expr)
        }
      },
      setFilter: (contextVarId, filter) => {
        if (contextVarId === this.props.contextVar.id) {
          // Remove existing with same id
          const filters = this.state.filters.filter(f => f.id !== filter.id)
          filters.push(filter)
          return this.setState({ filters })
        }
        else {
          return outer.setFilter(contextVarId, filter)
        }
      },
      getFilters: (contextVarId) => {
        if (contextVarId === this.props.contextVar.id) {
          return this.state.filters
        }
        else {
          return outer.getFilters(contextVarId)
        }
      },
    }
    return this.props.children(innerProps, this.state.loading, this.state.refreshing)
  }
}