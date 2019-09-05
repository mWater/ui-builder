"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var QueryCompiler_1 = require("./QueryCompiler");
var schema_1 = __importDefault(require("../__fixtures__/schema"));
var variables = [{ id: "varnumber", name: { _base: "en", en: "Varnumber" }, type: "number" }];
var variableValues = { varnumber: 123 };
var schema = schema_1.default();
var compiler = new QueryCompiler_1.QueryCompiler(schema, variables, variableValues);
test("compiles simple query", function () {
    var options = {
        select: { x: { type: "field", table: "t1", column: "text" } },
        from: "t1",
    };
    var _a = compiler.compileQuery(options), jsonql = _a.jsonql, rowMapper = _a.rowMapper;
    expect(jsonql).toEqual({
        type: "query",
        selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_0" }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [],
        orderBy: []
    });
    expect(rowMapper({ c_0: "abc", o_0: "xyz" })).toEqual({ x: "abc" });
});
test("compiles distinct query", function () {
    var options = {
        select: { x: { type: "field", table: "t1", column: "text" } },
        distinct: true,
        from: "t1",
    };
    var _a = compiler.compileQuery(options), jsonql = _a.jsonql, rowMapper = _a.rowMapper;
    expect(jsonql).toEqual({
        type: "query",
        selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_0" }
        ],
        distinct: true,
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [],
        orderBy: []
    });
    expect(rowMapper({ c_0: "abc", o_0: "xyz" })).toEqual({ x: "abc" });
});
test("compiles aggregated, limited query", function () {
    var options = {
        select: {
            x: { type: "field", table: "t1", column: "text" },
            y: { type: "op", table: "t1", op: "count", exprs: [] }
        },
        from: "t1",
        limit: 10
    };
    var _a = compiler.compileQuery(options), jsonql = _a.jsonql, rowMapper = _a.rowMapper;
    expect(jsonql).toEqual({
        type: "query",
        selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_0" },
            { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "c_1" }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [1],
        orderBy: [],
        limit: 10
    });
    expect(rowMapper({ c_0: "abc", c_1: "xyz" })).toEqual({ x: "abc", y: "xyz" });
});
test("compiles ordered where query", function () {
    var options = {
        select: { x: { type: "field", table: "t1", column: "text" } },
        from: "t1",
        where: { type: "field", table: "t1", column: "boolean" },
        orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }]
    };
    var _a = compiler.compileQuery(options), jsonql = _a.jsonql, rowMapper = _a.rowMapper;
    expect(jsonql).toEqual({
        type: "query",
        selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c_0" },
            { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "o_0" }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        where: { type: "field", tableAlias: "main", column: "boolean" },
        groupBy: [],
        orderBy: [{ ordinal: 2, direction: "desc", nulls: "last" }]
    });
});
test("compiles variable query", function () {
    var options = {
        select: { x: { type: "variable", variableId: "varnumber" } },
        from: "t1",
    };
    var _a = compiler.compileQuery(options), jsonql = _a.jsonql, rowMapper = _a.rowMapper;
    expect(jsonql).toEqual({
        type: "query",
        selects: [
            { type: "select", expr: { type: "literal", value: 123 }, alias: "c_0" }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [],
        orderBy: []
    });
    expect(rowMapper({ c_0: "abc", o_0: "xyz" })).toEqual({ x: "abc" });
});
