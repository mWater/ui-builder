import { QueryOptions, OrderByDir } from './Database'
import { QueryCompiler } from './QueryCompiler';
import simpleSchema from '../__fixtures__/schema';

const schema = simpleSchema()
const compiler = new QueryCompiler(schema)

test("compiles simple query", () => {
  const options: QueryOptions = {
    select: { x: { type: "field", table: "t1", column: "text" } },
    from: "t1",
  }

  const { jsonql, rowMapper } = compiler.compileQuery(options)

  expect(jsonql).toEqual({
    type: "query",
    selects: [
      { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_0" }
    ],
    from: { type: "table", table: "t1", alias: "main" },
    groupBy: [],
    orderBy: []
  })

  expect(rowMapper({ c_0: "abc", o_0: "xyz" })).toEqual({ x: "abc" })
})

test("compiles aggregated, limited query", () => {
  const options: QueryOptions = {
    select: { 
      x: { type: "field", table: "t1", column: "text" },
      y: { type: "op", table: "t1", op: "count", exprs: [] } 
    },
    from: "t1",
    limit: 10
  }

  const { jsonql, rowMapper } = compiler.compileQuery(options)

  expect(jsonql).toEqual({
    type: "query",
    selects: [
      { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_0" },
      { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "c_1" }
    ],
    from: { type: "table", table: "t1", alias: "main" },
    groupBy: [1],
    orderBy: [],
    limit: 10
  })

  expect(rowMapper({ c_0: "abc", c_1: "xyz" })).toEqual({ x: "abc", y: "xyz" })
})

test("compiles ordered where query", () => {
  const options: QueryOptions = {
    select: { x: { type: "field", table: "t1", column: "text" } },
    from: "t1",
    where: { type: "field", table: "t1", column: "boolean" },
    orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: OrderByDir.desc }]
  }

  const { jsonql, rowMapper } = compiler.compileQuery(options)

  expect(jsonql).toEqual({
    type: "query",
    selects: [
      { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_0" },
      { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "o_0" }
    ],
    from: { type: "table", table: "t1", alias: "main" },
    where: { type: "field", tableAlias: "main", column: "boolean" },
    groupBy: [],
    orderBy: [{ ordinal: 2, direction: "desc", nulls: "last" }]
  })
})

