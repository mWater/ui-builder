import VirtualDatabase from "./VirtualDatabase";
import mockDatabase from "../__fixtures__/mockDatabase";
import simpleSchema from "../__fixtures__/schema";
import { QueryOptions } from "./Database";
import { Expr, PromiseExprEvaluator, PromiseExprEvaluatorRow } from "mwater-expressions";
import * as _ from "lodash";

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

/** Simulates a change to the virtual database to prevent passthrough */
const preventPassthrough = () => {
  const tx = vdb.transaction()
  tx.removeRow("t1", "NONSUCH")
  tx.removeRow("t2", "NONSUCH")
  tx.commit()
}

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

test("queries with where clause and included columns", async () => {
  (db.query as jest.Mock).mockResolvedValue([])
  preventPassthrough()    // Test how queries are transformed by preventing passthrough

  await vdb.query({
    select: {
      x: { type: "field", table: "t2", column: "text" }
    },
    from: "t2",
    where: t2Where,
    orderBy: [{ expr: { type: "field", table: "t2", column: "text" }, dir: "desc" }],
    limit: 10
  }, [], {})

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
        const exprEval = new PromiseExprEvaluator({ schema })
        const filteredRows: any[] = []
        for (const row of rows) {
          const evalRow: PromiseExprEvaluatorRow = {
            getPrimaryKey: () => Promise.resolve(row.id),
            getField: (columnId) => Promise.resolve(row[columnId]),
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
    return vdb.query(queryOptions, [], {})
  }

  test("simple query", async () => {
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

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
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

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
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

    const qopts: QueryOptions = {
      select: { x: { type: "field", table: "t1", column: "text" }},
      from: "t1",
      orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }],
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

  test("orderby query with capitalization", async () => {
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

    const qopts: QueryOptions = {
      select: { x: { type: "id", table: "t1" }},
      from: "t1",
      orderBy: [
        { expr: { type: "field", table: "t1", column: "text" }, dir: "asc" },
        { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
      ],
    }

    const rows = await performQuery({ t1: [
      { id: 1, text: "a", number: 1 },
      { id: 2, text: "a", number: 2 },
      { id: 3, text: "b", number: 3 },
      { id: 4, text: "A", number: 4 }
    ] }, qopts)

    expect(rows).toEqual([
      { x: 2 },
      { x: 1 },
      { x: 4 },
      { x: 3 }
    ])
  })

  test("orderby query with numbers", async () => {
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

    const qopts: QueryOptions = {
      select: { x: { type: "id", table: "t1" }},
      from: "t1",
      orderBy: [
        { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
      ],
    }

    const rows = await performQuery({ t1: [
      { id: 1, number: 1 },
      { id: 2, number: 2 },
      { id: 3, number: 3 },
      { id: 4, number: 11 }
    ] }, qopts)

    expect(rows).toEqual([
      { x: 4 },
      { x: 3 },
      { x: 2 },
      { x: 1 }
    ])
  })

  test("n-1 join", async () => {
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

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
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

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
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

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
    preventPassthrough()    // Test how queries are transformed by preventing passthrough

    const qopts: QueryOptions = {
      select: { x: { type: "field", table: "t1", column: "text" }},
      from: "t1"
    }

    await performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts)
    // Should not crash as uses cached query
    await performQuery(null, qopts)
  })

  test("does not query rows that are not yet added", async () => {
    const tx = vdb.transaction()
    const pk = await tx.addRow("t1", {})
    await tx.commit()

    const qopts: QueryOptions = {
      select: { x: { type: "field", table: "t1", column: "text" }},
      from: "t1",
      where: { type: "op", table: "t1", op: "=", exprs: [
        { type: "id", table: "t1" }, 
        { type: "literal", valueType: "id", value: pk }
      ]}
    }

    // Should not crash as doesn't pass along
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
      orderBy: [{ expr: numberField, dir: "asc" }]
    }

    test("waits until transaction committed", async () => {
      preventPassthrough()    // Test how queries are transformed by preventing passthrough

      vdb.transaction().addRow("t1", { number: 6 })
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)
      expect(rows).toEqual([
        { x: 5 }
      ])
    })

    test("insert relevant row", async () => {
      const txn = vdb.transaction()
      await txn.addRow("t1", { number: 6 })
      await txn.commit()
  
      const rows = await performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)
      expect(rows).toEqual([
        { x: 5 },
        { x: 6 }
      ])
    })

    test("insert irrelevant rows", async () => {
      const txn = vdb.transaction()
      await txn.addRow("t1", { number: 1 })
      await txn.addRow("t2", { number: 6 })
      await txn.commit()
  
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
      const pk = await txn.addRow("t1", { number: 1 })
      await txn.removeRow("t1", 1)
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

      expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 1 }])
      expect(mockTransaction.removeRow.mock.calls[0]).toEqual(["t1", 1])

      expect(() => vdb.transaction()).toThrow()
    })

    test("shortcuts updating inserted row", async () => {
      const txn = vdb.transaction()
      const pk = await txn.addRow("t1", { number: 1 })
      await txn.updateRow("t1", pk, { number: 2 })
      await txn.commit()

      expect(vdb.mutations).toEqual([{
        type: "add",
        table: "t1",
        primaryKey: pk,
        values: { number: 2 }
      }])
    })

    test("shortcuts updating row", async () => {
      const txn = vdb.transaction()
      await txn.updateRow("t1", 1, { number: 2 })
      await txn.updateRow("t1", 1, { number: 3 })
      await txn.commit()

      expect(vdb.mutations).toEqual([{
        type: "update",
        table: "t1",
        primaryKey: 1,
        updates: { number: 3 }
      }])
    })

    test("shortcuts removing inserted row", async () => {
      const txn = vdb.transaction()
      const pk = await txn.addRow("t1", { number: 1 })
      await txn.removeRow("t1", pk)
      await txn.commit()

      expect(vdb.mutations).toEqual([])
    })


    test("substitutes temporary primary keys", async () => {
      // Create changes
      const txn = vdb.transaction()
      const pk = await txn.addRow("t1", { number: 1 })
      await txn.updateRow("t1", pk, { number: 2 })
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

      expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 2 }])
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