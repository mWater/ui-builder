import ContextVarInjector from "./ContextVarInjector";
import { shallow, mount } from 'enzyme'
import { Filter, ContextVar } from "./blocks";
import { Database, QueryOptions } from "../database/Database";
import * as React from "react";
import { Expr, Schema, DataSource } from "mwater-expressions";
import mockDatabase from "../__fixtures__/mockDatabase";
import simpleSchema from "../__fixtures__/schema";
import { ActionLibrary } from "./ActionLibrary";
import { PageStack } from "../PageStack";
import { InstanceCtx } from "../contexts";

let database: Database
let outerRenderProps: InstanceCtx
const schema = simpleSchema()

beforeEach(() => {
  const db = mockDatabase()
  db.query = jest.fn(() => Promise.resolve([{ e0: "abc" }]))

  database = db
  
  outerRenderProps = {
    locale: "en",
    database: database,
    schema: schema,
    dataSource: {} as DataSource,
    contextVars: [],
    actionLibrary: {} as ActionLibrary,
    widgetLibrary: { widgets: {} },
    pageStack: {} as PageStack,
    contextVarValues: {},
    getContextVarExprValue:  jest.fn(),
    onSelectContextVar: jest.fn(),
    setFilter: jest.fn(),
    getFilters: jest.fn(),
    renderChildBlock: jest.fn(),
    createBlock: jest.fn(),
    registerForValidation: () => () => {},
    T: (str) => str
  }  
})

test("inner contains extra context vars", () => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" }
  const value = "1234"
  const contextVarExprs : Expr[] = [
    { type: "field", table: "t1", column: "c1" }
  ]

  let innerRenderProps: InstanceCtx
    
  const x = shallow((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}>
      { (instanceCtx: InstanceCtx) => {
          innerRenderProps = instanceCtx
          return <div/>
      }}
    </ContextVarInjector>))
  
  // Inner props should have new context variable
  expect(innerRenderProps!.contextVars).toEqual([contextVar])
})

test("exprs are computed for row variables", (done) => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" }
  const value = "1234"
  const contextVarExprs : Expr[] = [
    { type: "field", table: "t1", column: "c1" }
  ]

  let innerRenderProps: InstanceCtx
    
  const x = shallow((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}>
      { (instanceCtx: InstanceCtx) => {
          innerRenderProps = instanceCtx
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

test("exprs are null for null row variables", (done) => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" }
  const value = null
  const contextVarExprs : Expr[] = [
    { type: "field", table: "t1", column: "c1" }
  ]

  let innerRenderProps: InstanceCtx
    
  const x = shallow((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}>
      { (instanceCtx: InstanceCtx) => {
          innerRenderProps = instanceCtx
          return <div/>
      }}
    </ContextVarInjector>))
  
  setImmediate(() => {
    // Query should not have been made
    expect((database.query as jest.Mock).mock.calls.length).toBe(0)
  
    // Should get the value as undefined
    expect(innerRenderProps!.getContextVarExprValue(contextVar.id, contextVarExprs[0])).toBeUndefined()
  
    done()
  })
})


test("exprs are computed for rowset variables, excluding non-aggregates", (done) => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" }
  const value: Expr = { type: "literal", valueType: "boolean", value: false }
  const contextVarExprs : Expr[] = [
    { type: "field", table: "t1", column: "text" },
    { type: "op", table: "t1", op: "count", exprs: [] }
  ]

  let innerRenderProps: InstanceCtx
    
  const x = shallow((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}>
      { (instanceCtx: InstanceCtx) => {
          innerRenderProps = instanceCtx
          return <div/>
      }}
    </ContextVarInjector>))
  
  // Query should have been made
  const queryOptions = (database.query as jest.Mock).mock.calls[0][0] as QueryOptions
  const expectedQueryOptions : QueryOptions = {
    select: {
      e0: contextVarExprs[1]
    },
    from: "t1",
    where: value,
    limit: 1
  }

  setImmediate(() => {
    // Should perform the query
    expect(queryOptions).toEqual(expectedQueryOptions)
  
    // Should get the value
    expect(innerRenderProps!.getContextVarExprValue(contextVar.id, contextVarExprs[1])).toBe("abc")
  
    done()
  })
})

test("filters are applied for rowset variables", (done) => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" }
  const value: Expr = { type: "literal", valueType: "boolean", value: false }
  const contextVarExprs : Expr[] = [
    { type: "op", table: "t1", op: "count", exprs: [] }
  ]
  const initialFilters: Filter[] = [
    { id: "f1", expr: { type: "field", table: "t1", column: "c2" }}
  ]

  let innerRenderProps: InstanceCtx
  let innerIsLoading = false
    
  // Need mount as shallow rendering fails to call lifecycle componentDidUpdate
  const x = mount((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}
      initialFilters={initialFilters}>
      { (instanceCtx: InstanceCtx, isLoading: boolean) => {
          innerRenderProps = instanceCtx
          innerIsLoading = isLoading
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
    where: { type: "op", table: "t1", op: "and", exprs: [value, initialFilters[0].expr!] },
    limit: 1
  }
  // TODO test properly isLoading
  // expect(innerIsLoading).toBe(true)

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
        where: { type: "op", table: "t1", op: "and", exprs: [value, newFilter.expr!] },
        limit: 1
      }
      
      // Should perform the query
      expect(innerRenderProps.getFilters("cv1")).toEqual([newFilter])
      const queryOptions2 = (database.query as jest.Mock).mock.calls[1][0] as QueryOptions
      expect(queryOptions2).toEqual(expectedQueryOptions2)
    
      done()
    }, 10)
  })
})

test("null filters are ignored for rowset variables", (done) => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" }
  const value: Expr = { type: "literal", valueType: "boolean", value: false }
  const contextVarExprs : Expr[] = [
    { type: "op", table: "t1", op: "count", exprs: [] }
  ]
  const initialFilters: Filter[] = [
    { id: "f1", expr: null}
  ]

  let innerRenderProps: InstanceCtx
  let innerIsLoading = false
    
  // Need mount as shallow rendering fails to call lifecycle componentDidUpdate
  const x = mount((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}
      initialFilters={initialFilters}>
      { (instanceCtx: InstanceCtx, isLoading: boolean) => {
          innerRenderProps = instanceCtx
          innerIsLoading = isLoading
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
    where: { type: "op", table: "t1", op: "and", exprs: [value] },
    limit: 1
  }
  // TODO test properly isLoading
  // expect(innerIsLoading).toBe(true)

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
        where: { type: "op", table: "t1", op: "and", exprs: [value, newFilter.expr!] },
        limit: 1
      }
      
      // Should perform the query
      expect(innerRenderProps.getFilters("cv1")).toEqual([newFilter])
      const queryOptions2 = (database.query as jest.Mock).mock.calls[1][0] as QueryOptions
      expect(queryOptions2).toEqual(expectedQueryOptions2)
    
      done()
    }, 10)
  })
})

test("filters are not applied for rowset variables to variable value", (done) => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" }
  const value: Expr = { type: "literal", valueType: "boolean", value: false }
  const contextVarExprs : Expr[] = [
    { type: "op", table: "t1", op: "count", exprs: [] }
  ]
  const initialFilters: Filter[] = [
    { id: "f1", expr: { type: "field", table: "t1", column: "c2" }}
  ]

  let innerRenderProps: InstanceCtx
  let innerIsLoading = false
    
  // Need mount as shallow rendering fails to call lifecycle componentDidUpdate
  const x = mount((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}
      initialFilters={initialFilters}>
      { (instanceCtx: InstanceCtx, isLoading: boolean) => {
          innerRenderProps = instanceCtx
          innerIsLoading = isLoading
          return <div/>
      }}
    </ContextVarInjector>))

  setImmediate(() => {
    expect(innerRenderProps.contextVarValues.cv1).toEqual(value)
    done()
  })
  
})
  
test("exprs are computed for null variable with variable-based expression", (done) => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "number" }
  const value = 1234
  const contextVarExprs : Expr[] = [
    { type: "op", op: "+", exprs: [{ type: "variable", variableId: "cv1" }, { type: "literal", valueType: "number", value: 1}]}
  ]

  let innerRenderProps: InstanceCtx
    
  const x = shallow((
    <ContextVarInjector 
      instanceCtx={outerRenderProps} 
      injectedContextVar={contextVar} 
      value={value}
      contextVarExprs={contextVarExprs}>
      { (instanceCtx: InstanceCtx) => {
          innerRenderProps = instanceCtx
          return <div/>
      }}
    </ContextVarInjector>))
  
  setImmediate(() => {
    // Should get the value
    expect(innerRenderProps!.getContextVarExprValue(null, contextVarExprs[0])).toBe(1235)
  
    done()
  })
})
