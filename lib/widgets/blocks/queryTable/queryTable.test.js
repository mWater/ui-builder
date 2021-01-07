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
var queryTable_1 = require("./queryTable");
var schema_1 = __importDefault(require("../../../__fixtures__/schema"));
var BlockFactory_1 = __importDefault(require("../../BlockFactory"));
// Outer context vars
var rowsetCV = { id: "cv1", type: "rowset", name: "CV1", table: "t1" };
var contextVars = [rowsetCV];
var qtbdSingle = {
    id: "123",
    type: "queryTable",
    mode: "singleRow",
    headers: [],
    contents: [],
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null,
    rowClickAction: null
};
var createBlock = new BlockFactory_1.default().createBlock;
var qtbSingle = new queryTable_1.QueryTableBlock(qtbdSingle);
var qtbdMultiple = {
    id: "123",
    type: "queryTable",
    mode: "multiRow",
    headers: [],
    contents: [],
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null,
    rowClickAction: null
};
var qtbMultiple = new queryTable_1.QueryTableBlock(qtbdMultiple);
var schema = schema_1.default();
test("gets single row cv", function () {
    expect(qtbSingle.createRowContextVar(rowsetCV)).toEqual({
        id: "123_row",
        name: "Table row of CV1",
        type: "row",
        table: "t1"
    });
});
test("gets multiple row cv", function () {
    expect(qtbMultiple.createRowContextVar(rowsetCV)).toEqual({
        id: "123_rowset",
        name: "Table row rowset of CV1",
        type: "rowset",
        table: "t1"
    });
});
test("gets single row cv value", function () {
    expect(qtbSingle.getRowContextVarValue({ id: "123" }, [], schema, rowsetCV, contextVars, null)).toEqual("123");
});
test("gets multiple row cv value", function () {
    // One non-aggregate, one aggregate
    var exprs = [
        { type: "field", table: "t1", column: "text" },
        { type: "op", table: "t1", op: "count", exprs: [] }
    ];
    expect(qtbMultiple.getRowContextVarValue({ e0: "xyz", e1: 4 }, exprs, schema, rowsetCV, contextVars, { type: "literal", valueType: "boolean", value: false })).toEqual({
        type: "op",
        op: "and",
        table: "t1",
        exprs: [
            { type: "literal", valueType: "boolean", value: false },
            { type: "op", table: "t1", op: "=", exprs: [exprs[0], { type: "literal", valueType: "text", value: "xyz" }] }
        ]
    });
});
test("gets row expressions", function () {
    // Create single expression in contents
    var expr = { type: "field", table: "t1", column: "text" };
    var qtbd = __assign(__assign({}, qtbdSingle), { contents: [{ type: "expression", id: "re1", contextVarId: "123_row", expr: expr }] });
    var qtb = new queryTable_1.QueryTableBlock(qtbd);
    expect(qtb.getRowExprs(contextVars, { createBlock: createBlock })).toEqual([expr]);
});
