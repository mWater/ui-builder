import VirtualDatabase from "./VirtualDatabase";
import mockDatabase from "../__fixtures__/mockDatabase";
import simpleSchema from "../__fixtures__/schema";
import { OrderByDir, QueryOptions, Transaction } from "./Database";
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

test("trigger change if underlying database changed", () => {
  let changed = false
  vdb.addChangeListener(() => { changed = true })

  // Fire change
  db.addChangeListener.mock.calls[0][0]()

  expect(changed).toBe(true)
})

test("pass through if no mutations", async () => {
  (db.query as jest.Mock).mockResolvedValue([])

  const queryOptions: QueryOptions = {
    select: {
      x: { type: "field", table: "t2", column: "text" }
    },
    from: "t2",
    where: t2Where,
    orderBy: [{ expr: { type: "field", table: "t2", column: "text" }, dir: OrderByDir.desc }],
    limit: 10
  }

  await vdb.query(queryOptions)

  expect(db.query.mock.calls[0][0]).toEqual(queryOptions)
})

test("queries with where clause and included columns", async () => {
  (db.query as jest.Mock).mockResolvedValue([])

  // Mutate to prevent passthrough
  const txn = vdb.transaction()
  await txn.removeRow("t1", "xyzzy")
  await txn.commit()
  
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
  const performQuery = async (rawRowsByTable: any, queryOptions: QueryOptions): Promise<any[]> => {
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

    // Mutate to prevent passthrough
    const txn = vdb.transaction()
    await txn.removeRow("t1", "xyzzy")
    await txn.commit()

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

  test("caches backend queries", async () => {
    const qopts: QueryOptions = {
      select: { x: { type: "field", table: "t1", column: "text" }},
      from: "t1"
    }

    await performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts)
    // Should not crash as uses cached query
    await performQuery(null, qopts)
  })

  describe("transactions", () => {
    const numberField: Expr = { type: "field", table: "t1", column: "number" }
    const qopts: QueryOptions = {
      select: { x: numberField },
      from: "t1",
      where: { type: "op", op: ">", table: "t1", exprs: [
        numberField,
        { type: "literal", valueType: "number", value: 3 }
      ]},
      orderBy: [{ expr: numberField, dir: OrderByDir.asc }]
    }

    test("waits until transaction committed", async () => {
      vdb.transaction().addRow("t1", { number: 6 })
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)
      expect(rows).toEqual([
        { x: 5 }
      ])
    })

    test("insert relevant row", async () => {
      const txn = vdb.transaction()
      txn.addRow("t1", { number: 6 })
      txn.commit()
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)
      expect(rows).toEqual([
        { x: 5 },
        { x: 6 }
      ])
    })

    test("insert irrelevant rows", async () => {
      const txn = vdb.transaction()
      txn.addRow("t1", { number: 1 })
      txn.addRow("t2", { number: 6 })
      txn.commit()
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)
      expect(rows).toEqual([
        { x: 5 }
      ])
    })

    test("update relevant row", async () => {
      const txn = vdb.transaction()
      txn.updateRow("t1", 1, { number: 7 })
      txn.commit()
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts)
      expect(rows).toEqual([
        { x: 6 },
        { x: 7 }
      ])
    })

    test("update relevant row to become irrelevant", async () => {
      const txn = vdb.transaction()
      txn.updateRow("t1", 1, { number: 2 })
      txn.commit()
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts)
      expect(rows).toEqual([
        { x: 6 }
      ])
    })

    test("remove relevant row", async () => {
      const txn = vdb.transaction()
      txn.removeRow("t1", 1)
      txn.commit()
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts)
      expect(rows).toEqual([
        { x: 6 }
      ])
    })

    test("notifies change listener", async () => {
      const changeListener = jest.fn()
      vdb.addChangeListener(changeListener)

      const txn = vdb.transaction()
      txn.removeRow("t1", 1)
      expect(changeListener.mock.calls.length).toBe(0)
      txn.commit()
      expect(changeListener.mock.calls.length).toBe(1)
    })

    test("commits changes", async () => {
      // Create changes
      const txn = vdb.transaction()
      const pk = txn.addRow("t1", { number: 1 })
      txn.removeRow("t1", 1)
      txn.commit()

      // Mock underlying transaction
      const mockTransaction = {
        addRow: jest.fn(),
        updateRow: jest.fn(),
        removeRow: jest.fn(),
        commit: jest.fn()
      };

      (db.transaction as jest.Mock).mockReturnValue(mockTransaction)

      // Commit to underlying database
      await vdb.commit()

      expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 1}])
      expect(mockTransaction.removeRow.mock.calls[0]).toEqual(["t1", 1])

      expect(() => vdb.transaction()).toThrow()
    })

    test("substitutes temporary primary keys", async () => {
      // Create changes
      const txn = vdb.transaction()
      const pk = await txn.addRow("t1", { number: 1 })
      const pk2 = await txn.addRow("t2", { "2-1": pk })
      await txn.commit()

      // Mock underlying transaction
      const mockTransaction = {
        addRow: jest.fn(),
        updateRow: jest.fn(),
        removeRow: jest.fn(),
        commit: jest.fn()
      };
      (db.transaction as jest.Mock).mockReturnValue(mockTransaction)

      // Mock return pks
      mockTransaction.addRow.mockResolvedValueOnce("PKA")
      mockTransaction.addRow.mockResolvedValueOnce("PKB")

      // Commit to underlying database
      await vdb.commit()

      expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 1 }])
      expect(mockTransaction.addRow.mock.calls[1]).toEqual(["t2", { "2-1": "PKA" }])
    })

    test("removes virtual rows locally", async () => {
      // Create changes
      const txn = vdb.transaction()
      const pk = await txn.addRow("t1", { number: 1 })
      await txn.updateRow("t1", pk, { number: 2 })
      await txn.removeRow("t2", pk)
      await txn.commit()

      // Mock underlying transaction
      const mockTransaction = {
        addRow: jest.fn(),
        updateRow: jest.fn(),
        removeRow: jest.fn(),
        commit: jest.fn()
      };
      (db.transaction as jest.Mock).mockReturnValue(mockTransaction)

      // Commit to underlying database
      await vdb.commit()

      expect(mockTransaction.addRow.mock.calls.length).toBe(0)
      expect(mockTransaction.updateRow.mock.calls.length).toBe(0)
      expect(mockTransaction.removeRow.mock.calls.length).toBe(0)
    })
  })
})