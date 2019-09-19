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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var enzyme_1 = require("enzyme");
var React = __importStar(require("react"));
var queryTable_1 = require("./queryTable");
var QueryTableBlockInstance_1 = __importDefault(require("./QueryTableBlockInstance"));
var schema_1 = __importDefault(require("../../../__fixtures__/schema"));
var BlockFactory_1 = __importDefault(require("../../BlockFactory"));
var mockDatabase_1 = __importDefault(require("../../../__fixtures__/mockDatabase"));
// Outer context vars
var rowsetCV = { id: "cv1", type: "rowset", name: "", table: "t1" };
var contextVars = [rowsetCV];
var schema = schema_1.default();
var exprText = { type: "field", table: "t1", column: "text" };
var qtbdSingle = {
    id: "123",
    type: "queryTable",
    mode: "singleRow",
    headers: [],
    contents: [{ type: "expression", id: "re1", contextVarId: "123_row", expr: exprText }],
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null,
    rowClickAction: null
};
var createBlock = new BlockFactory_1.default().createBlock;
var qtbSingle = new queryTable_1.QueryTableBlock(qtbdSingle, createBlock);
var rips;
var database;
beforeEach(function () {
    database = mockDatabase_1.default();
    rips = {
        contextVars: contextVars,
        database: database,
        getContextVarExprValue: jest.fn(),
        actionLibrary: {},
        pageStack: {},
        // Simple filter
        contextVarValues: { cv1: { type: "field", table: "t1", column: "boolean" } },
        getFilters: function () { return []; },
        setFilter: jest.fn(),
        locale: "en",
        onSelectContextVar: jest.fn(),
        schema: schema,
        dataSource: {},
        renderChildBlock: jest.fn(),
        widgetLibrary: { widgets: {} },
        registerForValidation: function () { return function () { }; }
    };
});
// single:
test("creates query", function () {
    database.query.mockResolvedValue([]);
    var inst = enzyme_1.mount(React.createElement(QueryTableBlockInstance_1.default, { block: qtbSingle, renderInstanceProps: rips }));
    var queryOptions = database.query.mock.calls[0][0];
    expect(queryOptions).toEqual({
        select: {
            id: { type: "id", table: "t1" },
            e0: exprText
        },
        from: "t1",
        where: {
            type: "op",
            op: "and",
            table: "t1",
            exprs: [{ type: "field", table: "t1", column: "boolean" }],
        },
        orderBy: [{ expr: { type: "id", table: "t1" }, dir: "asc" }],
        limit: 10
    });
});
test("adds filters, orderBy and where", function () {
    database.query.mockResolvedValue([]);
    rips.getFilters = function () { return [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: true } }]; };
    var qtb = createBlock(__assign(__assign({}, qtbdSingle), { where: { type: "literal", valueType: "boolean", value: false }, orderBy: [
            { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
        ] }));
    var inst = enzyme_1.mount(React.createElement(QueryTableBlockInstance_1.default, { block: qtb, renderInstanceProps: rips }));
    var queryOptions = database.query.mock.calls[0][0];
    expect(queryOptions).toEqual({
        select: {
            id: { type: "id", table: "t1" },
            e0: exprText
        },
        from: "t1",
        where: {
            type: "op",
            op: "and",
            table: "t1",
            exprs: [
                { type: "field", table: "t1", column: "boolean" },
                { type: "literal", valueType: "boolean", value: true },
                { type: "literal", valueType: "boolean", value: false }
            ]
        },
        orderBy: [
            { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" },
            { expr: { type: "id", table: "t1" }, dir: "asc" }
        ],
        limit: 10
    });
});
test("injects context variables", function () {
    database.query.mockResolvedValue([]);
    var inst = enzyme_1.mount(React.createElement(QueryTableBlockInstance_1.default, { block: qtbSingle, renderInstanceProps: rips }));
    inst.setState({ rows: [{ id: "r1", e0: "abc" }] });
    var rowRips = inst.instance().createRowRenderInstanceProps(0);
    expect(rowRips.contextVarValues["123_row"]).toBe("r1");
    expect(rowRips.getContextVarExprValue("123_row", exprText)).toBe("abc");
});
// TODO performs action on row click
