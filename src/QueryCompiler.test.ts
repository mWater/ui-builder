import { QueryOptions, OrderByDir } from './database/Database'
import { QueryCompiler } from './QueryCompiler';
import simpleSchema from './__fixtures__/schema';

const schema = simpleSchema()
const compiler = new QueryCompiler(schema)

test("compiles simple query", () => {
  const options: QueryOptions = {
    select: { x: { type: "field", table: "t1", column: "text" } },
    from: "t1",
  }

  const query = compiler.compileQuery(options)

  expect(query).toEqual({
    type: "query",
    selects: [
      { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_x" }
    ],
    from: { type: "table", table: "t1", alias: "main" },
    groupBy: [],
    orderBy: []
  })
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

  const query = compiler.compileQuery(options)

  expect(query).toEqual({
    type: "query",
    selects: [
      { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_x" },
      { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "c_y" }
    ],
    from: { type: "table", table: "t1", alias: "main" },
    groupBy: [1],
    orderBy: [],
    limit: 10
  })
})

test("compiles ordered where query", () => {
  const options: QueryOptions = {
    select: { x: { type: "field", table: "t1", column: "text" } },
    from: "t1",
    where: { type: "field", table: "t1", column: "boolean" },
    orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: OrderByDir.desc }]
  }

  const query = compiler.compileQuery(options)

  expect(query).toEqual({
    type: "query",
    selects: [
      { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_x" },
      { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "o0" }
    ],
    from: { type: "table", table: "t1", alias: "main" },
    where: { type: "field", tableAlias: "main", column: "boolean" },
    groupBy: [],
    orderBy: [{ ordinal: 2, direction: "desc", nulls: "last" }]
  })
})

