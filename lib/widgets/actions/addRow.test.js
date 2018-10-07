import { AddRowAction } from "./addRow";
test("gets context var exprs", () => {
    const ad = {
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
    };
    const varExprs = new AddRowAction(ad).getContextVarExprs({ id: "cv2" });
    expect(varExprs).toEqual([{ type: "literal", valueType: "number", value: 456 }]);
});
//# sourceMappingURL=addRow.test.js.map