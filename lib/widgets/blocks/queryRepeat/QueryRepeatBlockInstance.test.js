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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enzyme_1 = require("enzyme");
const React = __importStar(require("react"));
const queryRepeat_1 = require("./queryRepeat");
const QueryRepeatBlockInstance_1 = __importDefault(require("./QueryRepeatBlockInstance"));
const schema_1 = __importDefault(require("../../../__fixtures__/schema"));
const BlockFactory_1 = __importDefault(require("../../BlockFactory"));
const mockDatabase_1 = __importDefault(require("../../../__fixtures__/mockDatabase"));
// Outer context vars
const rowsetCV = { id: "cv1", type: "rowset", name: "", table: "t1" };
const contextVars = [rowsetCV];
const schema = (0, schema_1.default)();
const exprText = { type: "field", table: "t1", column: "text" };
const qrbd = {
    id: "123",
    type: "queryRepeat",
    separator: "solid_line",
    content: { type: "expression", id: "re1", contextVarId: "123_row", expr: exprText },
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null
};
const createBlock = new BlockFactory_1.default().createBlock;
const qtb = new queryRepeat_1.QueryRepeatBlock(qrbd);
let rips;
let database;
beforeEach(() => {
    database = (0, mockDatabase_1.default)();
    rips = {
        createBlock: createBlock,
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
        widgetLibrary: { widgets: {} },
        registerForValidation: () => () => { },
        T: (str) => str
    };
});
test("creates query", () => {
    ;
    database.query.mockResolvedValue([]);
    const inst = (0, enzyme_1.mount)(React.createElement(QueryRepeatBlockInstance_1.default, { block: qtb, instanceCtx: rips }));
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
            exprs: [{ type: "field", table: "t1", column: "boolean" }]
        },
        orderBy: [{ expr: { type: "id", table: "t1" }, dir: "asc" }],
        limit: 10
    });
});
test("adds filters, orderBy and where", () => {
    ;
    database.query.mockResolvedValue([]);
    rips.getFilters = () => [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: true } }];
    const qtb = createBlock(Object.assign(Object.assign({}, qrbd), { where: { type: "literal", valueType: "boolean", value: false }, orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }] }));
    const inst = (0, enzyme_1.mount)(React.createElement(QueryRepeatBlockInstance_1.default, { block: qtb, instanceCtx: rips }));
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
            { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" },
            { expr: { type: "id", table: "t1" }, dir: "asc" }
        ],
        limit: 10
    });
});
test("injects context variables", () => {
    ;
    database.query.mockResolvedValue([]);
    const inst = (0, enzyme_1.mount)(React.createElement(QueryRepeatBlockInstance_1.default, { block: qtb, instanceCtx: rips }));
    inst.setState({ rows: [{ id: "r1", e0: "abc" }] });
    const rowRips = inst.instance().createRowInstanceCtx(0);
    expect(rowRips.contextVarValues["123_row"]).toBe("r1");
    expect(rowRips.getContextVarExprValue("123_row", exprText)).toBe("abc");
});
// TODO performs action on row click
