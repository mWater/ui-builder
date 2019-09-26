import { AddRowAction, AddRowActionDef } from "./addRow";
import { ContextVar } from "../blocks";
import VirtualDatabase, { AddMutation } from "../../database/VirtualDatabase";
import { NullDatabase } from "../../database/Database";
import simpleSchema from "../../__fixtures__/schema";
import { PageStack } from "../../PageStack";
import { Expr, Schema } from "mwater-expressions";


test("gets context var exprs", () => {
  const ad : AddRowActionDef = {
    type: "addRow",
    table: "abc",
    columnValues: {
      "a": { 
        contextVarId: "cv1",
        expr: { type: "literal", valueType: "number", value: 123 }
      },
      "b": { 
        contextVarId: "cv2",
        expr: { type: "literal", valueType: "number", value: 456 }
      }
    }
  }

  const varExprs = new AddRowAction(ad).getContextVarExprs({ id: "cv2" } as ContextVar)
  expect(varExprs).toEqual([{ type: "literal", valueType: "number", value: 456 }])
})


test("performs non-literal action", async () => {
  const ad : AddRowActionDef = {
    type: "addRow",
    table: "t1",
    columnValues: {
      "number": { 
        contextVarId: "cv1",
        expr: { type: "literal", valueType: "number", value: 123 }
      }
    }
  }

  const schema = simpleSchema()
  const database = new VirtualDatabase(new NullDatabase(), schema, "en")

  const action = new AddRowAction(ad)
  await action.performAction({
    locale: "en",
    database: database,
    schema: {} as Schema,
    pageStack: {} as PageStack,
    contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }],
    contextVarValues: { cv1: "123" },
    getContextVarExprValue: () => 123
  })

  expect(database.mutations.length).toBe(1)
  expect((database.mutations[0] as AddMutation).values).toEqual({
    number: 123
  })
})

test("performs literal action", async () => {
  const ad : AddRowActionDef = {
    type: "addRow",
    table: "t1",
    columnValues: {
      "number": { 
        contextVarId: null,
        expr: { type: "literal", valueType: "number", value: 123 }
      }
    }
  }

  const schema = simpleSchema()
  const database = new VirtualDatabase(new NullDatabase(), schema, "en")

  const action = new AddRowAction(ad)
  await action.performAction({
    locale: "en",
    database: database,
    schema: {} as Schema,
    pageStack: {} as PageStack,
    contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }],
    contextVarValues: { cv1: "123" },
    getContextVarExprValue: () => { throw new Error("Not used") }
  })

  expect(database.mutations.length).toBe(1)
  expect((database.mutations[0] as AddMutation).values).toEqual({
    number: 123
  })
})