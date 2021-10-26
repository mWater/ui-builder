import { getWherePrimaryKey } from "./database/Database"

test("finds filters by primary key only", () => {
  expect(getWherePrimaryKey(null)).toBeNull()

  expect(getWherePrimaryKey({ type: "field", table: "t1", column: "x" })).toBeNull()

  expect(getWherePrimaryKey({ type: "id", table: "t1" })).toBeNull()

  expect(
    getWherePrimaryKey({
      type: "op",
      op: "=",
      table: "t1",
      exprs: [
        { type: "id", table: "t1" },
        { type: "literal", valueType: "id", value: 123 }
      ]
    })
  ).toBe(123)

  // Also wrapped in and
  expect(
    getWherePrimaryKey({
      type: "op",
      op: "and",
      table: "t1",
      exprs: [
        {
          type: "op",
          op: "=",
          table: "t1",
          exprs: [
            { type: "id", table: "t1" },
            { type: "literal", valueType: "id", value: 123 }
          ]
        }
      ]
    })
  ).toBe(123)

  expect(getWherePrimaryKey(null)).toBeNull()
})
