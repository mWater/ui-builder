import * as React from "react";
import { SearchBlockDef, SearchBlock } from "./search";
import { RenderInstanceProps, ContextVar, createExprVariables } from "../../blocks";
import { Row, Expr, ExprUtils } from "mwater-expressions";
import * as _ from "lodash";
import { localize } from "../../localization";

interface Props {
  blockDef: SearchBlockDef
  renderInstanceProps: RenderInstanceProps
}

interface State {
  searchText: string
}

/** Search block that filters the rowset */
export default class SearchBlockInstance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { searchText: "" }
  }

  createFilter(searchText: string) {
    const blockDef = this.props.blockDef

    // Get table
    const table = this.props.renderInstanceProps.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId)!.table!
    
    if (searchText) {
      const searchExprs: Expr[] = blockDef.searchExprs.map(se => this.createExprFilter(se, searchText, table))

      const expr: Expr = {
        type: "op", 
        op: "or",
        table: table, 
        exprs: searchExprs
      }

      return { id: blockDef.id, expr: expr }
    }
    else {
      return { id: blockDef.id, expr: null }
    }
  }

  createExprFilter(expr: Expr, searchText: string, table: string) {
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    const exprUtils = new ExprUtils(this.props.renderInstanceProps.schema, createExprVariables(this.props.renderInstanceProps.contextVars))

    // Get type of search expression
    const exprType = exprUtils.getExprType(expr)

    if (exprType === "text") {
      return {
        type: "op",
        op: "~*",
        table: table,
        exprs: [
          expr,
          { type: "literal", valueType: "text", value: escapeRegex(searchText) }
        ]
      } as Expr
    }

    if (exprType === "enum") {
      // Find matching enums
      const enumValues = exprUtils.getExprEnumValues(expr)!.filter(ev => localize(ev.name, this.props.renderInstanceProps.locale).toLowerCase().includes(searchText.toLowerCase()))
      if (enumValues.length === 0) {
        return null
      }
      return {
        type: "op",
        op: "= any",
        table: table,
        exprs: [
          expr,
          { type: "literal", valueType: "enumset", value: enumValues.map(ev => ev.id) }
        ]
      } as Expr
    }

    if (exprType === "enumset") {
      // Find matching enums
      const enumValues = exprUtils.getExprEnumValues(expr)!.filter(ev => localize(ev.name, this.props.renderInstanceProps.locale).toLowerCase().includes(searchText.toLowerCase()))
      if (enumValues.length === 0) {
        return null
      }
      return {
        type: "op",
        op: "intersects",
        table: table,
        exprs: [
          expr,
          { type: "literal", valueType: "enumset", value: enumValues.map(ev => ev.id) }
        ]
      } as Expr
    }
  
    throw new Error("Unsupported search type " + exprType) 
  }

  handleChange = (value: string) => {
    const blockDef = this.props.blockDef
    this.setState({ searchText: value })

    // Set filter 
    this.props.renderInstanceProps.setFilter(blockDef.rowsetContextVarId!, this.createFilter(value))
  }

  render() {
    return <SearchControl 
      value={this.state.searchText} 
      onChange={this.handleChange}
      placeholder={localize(this.props.blockDef.placeholder, this.props.renderInstanceProps.locale)} />
  }
}

/** Simple input box with magnifying glass */
export class SearchControl extends React.Component<{ value: string, onChange?: (value: string) => void, placeholder?: string }> {
  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(ev.target.value)
    }
  }

  render() {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <i className="fa fa-search" style={{ position: "absolute", right: 8, top: 10, color: "#AAA", pointerEvents: "none" }} />
        <input 
          type="text" 
          className="form-control" 
          style={{maxWidth: "20em"}} 
          value={this.props.value} 
          onChange={this.handleChange}
          placeholder={this.props.placeholder} />
    </div>
    )  
  }
}