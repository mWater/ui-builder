"use strict";
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
const enzyme_1 = require("enzyme");
const React = __importStar(require("react"));
const queryTable_1 = require("./queryTable");
const QueryTableBlockInstance_1 = __importDefault(require("./QueryTableBlockInstance"));
const schema_1 = __importDefault(require("../../../__fixtures__/schema"));
const BlockFactory_1 = __importDefault(require("../../BlockFactory"));
const mockDatabase_1 = __importDefault(require("../../../__fixtures__/mockDatabase"));
// Outer context vars
const rowsetCV = { id: "cv1", type: "rowset", name: "", table: "t1" };
const contextVars = [rowsetCV];
const schema = schema_1.default();
const exprText = { type: "field", table: "t1", column: "text" };
const qtbdSingle = {
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
const createBlock = new BlockFactory_1.default().createBlock;
const qtbSingle = new queryTable_1.QueryTableBlock(qtbdSingle, createBlock);
let rips;
let database;
beforeEach(() => {
    database = mockDatabase_1.default();
    rips = {
        contextVars: contextVars,
        database: database,
        getContextVarExprValue: jest.fn(),
        actionLibrary: {},
        pageStack: {},
        // Simple filter
        contextVarValues: { cv1: { type: "field", table: "t1", column: "boolean" } },
        getFilters: () => [],
        setFilter: jest.fn(),
        locale: "en",
        onSelectContextVar: jest.fn(),
        schema: schema,
        dataSource: {},
        renderChildBlock: jest.fn(),
        widgetLibrary: { widgets: {} }
    };
});
// single:
test("creates query", () => {
    database.query.mockResolvedValue([]);
    const inst = enzyme_1.mount(React.createElement(QueryTableBlockInstance_1.default, { block: qtbSingle, renderInstanceProps: rips }));
    const queryOptions = database.query.mock.calls[0][0];
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
        limit: 10
    });
});
test("adds filters, orderBy and where", () => {
    database.query.mockResolvedValue([]);
    rips.getFilters = () => [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: true } }];
    const qtb = createBlock(Object.assign({}, qtbdSingle, { where: { type: "literal", valueType: "boolean", value: false }, orderBy: [
            { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
        ] }));
    const inst = enzyme_1.mount(React.createElement(QueryTableBlockInstance_1.default, { block: qtb, renderInstanceProps: rips }));
    const queryOptions = database.query.mock.calls[0][0];
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
            { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
        ],
        limit: 10
    });
});
test("injects context variables", () => {
    database.query.mockResolvedValue([]);
    const inst = enzyme_1.mount(React.createElement(QueryTableBlockInstance_1.default, { block: qtbSingle, renderInstanceProps: rips }));
    inst.setState({ rows: [{ id: "r1", e0: "abc" }] });
    const rowRips = inst.instance().createRowRenderInstanceProps(0);
    expect(rowRips.contextVarValues["123_row"]).toBe("r1");
    expect(rowRips.getContextVarExprValue("123_row", exprText)).toBe("abc");
});
// TODO performs action on row click
//# sourceMappingURL=QueryTableBlockInstance.test.js.map