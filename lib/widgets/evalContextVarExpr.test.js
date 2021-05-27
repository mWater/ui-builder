"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mockDatabase_1 = __importDefault(require("../__fixtures__/mockDatabase"));
const schema_1 = __importDefault(require("../__fixtures__/schema"));
const evalContextVarExpr_1 = require("./evalContextVarExpr");
let database;
let outerRenderProps;
const schema = schema_1.default();
beforeEach(() => {
    const db = mockDatabase_1.default();
    db.query = jest.fn(() => Promise.resolve([{ value: "abc" }]));
    database = db;
    outerRenderProps = {
        locale: "en",
        database: database,
        schema: schema,
        dataSource: {},
        contextVars: [],
        actionLibrary: {},
        widgetLibrary: { widgets: {} },
        pageStack: {},
        contextVarValues: {},
        getContextVarExprValue: jest.fn(),
        onSelectContextVar: jest.fn(),
        setFilter: jest.fn(),
        getFilters: jest.fn(),
        renderChildBlock: jest.fn(),
        createBlock: jest.fn(),
        registerForValidation: () => () => { },
        T: (str) => str
    };
});
test("exprs are computed for new row variables", () => __awaiter(void 0, void 0, void 0, function* () {
    const contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" };
    const value = "1234";
    const contextVarExpr = { type: "field", table: "t1", column: "c1" };
    const result = yield evalContextVarExpr_1.evalContextVarExpr({
        contextVar, contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
    });
    // Query should have been made
    const queryOptions = database.query.mock.calls[0][0];
    const expectedQueryOptions = {
        select: {
            value: contextVarExpr
        },
        from: "t1",
        where: {
            type: "op",
            op: "=",
            table: "t1",
            exprs: [{ type: "id", table: "t1" }, { type: "literal", valueType: "id", idTable: "t1", value: "1234" }]
        }
    };
    // Should perform the query
    expect(queryOptions).toEqual(expectedQueryOptions);
    // Should get the value
    expect(result).toBe("abc");
}));
test("exprs are null for null row variables", () => __awaiter(void 0, void 0, void 0, function* () {
    const contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" };
    const value = null;
    const contextVarExpr = { type: "field", table: "t1", column: "c1" };
    const result = yield evalContextVarExpr_1.evalContextVarExpr({
        contextVar, contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
    });
    // Query should not have been made
    expect(database.query.mock.calls.length).toBe(0);
    // Should get the value as null
    expect(result).toBeNull();
}));
test("exprs are computed for rowset variable", () => __awaiter(void 0, void 0, void 0, function* () {
    const contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" };
    const value = { type: "literal", valueType: "boolean", value: false };
    const contextVarExpr = { type: "op", table: "t1", op: "count", exprs: [] };
    const result = yield evalContextVarExpr_1.evalContextVarExpr({
        contextVar, contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
    });
    // Query should have been made
    const queryOptions = database.query.mock.calls[0][0];
    const expectedQueryOptions = {
        select: {
            value: contextVarExpr
        },
        distinct: false,
        from: "t1",
        where: value,
        limit: 2
    };
    // Should perform the query
    expect(queryOptions).toEqual(expectedQueryOptions);
    // Should get the value
    expect(result).toBe("abc");
}));
test("exprs are computed for literals", () => __awaiter(void 0, void 0, void 0, function* () {
    const expr = { type: "literal", valueType: "text", value: "abc" };
    const result = yield evalContextVarExpr_1.evalContextVarExpr({
        contextVar: null, contextVarValue: null, expr: expr, ctx: outerRenderProps
    });
    // Should get the value
    expect(result).toBe("abc");
}));
