import { AddRowAction } from "./addRow";
import VirtualDatabase from "../../database/VirtualDatabase";
import { NullDatabase } from "../../database/Database";
import simpleSchema from "../../__fixtures__/schema";
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
test("performs action", async () => {
    const ad = {
        type: "addRow",
        table: "t1",
        columnValues: {
            "number": {
                contextVarId: null,
                expr: { type: "literal", valueType: "number", value: 123 }
            }
        }
    };
    const schema = simpleSchema();
    const database = new VirtualDatabase(new NullDatabase(), schema, "en");
    const action = new AddRowAction(ad);
    await action.performAction({
        locale: "en",
        database: database,
        pageStack: {},
        contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }],
        contextVarValues: { cv1: "123" },
        getContextVarExprValue: (cvid, expr) => 123
    });
    expect(database.mutations.length).toBe(1);
    expect(database.mutations[0].values).toEqual({
        number: 123
    });
});
//# sourceMappingURL=addRow.test.js.map