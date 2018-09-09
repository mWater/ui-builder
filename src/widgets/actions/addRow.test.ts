import { AddRowAction, AddRowActionDef } from "./addRow";
import { Action } from "../actions";


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

  const varExprs = new AddRowAction(ad).getContextVarExprs("cv2")
  expect(varExprs).toEqual([{ type: "literal", valueType: "number", value: 456 }])
})