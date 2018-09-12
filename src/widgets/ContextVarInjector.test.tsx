import ContextVarInjector from "./ContextVarInjector";
import { shallow } from 'enzyme'
import { RenderInstanceProps } from "./blocks";
import { Database, QueryOptions } from "../Database";
import * as React from "react";
import { Expr } from "mwater-expressions";


const createMockDatabase = () => {
  return {
    query: jest.fn(),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
    addRow: jest.fn(),
    updateRow: jest.fn(),
    removeRow: jest.fn()
  }
}

let database: Database
let outerRenderProps: RenderInstanceProps

beforeEach(() => {
  const db = createMockDatabase()
  db.query = jest.fn(() => Promise.resolve([{ e0: "abc" }]))

  database = db
  
  outerRenderProps = {
    locale: "en",
    database: database,
    contextVars: [],
    getContextVarValue: jest.fn(),
    getContextVarExprValue:  jest.fn(),
    onSelectContextVar: jest.fn(),
    setFilter: jest.fn(),
    getFilters: jest.fn(),
    renderChildBlock: jest.fn(),
  }  
})

test("inner contains extra context vars", () => {
  const contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" }
  const value = "1234"
  const contextVarExprs : Expr[] = [
    { type: "field", table: "t1", column: "c1" }
  ]

  let innerRenderProps: RenderInstanceProps
    
  const x = shallow((
    <ContextVarInjector 
      renderInstanceProps={outerRenderProps} 
      contextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}>
      { (renderInstanceProps: RenderInstanceProps) => {
          innerRenderProps = renderInstanceProps
          return <div/>
      }}
    </ContextVarInjector>))
  
  // Inner props should have new context variable
  expect(innerRenderProps!.contextVars).toEqual([contextVar])
})

test("exprs are computed for row variables", (done) => {
  const contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" }
  const value = "1234"
  const contextVarExprs : Expr[] = [
    { type: "field", table: "t1", column: "c1" }
  ]

  let innerRenderProps: RenderInstanceProps
    
  const x = shallow((
    <ContextVarInjector 
      renderInstanceProps={outerRenderProps} 
      contextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}>
      { (renderInstanceProps: RenderInstanceProps) => {
          innerRenderProps = renderInstanceProps
          return <div/>
      }}
    </ContextVarInjector>))
  
  // Query should have been made
  const queryOptions = (database.query as jest.Mock).mock.calls[0][0] as QueryOptions
  const expectedQueryOptions : QueryOptions = {
    select: {
      e0: contextVarExprs[0]
    },
    from: "t1",
    where: { 
      type: "op",
      op: "=",
      table: "t1",
      exprs: [{ type: "id", table: "t1" }, { type: "literal", valueType: "id", idTable: "t1", value: "1234" }]
    }
  }

  setImmediate(() => {
    // Should perform the query
    expect(queryOptions).toEqual(expectedQueryOptions)
  
    // Should get the value
    expect(innerRenderProps!.getContextVarExprValue(contextVar.id, contextVarExprs[0])).toBe("abc")
  
    done()
  })
})