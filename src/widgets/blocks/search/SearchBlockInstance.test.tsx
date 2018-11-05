import SearchBlockInstance, { SearchControl } from "./SearchBlockInstance";
import { SearchBlockDef } from "./search";
import { Filter, RenderInstanceProps } from "../../blocks";
import { shallow } from "enzyme";
import * as React from "react";
import { Expr } from "mwater-expressions";
import simpleSchema from "../../../__fixtures__/schema";

const getFilter = (blockDef: SearchBlockDef, searchText: string) => {
  return new Promise((resolve, reject) => {
    // Create minimal renderInstanceProps
    const renderInstanceProps = {
      schema: simpleSchema(),
      setFilter: (contextVarId: string, filter: Filter) => {
        resolve({ contextVarId: contextVarId, filter: filter })
      },
      contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
    }

    const sbi = shallow(<SearchBlockInstance blockDef={blockDef} renderInstanceProps={renderInstanceProps as RenderInstanceProps}/>)
    sbi.prop("onChange")(searchText)
  })
} 


test("creates search on single text expression", async () => {
  const searchExprs: Expr[] = [
    { type: "field", table: "t1", column: "text" }
  ]
  const filter = await getFilter({ id: "s", rowsetContextVarId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "xyz*")
  expect(filter).toEqual({
    contextVarId: "cv1",
    filter: {
      id: "s",
      expr: {
        type: "op",
        table: "t1",
        op: "or",
        exprs: [
          {
            type: "op",
            table: "t1",
            op: "~*",
            exprs: [
              searchExprs[0],
              { type: "literal", valueType: "text", value: "xyz\\*" }
            ]
          }
        ]
      }
    }
  })
})

test("creates search on single enum expression", async () => {
  const searchExprs: Expr[] = [
    { type: "field", table: "t1", column: "enum" }
  ]
  const filter = await getFilter({ id: "s", rowsetContextVarId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "B")
  expect(filter).toEqual({
    contextVarId: "cv1",
    filter: {
      id: "s",
      expr: {
        type: "op",
        table: "t1",
        op: "or",
        exprs: [
          {
            type: "op",
            table: "t1",
            op: "= any",
            exprs: [
              searchExprs[0],
              { type: "literal", valueType: "enumset", value: ["b"] }
            ]
          }
        ]
      }
    }
  })
})

test("creates search on single enumset expression", async () => {
  const searchExprs: Expr[] = [
    { type: "field", table: "t1", column: "enumset" }
  ]
  const filter = await getFilter({ id: "s", rowsetContextVarId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "B")
  expect(filter).toEqual({
    contextVarId: "cv1",
    filter: {
      id: "s",
      expr: {
        type: "op",
        table: "t1",
        op: "or",
        exprs: [
          {
            type: "op",
            table: "t1",
            op: "intersects",
            exprs: [
              searchExprs[0],
              { type: "literal", valueType: "enumset", value: ["b"] }
            ]
          }
        ]
      }
    }
  })
})