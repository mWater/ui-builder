import { ContextVar, BlockDef, CreateBlock, Filter, createExprVariables, createExprVariableValues } from "./blocks";
import * as React from "react";
import { Expr, ExprUtils, Schema, Variable, PromiseExprEvaluator } from "mwater-expressions";
import { QueryOptions, Database } from "../database/Database";
import canonical from 'canonical-json'
import _ from "lodash";
import { InstanceCtx, getFilteredContextVarValues } from "../contexts";

interface Props {
  injectedContextVar: ContextVar
  value: any
  instanceCtx: InstanceCtx
  contextVarExprs?: Expr[]
  initialFilters?: Filter[]
  children: (instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => React.ReactElement<any>
}

interface State {
  filters: Filter[]
  loading: boolean
  refreshing: boolean
  error?: Error

  /** Value of expressions. Index by canonicalized JSON */
  exprValues: { [exprJson: string]: any }

  /** Filtered context var values at last refresh. Used to detect changes */
  filteredContextVarValues: { [contextVarId: string]: any }
}

/** Injects one context variable into the inner render instance props. 
 * Holds state of the filters that are applied to rowset-type context vars
 * Computes values of expressions for row and rowset types
 */
export default class ContextVarInjector extends React.Component<Props, State> {
  /** True when component is unmounted */
  unmounted: boolean

  constructor(props: Props) {
    super(props)

    this.state = {
      filters: props.initialFilters || [],
      loading: true,
      refreshing: false,
      exprValues: {},
      filteredContextVarValues: getFilteredContextVarValues(props.instanceCtx)
    }

    this.unmounted = false
  }

  componentDidMount() {
    this.performQueries()

    // Listen for changes to database
    this.props.instanceCtx.database.addChangeListener(this.handleDatabaseChange)
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // If value change, filters change, or any context var values changes, refresh
    // TODO context var value changes are only relevant if referenced as a variable. Could be optimized
    if (!_.isEqual(prevProps.value, this.props.value) 
      || !_.isEqual(prevState.filters, this.state.filters)
      || !_.isEqual(getFilteredContextVarValues(this.createInnerProps()), this.state.filteredContextVarValues)
      ) {
      this.performQueries()
    }
  }

  componentWillUnmount() {
    this.unmounted = true
    this.props.instanceCtx.database.removeChangeListener(this.handleDatabaseChange)
  }

  handleDatabaseChange = () => {
    this.performQueries()
  }

  createRowQueryOptions(table: string) {
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

    return queryOptions
  }

  /** Create query options for aggregate and literal expressions */
  createRowsetAggrQueryOptions(table: string, variables: Variable[]) {
    const queryOptions: QueryOptions = {
      select: {},
      from: table,
      where: this.props.value as Expr,
      limit: 1
    }

    // Add expressions as selects (only if aggregate for rowset)
    const exprUtils = new ExprUtils(this.props.instanceCtx.schema, variables)
    const aggrExpressions = this.props.contextVarExprs!.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate" || exprUtils.getExprAggrStatus(expr) === "literal")

    // Add expressions as selects
    for (let i = 0 ; i < aggrExpressions.length ; i++) {
      queryOptions.select["e" + i] = aggrExpressions[i]
    }

    // Add filters
    if (this.state.filters.length > 0) {
      queryOptions.where = {
        type: "op",
        table: table,
        op: "and",
        exprs: _.compact([queryOptions.where || null].concat(_.compact(this.state.filters.map(f => f.expr))))
      }
      if (queryOptions.where.exprs.length === 0) {
        queryOptions.where = null
      }
    }

    return queryOptions
  }

  /** Create query options for individual expressions */
  createRowsetIndividualQueryOptions(table: string, variables: Variable[], expr: Expr) {
    const queryOptions: QueryOptions = {
      select: {
        value: expr
      },
      distinct: true,
      from: table,
      where: this.props.value as Expr,
      limit: 2
    }

    // Add filters
    if (this.state.filters.length > 0) {
      queryOptions.where = {
        type: "op",
        table: table,
        op: "and",
        exprs: _.compact([queryOptions.where || null].concat(_.compact(this.state.filters.map(f => f.expr))))
      }
      if (queryOptions.where.exprs.length === 0) {
        queryOptions.where = null
      }
    }

    return queryOptions
  }

  async performQueries() {
    // No need to perform queries if no context var exprs
    if (!this.props.contextVarExprs || this.props.contextVarExprs.length == 0) {
      return
    }

    const innerProps = this.createInnerProps()

    // Determine variables and values for expressions
    const variables = createExprVariables(innerProps.contextVars)
    const variableValues = getFilteredContextVarValues(innerProps)

    this.setState({ refreshing: true, filteredContextVarValues: variableValues })

    // Query database if row 
    if (this.props.injectedContextVar.type === "row") {
      // Special case of null row value
      if (this.props.value == null) {
        this.setState({ exprValues: {}, loading: false, refreshing: false, filteredContextVarValues: variableValues })
        return
      }

      this.setState({ refreshing: true })
      const table: string = this.props.injectedContextVar.table!

      // Perform query
      const queryOptions = this.createRowQueryOptions(table)

      try {
        const rows = await this.props.instanceCtx.database.query(queryOptions, innerProps.contextVars, variableValues)

        // Ignore if query options out of date
        if (!_.isEqual(queryOptions, this.createRowQueryOptions(table))) {
          return
        }

        // Ignore if variable values out of date
        if (!_.isEqual(variableValues, getFilteredContextVarValues(this.createInnerProps()))) {
          return
        }

        // Ignore if unmounted
        if (this.unmounted) {
          return
        }

        if (rows.length === 0) {
          this.setState({ exprValues: {} })
        }
        else {
          const exprValues = {}
          for (let i = 0 ; i < this.props.contextVarExprs!.length ; i++) {
            exprValues[canonical(this.props.contextVarExprs![i])] = rows[0]["e" + i]
          }
          this.setState({ exprValues })
        }
      } catch (error) {
        this.setState({ error })
        return
      }
    }

    // Query database if rowset
    if (this.props.injectedContextVar.type === "rowset") {
      this.setState({ refreshing: true })
      const table: string = this.props.injectedContextVar.table!
      
      // Perform query
      const queryAggrOptions = this.createRowsetAggrQueryOptions(table, variables)
      try {
        const exprUtils = new ExprUtils(this.props.instanceCtx.schema, variables)
        const aggrExpressions = this.props.contextVarExprs!.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate" || exprUtils.getExprAggrStatus(expr) === "literal")
        const individualExpressions = this.props.contextVarExprs!.filter(expr => exprUtils.getExprAggrStatus(expr) === "individual")

        const exprValues = {}

        // Perform one big query for all non-individual
        const aggrRows = await this.props.instanceCtx.database.query(queryAggrOptions, innerProps.contextVars, getFilteredContextVarValues(innerProps))
        if (aggrRows.length > 0) {
          for (let i = 0 ; i < aggrExpressions.length ; i++) {
            exprValues[canonical(aggrExpressions[i])] = aggrRows[0]["e" + i]
          }
        }
        else {
          for (let i = 0 ; i < aggrExpressions.length ; i++) {
            exprValues[canonical(aggrExpressions[i])] = null
          }
        }

        // Perform individual queries for individual expressions
        for (const individualExpression of individualExpressions) {
          const queryIndividualOptions = this.createRowsetIndividualQueryOptions(table, variables, individualExpression)
          const individualRows = await this.props.instanceCtx.database.query(queryIndividualOptions, innerProps.contextVars, getFilteredContextVarValues(innerProps))
          if (individualRows.length == 1) {
            exprValues[canonical(individualExpression)] = individualRows[0].value
          }
          else {
            exprValues[canonical(individualExpression)] = null
          }
        }

        // Ignore if query options out of date
        if (!_.isEqual(queryAggrOptions, this.createRowsetAggrQueryOptions(table, variables))) {
          return
        }

        // Ignore if variable values out of date
        if (!_.isEqual(variableValues, getFilteredContextVarValues(this.createInnerProps()))) {
          return
        }

        // Ignore if unmounted
        if (this.unmounted) {
          return
        }
        
        // Save values
        this.setState({ exprValues })
      } catch (error) {
        this.setState({ error })
        return
      }
    }
    this.setState({ refreshing: false, loading: false })
  }

  /** Create props needed by inner component */
  createInnerProps(): InstanceCtx {
    const outer = this.props.instanceCtx

    // Get injected context variable value
    let value = this.props.value

    const contextVars = outer.contextVars.concat(this.props.injectedContextVar)
    const contextVarValues = { ...outer.contextVarValues, [this.props.injectedContextVar.id]: value }

    // Create inner props
    const innerProps: InstanceCtx = {
      ...outer,
      database: this.props.instanceCtx.database,
      contextVars: contextVars,
      contextVarValues: contextVarValues,
      getContextVarExprValue: (contextVarId, expr) => {
        // Null expression has null value
        if (!expr) {
          return null
        }

        // If no context variable, evaluate expression
        if (contextVarId == null) {
          return new PromiseExprEvaluator({ 
            schema: outer.schema, 
            locale: outer.locale,
            variables: createExprVariables(contextVars),
            variableValues: createExprVariableValues(contextVars, contextVarValues)
          }).evaluateSync(expr)
        }

        if (contextVarId === this.props.injectedContextVar.id) {
          return this.state.exprValues[canonical(expr)]
        }
        else {
          return outer.getContextVarExprValue(contextVarId, expr)
        }
      },
      setFilter: (contextVarId, filter) => {
        if (contextVarId === this.props.injectedContextVar.id) {
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
        if (contextVarId === this.props.injectedContextVar.id) {
          return this.state.filters
        }
        else {
          return outer.getFilters(contextVarId)
        }
      },
    }

    return innerProps
  }
  
  render() {
    if (this.state.error) {
      // TODO localize
      return <div className="alert alert-danger">Error loading data</div>
    }
    return this.props.children(this.createInnerProps(), this.state.loading, this.state.refreshing)
  }
}