import _ from "lodash";
import React from "react";
import { SearchBlockDef } from "./search";
import { createExprVariables, Filter } from "../../blocks";
import { Expr, ExprUtils } from "mwater-expressions";
import { localize } from "../../localization";
import { InstanceCtx } from "../../../contexts";
import { useState, useRef, useEffect } from "react";

/** Search block that filters the rowset */
const SearchBlockInstance = (props: {
  blockDef: SearchBlockDef
  instanceCtx: InstanceCtx
}) => {
  const { blockDef, instanceCtx } = props
  const [searchText, setSearchText] = useState("")
  const searchControlRef = useRef<SearchControl>(null)

  // Focus if enabled
  useEffect(() => {
    if (blockDef.autoFocus && searchControlRef.current) {
      searchControlRef.current.focus()
    }
  }, [])

  const createExprFilter = (expr: Expr, searchText: string, table: string) => {
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    const exprUtils = new ExprUtils(instanceCtx.schema, createExprVariables(instanceCtx.contextVars))

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

    if (exprType === "text[]") {
      return {
        type: "op",
        op: "~*",
        table: table,
        exprs: [
          { type: "op", op: "to text", table: table, exprs: [expr] },
          { type: "literal", valueType: "text", value: escapeRegex(searchText) }
        ]
      } as Expr
    }

    if (exprType === "enum") {
      // Find matching enums
      const enumValues = exprUtils.getExprEnumValues(expr)!.filter(ev => localize(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()))
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
      const enumValues = exprUtils.getExprEnumValues(expr)!.filter(ev => localize(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()))
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


  const createFilter = (searchText: string): Filter => {
    // Get table
    const table = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowsetContextVarId)!.table!
    
    if (searchText) {
      const searchExprs: Expr[] = blockDef.searchExprs.map(se => createExprFilter(se, searchText, table))

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


  const handleChange = (value: string) => {
    setSearchText(value)

    // Set filter 
    instanceCtx.setFilter(blockDef.rowsetContextVarId!, createFilter(value))
  }

  return <SearchControl 
    value={searchText} 
    onChange={handleChange}
    ref={searchControlRef}
    placeholder={localize(blockDef.placeholder, instanceCtx.locale)} />
}

export default SearchBlockInstance

interface SearchControlProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
}

/** Simple input box with magnifying glass */
export class SearchControl extends React.Component<SearchControlProps> {
  private inputRef = React.createRef<HTMLInputElement>()

  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(ev.target.value)
    }
  }

  focus() {
    if (this.inputRef.current) {
      this.inputRef.current.focus()
    }
  }

  render() {
    return (
      <div style={{ position: "relative", display: "inline-block", margin: 5, width: "15em" }}>
        <i className="fa fa-search" style={{ position: "absolute", right: 8, top: 10, color: "#AAA", pointerEvents: "none" }} />
        <input 
          type="text" 
          ref={this.inputRef}
          className="form-control" 
          style={{ width: "100%" }}
          value={this.props.value} 
          onChange={this.handleChange}
          placeholder={this.props.placeholder} />
    </div>
    )  
  }
}