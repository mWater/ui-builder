import { AddRowAction, AddRowActionDef } from "./addRow"
import { ContextVar } from "../blocks"
import VirtualDatabase, { AddMutation } from "../../database/VirtualDatabase"
import { Database, NullDatabase } from "../../database/Database"
import simpleSchema from "../../__fixtures__/schema"
import mockInstanceCtx from "../../__fixtures__/mockInstanceCtx"

test("performs non-literal action", async () => {
  const ad: AddRowActionDef = {
    type: "addRow",
    table: "t1",
    columnValues: {
      number: {
        contextVarId: null,
        expr: { type: "literal", valueType: "number", value: 123 }
      }
    }
  }

  const schema = simpleSchema()
  const database = new VirtualDatabase(new NullDatabase(), schema, "en")

  const action = new AddRowAction(ad)
  const instanceCtx = {
    ...mockInstanceCtx(),
    database: database,
    contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" } as ContextVar],
    contextVarValues: { cv1: "123" },
    getContextVarExprValue: () => {
      throw new Error("Not implemented")
    }
  }

  await action.performAction(instanceCtx)

  expect(database.mutations.length).toBe(1)
  expect((database.mutations[0] as AddMutation).values).toEqual({
    number: 123
  })
})

test("performs literal action", async () => {
  const ad: AddRowActionDef = {
    type: "addRow",
    table: "t1",
    columnValues: {
      number: {
        contextVarId: null,
        expr: { type: "literal", valueType: "number", value: 123 }
      }
    }
  }

  const schema = simpleSchema()
  const database = new VirtualDatabase(new NullDatabase(), schema, "en")

  const instanceCtx = {
    ...mockInstanceCtx(),
    database: database,
    contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" } as ContextVar],
    contextVarValues: { cv1: "123" },
    getContextVarExprValue: () => {
      throw new Error("Not implemented")
    },
    getFilters: () => []
  }

  const action = new AddRowAction(ad)
  await action.performAction(instanceCtx)

  expect(database.mutations.length).toBe(1)
  expect((database.mutations[0] as AddMutation).values).toEqual({
    number: 123
  })
})
