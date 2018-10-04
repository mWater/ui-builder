import VirtualDatabase from "./VirtualDatabase";
import mockDatabase from "../__fixtures__/mockDatabase";
import simpleSchema from "../__fixtures__/schema";
import { Database, OrderByDir, QueryOptions } from "./Database";
import { Expr, ExprEvaluator } from "mwater-expressions";
import * as _ from "lodash";
import { PromiseExprEvaluator, PromiseExprEvaluatorRow } from "./PromiseExprEvaluator";

const schema = simpleSchema()
let db: any
let vdb: VirtualDatabase

const t2Where: Expr = {
  type: "op",
  op: "=",
  table: "t2",
  exprs: [
    { type: "field", table: "t2", column: "number" },
    { type: "literal", valueType: "number", value: 5 }
  ]
}

beforeEach(() => {
  db = mockDatabase()
  vdb = new VirtualDatabase(db, schema, "en")
})

test("shouldIncludeColumn includes regular columns and joins without inverse", () => {
  expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" }})).toBe(true)
  expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" }, expr: { type: "literal", valueType: "text", value: "xyz"}})).toBe(false)
  expect(vdb.shouldIncludeColumn(schema.getColumn("t1", "1-2")!)).toBe(false)
  expect(vdb.shouldIncludeColumn(schema.getColumn("t2", "2-1")!)).toBe(true)
})

test("queries with where clause and included columns", async () => {
  (db.query as jest.Mock).mockResolvedValue([])

  await vdb.query({
    select: {
      x: { type: "field", table: "t2", column: "text" }
    },
    from: "t2",
    where: t2Where,
    orderBy: [{ expr: { type: "field", table: "t2", column: "text" }, dir: OrderByDir.desc }],
    limit: 10
  })

  expect(db.query.mock.calls[0][0]).toEqual({
    select: {
      id: { type: "id", table: "t2" },
      c_text: { type: "field", table: "t2", column: "text" },
      c_number: { type: "field", table: "t2", column: "number" },
      "c_2-1": { type: "field", table: "t2", column: "2-1" }
    },
    from: "t2",
    where: t2Where
  })
})

describe("select, order, limit", () => {
  const performQuery = (rawRowsByTable: any, queryOptions: QueryOptions): Promise<any[]> => {
    // Set up mock database to return raw rows with c_ prefixed on column names
    // This simulates a real database call
    db.query = (async (qo: QueryOptions) => {
      // Get rows
      let rows: any[]
      rows = rawRowsByTable[qo.from]
      
      // Filter rows by where
      if (qo.where) {
        const exprEval = new PromiseExprEvaluator(new ExprEvaluator(schema))
        const filteredRows: any[] = []
        for (const row of rows) {
          const evalRow: PromiseExprEvaluatorRow = {
            getPrimaryKey: () => Promise.resolve(row.id),
            getField: (columnId) => Promise.resolve(row[columnId])
          }
          if (await exprEval.evaluate(qo.where, { row: evalRow })) {
            filteredRows.push(row)
          }
        }
        rows = filteredRows
      }

      // Prepend c_ to non-id columns
      rows = rows.map((row: any) => _.mapKeys(row, (v, k: string) => k === "id" ? "id" : "c_" + k))

      return rows
    }) as any

    // Perform query
    return vdb.query(queryOptions)
  }

  test("simple query", async () => {
    const qopts: QueryOptions = {
      select: { x: { type: "field", table: "t1", column: "text" }},
      from: "t1"
    }

    const rows = await performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts)
    expect(rows).toEqual([
      { x: "abc" }
    ])
  })

  test("aggr count expr", async () => {
    const qopts: QueryOptions = {
      select: { 
        x: { type: "field", table: "t1", column: "text" },
        y: { type: "op", table: "t1", op: "count", exprs: [] }
      },
      from: "t1"
    }

    const rows = await performQuery({ t1: [
      { id: 1, text: "abc" },
      { id: 2, text: "abc" },
      { id: 3, text: "def" }
    ] }, qopts)

    expect(rows).toEqual([
      { x: "abc", y: 2 },
      { x: "def", y: 1 }
    ])
  })

  test("orderby query with limit", async () => {
    const qopts: QueryOptions = {
      select: { x: { type: "field", table: "t1", column: "text" }},
      from: "t1",
      orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: OrderByDir.desc }],
      limit: 2
    }

    const rows = await performQuery({ t1: [
      { id: 1, text: "a", number: 1 },
      { id: 2, text: "b", number: 2 },
      { id: 3, text: "c", number: 3 }
    ] }, qopts)
    expect(rows).toEqual([
      { x: "c" },
      { x: "b" }
    ])
  })

  test("n-1 join", async () => {
    const qopts: QueryOptions = {
      select: { x: { type: "field", table: "t2", column: "2-1" }},
      from: "t2"
    }

    const rows = await performQuery({ t1: [
      { id: "a", text: "a", number: 1 }
    ], t2: [
      { id: 1, text: "a", number: 1, "2-1": "a" }
    ] }, qopts)

    expect(rows).toEqual([
      { x: "a" }
    ])
  })

  test("n-1 scalar", async () => {
    const qopts: QueryOptions = {
      select: { x: { type: "scalar", joins: ["2-1"], table: "t2", expr: { type: "field", table: "t1", column: "text" } } },
      from: "t2"
    }

    const rows = await performQuery({ t1: [
      { id: 1, text: "abc" }
    ], t2: [
      { id: 101, "2-1": 1 }
    ] }, qopts)
    expect(rows).toEqual([
      { x: "abc" }
    ])
  })

  test("1-n scalar", async () => {
    const qopts: QueryOptions = {
      select: { x: { type: "scalar", joins: ["1-2"], table: "t1", expr: {
        type: "op", op: "sum", table: "t1", exprs: [{ type: "field", table: "t2", column: "number" }] } } },
      from: "t1"
    }

    const t2Func = (qo: QueryOptions) => {
      if ((qo.where as any).exprs![1].value === 1) {
        return [
          { id: 101, "2-1": 1, number: 1 },
          { id: 102, "2-1": 1, number: 2 }
        ]
      }
      else {
        return [
          { id: 103, "2-1": 2, number: 4 }
        ]
      }
     }

    const rows = await performQuery({ t1: [
      { id: 1 },
      { id: 2 }
    ], t2: [
      { id: 101, "2-1": 1, number: 1 },
      { id: 102, "2-1": 1, number: 2 },
      { id: 103, "2-1": 2, number: 4 }
    ]}, qopts)
    expect(rows).toEqual([
      { x: 3 },
      { x: 4 }
    ])
  })
})