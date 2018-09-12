import ContextVarInjector from "./ContextVarInjector";
import { shallow, mount } from 'enzyme'
import { RenderInstanceProps, Filter } from "./blocks";
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

test("exprs are computed for rowset variables", (done) => {
  const contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" }
  const value: Expr = { type: "literal", valueType: "boolean", value: false }
  const contextVarExprs : Expr[] = [
    { type: "op", table: "t1", op: "count", exprs: [] }
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
    where: value
  }

  setImmediate(() => {
    // Should perform the query
    expect(queryOptions).toEqual(expectedQueryOptions)
  
    // Should get the value
    expect(innerRenderProps!.getContextVarExprValue(contextVar.id, contextVarExprs[0])).toBe("abc")
  
    done()
  })
})

test("filters are applied for rowset variables", (done) => {
  const contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" }
  const value: Expr = { type: "literal", valueType: "boolean", value: false }
  const contextVarExprs : Expr[] = [
    { type: "op", table: "t1", op: "count", exprs: [] }
  ]
  const initialFilters: Filter[] = [
    { id: "f1", expr: { type: "field", table: "t1", column: "c2" }}
  ]

  let innerRenderProps: RenderInstanceProps
    
  // Need mount as shallow rendering fails to call lifecycle componentDidUpdate
  const x = mount((
    <ContextVarInjector 
      renderInstanceProps={outerRenderProps} 
      contextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}
      initialFilters={initialFilters}>
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
    where: { type: "op", table: "t1", op: "and", exprs: [value, initialFilters[0].expr] }
  }

  setImmediate(() => {
    // Should perform the query
    expect(queryOptions).toEqual(expectedQueryOptions)
    
    expect(innerRenderProps.getFilters("cv1")).toEqual(initialFilters)

    // Should set filter (replacing with same id)
    const newFilter: Filter = { id: "f1", expr: { type: "field", table: "t1", column: "c3" }}
    innerRenderProps.setFilter("cv1", newFilter)

    setTimeout(() => {
      const expectedQueryOptions2 : QueryOptions = {
        select: {
          e0: contextVarExprs[0]
        },
        from: "t1",
        where: { type: "op", table: "t1", op: "and", exprs: [value, newFilter.expr] }
      }
      
      // Should perform the query
      expect(innerRenderProps.getFilters("cv1")).toEqual([newFilter])
      const queryOptions2 = (database.query as jest.Mock).mock.calls[1][0] as QueryOptions
      expect(queryOptions2).toEqual(expectedQueryOptions2)
    
      done()
    }, 1000)
  })
})