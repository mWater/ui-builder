import { ContextVar } from "./blocks";
import { Database, QueryOptions } from "../database/Database";
import { Expr, DataSource } from "mwater-expressions";
import mockDatabase from "../__fixtures__/mockDatabase";
import simpleSchema from "../__fixtures__/schema";
import { ActionLibrary } from "./ActionLibrary";
import { PageStack } from "../PageStack";
import { InstanceCtx } from "../contexts";
import { evalContextVarExpr } from "./evalContextVarExpr";

let database: Database
let outerRenderProps: InstanceCtx
const schema = simpleSchema()

beforeEach(() => {
  const db = mockDatabase()
  db.query = jest.fn(() => Promise.resolve([{ value: "abc" }]))

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


test("exprs are computed for new row variables", async () => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" }
  const value = "1234"
  const contextVarExpr: Expr = { type: "field", table: "t1", column: "c1" }
  
  const result = await evalContextVarExpr({
    contextVar, contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
  })

  // Query should have been made
  const queryOptions = (database.query as jest.Mock).mock.calls[0][0] as QueryOptions
  const expectedQueryOptions : QueryOptions = {
    select: {
      value: contextVarExpr
    },
    from: "t1",
    where: { 
      type: "op",
      op: "=",
      table: "t1",
      exprs: [{ type: "id", table: "t1" }, { type: "literal", valueType: "id", idTable: "t1", value: "1234" }]
    }
  }

  // Should perform the query
  expect(queryOptions).toEqual(expectedQueryOptions)
  
  // Should get the value
  expect(result).toBe("abc")
})

test("exprs are null for null row variables", async () => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" }
  const value = null
  const contextVarExpr: Expr = { type: "field", table: "t1", column: "c1" }
  
  const result = await evalContextVarExpr({
    contextVar, contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
  })

  // Query should not have been made
  expect((database.query as jest.Mock).mock.calls.length).toBe(0)

  // Should get the value as null
  expect(result).toBeNull()
})

test("exprs are computed for rowset variable", async () => {
  const contextVar: ContextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" }
  const value: Expr = { type: "literal", valueType: "boolean", value: false }
  const contextVarExpr: Expr = { type: "op", table: "t1", op: "count", exprs: [] }

  const result = await evalContextVarExpr({
    contextVar, contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
  })

  // Query should have been made
  const queryOptions = (database.query as jest.Mock).mock.calls[0][0] as QueryOptions
  const expectedQueryOptions : QueryOptions = {
    select: {
      value: contextVarExpr
    },
    from: "t1",
    where: value,
    limit: 2
  }

  // Should perform the query
  expect(queryOptions).toEqual(expectedQueryOptions)

  // Should get the value
  expect(result).toBe("abc")
})

test("exprs are computed for literals", async () => {
  const expr: Expr = { type: "literal", valueType: "text", value: "abc" }

  const result = await evalContextVarExpr({
    contextVar: null, contextVarValue: null, expr: expr, ctx: outerRenderProps
  })

  // Should get the value
  expect(result).toBe("abc")
})

