import { RenderInstanceProps, ContextVar, BlockDef, CreateBlock, Filter } from "./blocks";
import * as React from "react";
import { Expr } from "mwater-expressions";
import { QueryOptions } from "../Database";
import * as canonical from 'canonical-json'

interface Props {
  contextVar: ContextVar
  value: any
  renderInstanceProps: RenderInstanceProps
  contextVarExprs?: Expr[]
  children: (renderInstanceProps: RenderInstanceProps, loading: boolean) => React.ReactElement<any>
}

interface State {
  filters: Filter[]
  loading: boolean
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
      filters: [],
      loading: false,
      exprValues: {}
    }
  }

  componentDidMount() {
    // Query database if row TODO null value?
    if (this.props.contextVar.type === "row") {
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
      this.props.renderInstanceProps.database.query(queryOptions).then(rows => {
        if (rows.length === 0) {
          this.setState({ exprValues: {} })
        }
        else {
          const exprValues = {}
          for (let i = 0 ; i < this.props.contextVarExprs!.length ; i++) {
            exprValues[canonical(this.props.contextVarExprs![i])] = rows[0]["e" + i]
          }
          this.setState({ exprValues })
          console.log("setstate!")
          console.log(exprValues)
        }
      }).catch(e => {
        throw e
      })
    }
  }
  
  render() {
    const outer = this.props.renderInstanceProps

    // Create inner props
    const innerProps: RenderInstanceProps = {
      locale: outer.locale,
      database: outer.database,
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
        console.log(this.state.exprValues)
        if (contextVarId === this.props.contextVar.id) {
          return this.state.exprValues[canonical(expr)]
        }
        else {
          return outer.getContextVarExprValue(contextVarId, expr)
        }
      },
      setFilter: outer.setFilter, // TODO
      getFilters: outer.getFilters, // TODO
    }
    return this.props.children(innerProps, false)
  }
}