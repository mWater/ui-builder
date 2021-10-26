import { QueryRepeatBlockDef, QueryRepeatBlock } from "./queryRepeat"
import { ContextVar } from "../../blocks"
import simpleSchema from "../../../__fixtures__/schema"
import BlockFactory from "../../BlockFactory"
import { InstanceCtx } from "../../../contexts"

// Outer context vars
const rowsetCV: ContextVar = { id: "cv1", type: "rowset", name: "CV1", table: "t1" }
const contextVars: ContextVar[] = [rowsetCV]

const qrbd: QueryRepeatBlockDef = {
  id: "123",
  type: "queryRepeat",
  separator: "solid_line",
  content: null,
  rowsetContextVarId: "cv1",
  orderBy: null,
  limit: 10,
  where: null
}

const createBlock = new BlockFactory().createBlock

const qrb = new QueryRepeatBlock(qrbd)

const schema = simpleSchema()

test("gets row cv", () => {
  expect(qrb.createRowContextVar(rowsetCV)).toEqual({
    id: "123_row",
    name: "Table row of CV1",
    type: "row",
    table: "t1"
  })
})

test("gets row cv value", () => {
  expect(qrb.getRowContextVarValue({ id: "123" }, [], schema, rowsetCV, contextVars)).toEqual("123")
})

test("gets row expressions", () => {
  // Create single expression in contents
  const expr = { type: "field", table: "t1", column: "text" }
  const qrbd2 = { ...qrbd, content: { type: "expression", id: "re1", contextVarId: "123_row", expr: expr } }
  const qrb = new QueryRepeatBlock(qrbd2)
  expect(qrb.getRowExprs(contextVars, { createBlock: createBlock } as InstanceCtx)).toEqual([expr])
})
