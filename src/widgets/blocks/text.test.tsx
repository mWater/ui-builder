import { TextBlockDef, TextBlock } from "./text"
import { shallow } from "enzyme"
import { ContextVar } from "../blocks"
import simpleSchema from "../../__fixtures__/schema"
import { InstanceCtx } from "../../contexts"
import * as d3Format from "d3-format"

const tbd: TextBlockDef = {
  type: "text",
  id: "t1",
  style: "p",
  text: { _base: "en", en: "A {0} B" },
  embeddedExprs: [{ contextVarId: "cv1", expr: { type: "field", table: "t1", column: "number" }, format: "," }]
}

const tb = new TextBlock(tbd)

const cv1: ContextVar = { id: "cv1", table: "t1", type: "row", name: "Cv1" }

test("gets expressions", () => {
  expect(tb.getContextVarExprs(cv1)).toEqual([{ type: "field", table: "t1", column: "number" }])
})

test("renders with format", () => {
  const props = {
    getContextVarExprValue: jest.fn(),
    contextVars: [],
    schema: simpleSchema(),
    formatLocale: d3Format
  }

  props.getContextVarExprValue.mockReturnValue(1234)

  const inst = shallow(tb.renderInstance(props as any as InstanceCtx))

  expect(props.getContextVarExprValue.mock.calls[0]).toEqual(["cv1", { type: "field", table: "t1", column: "number" }])
  expect(inst.text()).toBe("A 1,234 B")
})
