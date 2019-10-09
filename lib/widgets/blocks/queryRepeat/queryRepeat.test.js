"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var queryRepeat_1 = require("./queryRepeat");
var schema_1 = __importDefault(require("../../../__fixtures__/schema"));
var BlockFactory_1 = __importDefault(require("../../BlockFactory"));
// Outer context vars
var rowsetCV = { id: "cv1", type: "rowset", name: "", table: "t1" };
var contextVars = [rowsetCV];
var qrbd = {
    id: "123",
    type: "queryRepeat",
    separator: "solid_line",
    content: null,
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null
};
var createBlock = new BlockFactory_1.default().createBlock;
var qrb = new queryRepeat_1.QueryRepeatBlock(qrbd, createBlock);
var schema = schema_1.default();
test("gets row cv", function () {
    expect(qrb.createRowContextVar(rowsetCV)).toEqual({
        id: "123_row",
        name: "Table row",
        type: "row",
        table: "t1"
    });
});
test("gets row cv value", function () {
    expect(qrb.getRowContextVarValue({ id: "123" }, [], schema, rowsetCV, contextVars)).toEqual("123");
});
test("gets row expressions", function () {
    // Create single expression in contents
    var expr = { type: "field", table: "t1", column: "text" };
    var qrbd2 = __assign(__assign({}, qrbd), { content: { type: "expression", id: "re1", contextVarId: "123_row", expr: expr } });
    var qrb = new queryRepeat_1.QueryRepeatBlock(qrbd2, createBlock);
    expect(qrb.getRowExprs(contextVars, {}, {})).toEqual([expr]);
});
