import SearchBlockInstance from "./SearchBlockInstance";
import { SearchBlockDef } from "./search";
import { Filter, RenderInstanceProps } from "../../blocks";
import { shallow } from "enzyme";
import * as React from "react";
import { Expr } from "mwater-expressions";


const getFilter = (blockDef: SearchBlockDef, searchText: string) => {
  return new Promise((resolve, reject) => {
    // Create minimal renderInstanceProps
    const renderInstanceProps = {
      setFilter: (contextVarId: string, filter: Filter) => {
        resolve({ contextVarId: contextVarId, filter: filter })
      },
      contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
    }

    const sbi = shallow(<SearchBlockInstance blockDef={blockDef} renderInstanceProps={renderInstanceProps as RenderInstanceProps}/>)
    sbi.find("input").simulate("change", { target: { value: searchText }})
  })
} 


test("creates search on single expression", async () => {
  const searchExprs: Expr[] = [
    { type: "field", table: "t1", column: "text" }
  ]
  const filter = await getFilter({ id: "s", rowsetId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "xyz")
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
              { type: "literal", valueType: "text", value: "xyz" }
            ]
          }
        ]
      }
    }
  })
})