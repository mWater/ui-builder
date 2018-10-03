import VirtualDatabase from "./VirtualDatabase";


import mockDatabase from "../__fixtures__/mockDatabase";
import simpleSchema from "../__fixtures__/schema";
import { Database, OrderByDir, QueryOptions } from "./Database";
import { Expr } from "mwater-expressions";
import * as _ from "lodash";

const schema = simpleSchema()
let db = mockDatabase()
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
  vdb = new VirtualDatabase(db, schema)
})

test("shouldIncludeColumn includes regular columns and joins without inverse", () => {
  expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" }})).toBe(true)
  expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" }, expr: { type: "literal", valueType: "text", value: "xyz"}})).toBe(false)
  expect(vdb.shouldIncludeColumn(schema.getColumn("t1", "1-2")!)).toBe(false)
  expect(vdb.shouldIncludeColumn(schema.getColumn("t2", "2-1")!)).toBe(true)
})

test("queries with where clause and included columns", () => {
  vdb.query({
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
    db.query = ((qo: QueryOptions) => {
      // Get rows
      let rows: any[] = rawRowsByTable[qo.from]

      // Prepend c_ to non-id columns
      rows = rows.map((row: any) => _.mapKeys(row, (v, k) => k === "id" ? "id" : "c_" + k))

      return Promise.resolve(rows)
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

})