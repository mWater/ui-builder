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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mockDatabase_1 = __importDefault(require("../__fixtures__/mockDatabase"));
var schema_1 = __importDefault(require("../__fixtures__/schema"));
var evalContextVarExpr_1 = require("./evalContextVarExpr");
var database;
var outerRenderProps;
var schema = schema_1.default();
beforeEach(function () {
    var db = mockDatabase_1.default();
    db.query = jest.fn(function () { return Promise.resolve([{ value: "abc" }]); });
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
        registerForValidation: function () { return function () { }; },
        T: function (str) { return str; }
    };
});
test("exprs are computed for new row variables", function () { return __awaiter(void 0, void 0, void 0, function () {
    var contextVar, value, contextVarExpr, result, queryOptions, expectedQueryOptions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" };
                value = "1234";
                contextVarExpr = { type: "field", table: "t1", column: "c1" };
                return [4 /*yield*/, evalContextVarExpr_1.evalContextVarExpr({
                        contextVar: contextVar,
                        contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
                    })
                    // Query should have been made
                ];
            case 1:
                result = _a.sent();
                queryOptions = database.query.mock.calls[0][0];
                expectedQueryOptions = {
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
                return [2 /*return*/];
        }
    });
}); });
test("exprs are null for null row variables", function () { return __awaiter(void 0, void 0, void 0, function () {
    var contextVar, value, contextVarExpr, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" };
                value = null;
                contextVarExpr = { type: "field", table: "t1", column: "c1" };
                return [4 /*yield*/, evalContextVarExpr_1.evalContextVarExpr({
                        contextVar: contextVar,
                        contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
                    })
                    // Query should not have been made
                ];
            case 1:
                result = _a.sent();
                // Query should not have been made
                expect(database.query.mock.calls.length).toBe(0);
                // Should get the value as null
                expect(result).toBeNull();
                return [2 /*return*/];
        }
    });
}); });
test("exprs are computed for rowset variable", function () { return __awaiter(void 0, void 0, void 0, function () {
    var contextVar, value, contextVarExpr, result, queryOptions, expectedQueryOptions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" };
                value = { type: "literal", valueType: "boolean", value: false };
                contextVarExpr = { type: "op", table: "t1", op: "count", exprs: [] };
                return [4 /*yield*/, evalContextVarExpr_1.evalContextVarExpr({
                        contextVar: contextVar,
                        contextVarValue: value, expr: contextVarExpr, ctx: outerRenderProps
                    })
                    // Query should have been made
                ];
            case 1:
                result = _a.sent();
                queryOptions = database.query.mock.calls[0][0];
                expectedQueryOptions = {
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
                return [2 /*return*/];
        }
    });
}); });
test("exprs are computed for literals", function () { return __awaiter(void 0, void 0, void 0, function () {
    var expr, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                expr = { type: "literal", valueType: "text", value: "abc" };
                return [4 /*yield*/, evalContextVarExpr_1.evalContextVarExpr({
                        contextVar: null, contextVarValue: null, expr: expr, ctx: outerRenderProps
                    })
                    // Should get the value
                ];
            case 1:
                result = _a.sent();
                // Should get the value
                expect(result).toBe("abc");
                return [2 /*return*/];
        }
    });
}); });
