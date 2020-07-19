"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
