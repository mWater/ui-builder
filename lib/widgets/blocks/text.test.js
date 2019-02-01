"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("./text");
const enzyme_1 = require("enzyme");
const schema_1 = __importDefault(require("../../__fixtures__/schema"));
const tbd = {
    type: "text",
    id: "t1",
    style: "p",
    text: { _base: "en", en: "A {0} B" },
    embeddedExprs: [
        { contextVarId: "cv1", expr: { type: "field", table: "t1", column: "number" }, format: "," }
    ]
};
const tb = new text_1.TextBlock(tbd);
const cv1 = { id: "cv1", table: "t1", type: "row", name: "Cv1" };
test("gets expressions", () => {
    expect(tb.getContextVarExprs(cv1)).toEqual([
        { type: "field", table: "t1", column: "number" }
    ]);
});
test("renders with format", () => {
    const props = {
        getContextVarExprValue: jest.fn(),
        contextVars: [],
        schema: schema_1.default()
    };
    props.getContextVarExprValue.mockReturnValue(1234);
    const inst = enzyme_1.shallow(tb.renderInstance(props));
    expect(props.getContextVarExprValue.mock.calls[0]).toEqual(["cv1", { type: "field", table: "t1", column: "number" }]);
    expect(inst.text()).toBe("A 1,234 B");
});
//# sourceMappingURL=text.test.js.map