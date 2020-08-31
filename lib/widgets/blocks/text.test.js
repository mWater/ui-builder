"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var text_1 = require("./text");
var enzyme_1 = require("enzyme");
var schema_1 = __importDefault(require("../../__fixtures__/schema"));
var d3Format = __importStar(require("d3-format"));
var tbd = {
    type: "text",
    id: "t1",
    style: "p",
    text: { _base: "en", en: "A {0} B" },
    embeddedExprs: [
        { contextVarId: "cv1", expr: { type: "field", table: "t1", column: "number" }, format: "," }
    ]
};
var tb = new text_1.TextBlock(tbd);
var cv1 = { id: "cv1", table: "t1", type: "row", name: "Cv1" };
test("gets expressions", function () {
    expect(tb.getContextVarExprs(cv1)).toEqual([
        { type: "field", table: "t1", column: "number" }
    ]);
});
test("renders with format", function () {
    var props = {
        getContextVarExprValue: jest.fn(),
        contextVars: [],
        schema: schema_1.default(),
        formatLocale: d3Format
    };
    props.getContextVarExprValue.mockReturnValue(1234);
    var inst = enzyme_1.shallow(tb.renderInstance(props));
    expect(props.getContextVarExprValue.mock.calls[0]).toEqual(["cv1", { type: "field", table: "t1", column: "number" }]);
    expect(inst.text()).toBe("A 1,234 B");
});
