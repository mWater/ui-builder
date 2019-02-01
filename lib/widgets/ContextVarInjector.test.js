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
var ContextVarInjector_1 = __importDefault(require("./ContextVarInjector"));
var enzyme_1 = require("enzyme");
var React = __importStar(require("react"));
var mockDatabase_1 = __importDefault(require("../__fixtures__/mockDatabase"));
var schema_1 = __importDefault(require("../__fixtures__/schema"));
var database;
var outerRenderProps;
var schema = schema_1.default();
beforeEach(function () {
    var db = mockDatabase_1.default();
    db.query = jest.fn(function () { return Promise.resolve([{ e0: "abc" }]); });
    database = db;
    outerRenderProps = {
        locale: "en",
        database: database,
        schema: {},
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
    };
});
test("inner contains extra context vars", function () {
    var contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" };
    var value = "1234";
    var contextVarExprs = [
        { type: "field", table: "t1", column: "c1" }
    ];
    var innerRenderProps;
    var x = enzyme_1.shallow((React.createElement(ContextVarInjector_1.default, { renderInstanceProps: outerRenderProps, schema: schema, injectedContextVar: contextVar, value: value, database: database, contextVarExprs: contextVarExprs }, function (renderInstanceProps) {
        innerRenderProps = renderInstanceProps;
        return React.createElement("div", null);
    })));
    // Inner props should have new context variable
    expect(innerRenderProps.contextVars).toEqual([contextVar]);
});
test("exprs are computed for row variables", function (done) {
    var contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" };
    var value = "1234";
    var contextVarExprs = [
        { type: "field", table: "t1", column: "c1" }
    ];
    var innerRenderProps;
    var x = enzyme_1.shallow((React.createElement(ContextVarInjector_1.default, { renderInstanceProps: outerRenderProps, schema: schema, database: database, injectedContextVar: contextVar, value: value, contextVarExprs: contextVarExprs }, function (renderInstanceProps) {
        innerRenderProps = renderInstanceProps;
        return React.createElement("div", null);
    })));
    // Query should have been made
    var queryOptions = database.query.mock.calls[0][0];
    var expectedQueryOptions = {
        select: {
            e0: contextVarExprs[0]
        },
        from: "t1",
        where: {
            type: "op",
            op: "=",
            table: "t1",
            exprs: [{ type: "id", table: "t1" }, { type: "literal", valueType: "id", idTable: "t1", value: "1234" }]
        }
    };
    setImmediate(function () {
        // Should perform the query
        expect(queryOptions).toEqual(expectedQueryOptions);
        // Should get the value
        expect(innerRenderProps.getContextVarExprValue(contextVar.id, contextVarExprs[0])).toBe("abc");
        done();
    });
});
test("exprs are null for null row variables", function (done) {
    var contextVar = { id: "cv1", name: "cv1", type: "row", table: "t1" };
    var value = null;
    var contextVarExprs = [
        { type: "field", table: "t1", column: "c1" }
    ];
    var innerRenderProps;
    var x = enzyme_1.shallow((React.createElement(ContextVarInjector_1.default, { renderInstanceProps: outerRenderProps, schema: schema, database: database, injectedContextVar: contextVar, value: value, contextVarExprs: contextVarExprs }, function (renderInstanceProps) {
        innerRenderProps = renderInstanceProps;
        return React.createElement("div", null);
    })));
    setImmediate(function () {
        // Query should not have been made
        var queryOptions = expect(database.query.mock.calls.length).toBe(0);
        // Should get the value as undefined
        expect(innerRenderProps.getContextVarExprValue(contextVar.id, contextVarExprs[0])).toBeUndefined();
        done();
    });
});
test("exprs are computed for rowset variables, excluding non-aggregates", function (done) {
    var contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" };
    var value = { type: "literal", valueType: "boolean", value: false };
    var contextVarExprs = [
        { type: "field", table: "t1", column: "text" },
        { type: "op", table: "t1", op: "count", exprs: [] }
    ];
    var innerRenderProps;
    var x = enzyme_1.shallow((React.createElement(ContextVarInjector_1.default, { renderInstanceProps: outerRenderProps, injectedContextVar: contextVar, schema: schema, database: database, value: value, contextVarExprs: contextVarExprs }, function (renderInstanceProps) {
        innerRenderProps = renderInstanceProps;
        return React.createElement("div", null);
    })));
    // Query should have been made
    var queryOptions = database.query.mock.calls[0][0];
    var expectedQueryOptions = {
        select: {
            e0: contextVarExprs[1]
        },
        from: "t1",
        where: value,
        limit: 1
    };
    setImmediate(function () {
        // Should perform the query
        expect(queryOptions).toEqual(expectedQueryOptions);
        // Should get the value
        expect(innerRenderProps.getContextVarExprValue(contextVar.id, contextVarExprs[1])).toBe("abc");
        done();
    });
});
test("filters are applied for rowset variables", function (done) {
    var contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" };
    var value = { type: "literal", valueType: "boolean", value: false };
    var contextVarExprs = [
        { type: "op", table: "t1", op: "count", exprs: [] }
    ];
    var initialFilters = [
        { id: "f1", expr: { type: "field", table: "t1", column: "c2" } }
    ];
    var innerRenderProps;
    var innerIsLoading = false;
    // Need mount as shallow rendering fails to call lifecycle componentDidUpdate
    var x = enzyme_1.mount((React.createElement(ContextVarInjector_1.default, { renderInstanceProps: outerRenderProps, injectedContextVar: contextVar, value: value, schema: schema, database: database, contextVarExprs: contextVarExprs, initialFilters: initialFilters }, function (renderInstanceProps, isLoading) {
        innerRenderProps = renderInstanceProps;
        innerIsLoading = isLoading;
        return React.createElement("div", null);
    })));
    // Query should have been made
    var queryOptions = database.query.mock.calls[0][0];
    var expectedQueryOptions = {
        select: {
            e0: contextVarExprs[0]
        },
        from: "t1",
        where: { type: "op", table: "t1", op: "and", exprs: [value, initialFilters[0].expr] },
        limit: 1
    };
    // TODO test properly isLoading
    // expect(innerIsLoading).toBe(true)
    setImmediate(function () {
        // Should perform the query
        expect(queryOptions).toEqual(expectedQueryOptions);
        expect(innerRenderProps.getFilters("cv1")).toEqual(initialFilters);
        // Should set filter (replacing with same id)
        var newFilter = { id: "f1", expr: { type: "field", table: "t1", column: "c3" } };
        innerRenderProps.setFilter("cv1", newFilter);
        setTimeout(function () {
            var expectedQueryOptions2 = {
                select: {
                    e0: contextVarExprs[0]
                },
                from: "t1",
                where: { type: "op", table: "t1", op: "and", exprs: [value, newFilter.expr] },
                limit: 1
            };
            // Should perform the query
            expect(innerRenderProps.getFilters("cv1")).toEqual([newFilter]);
            var queryOptions2 = database.query.mock.calls[1][0];
            expect(queryOptions2).toEqual(expectedQueryOptions2);
            done();
        }, 10);
    });
});
test("null filters are ignored for rowset variables", function (done) {
    var contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" };
    var value = { type: "literal", valueType: "boolean", value: false };
    var contextVarExprs = [
        { type: "op", table: "t1", op: "count", exprs: [] }
    ];
    var initialFilters = [
        { id: "f1", expr: null }
    ];
    var innerRenderProps;
    var innerIsLoading = false;
    // Need mount as shallow rendering fails to call lifecycle componentDidUpdate
    var x = enzyme_1.mount((React.createElement(ContextVarInjector_1.default, { renderInstanceProps: outerRenderProps, injectedContextVar: contextVar, value: value, schema: schema, database: database, contextVarExprs: contextVarExprs, initialFilters: initialFilters }, function (renderInstanceProps, isLoading) {
        innerRenderProps = renderInstanceProps;
        innerIsLoading = isLoading;
        return React.createElement("div", null);
    })));
    // Query should have been made
    var queryOptions = database.query.mock.calls[0][0];
    var expectedQueryOptions = {
        select: {
            e0: contextVarExprs[0]
        },
        from: "t1",
        where: { type: "op", table: "t1", op: "and", exprs: [value] },
        limit: 1
    };
    // TODO test properly isLoading
    // expect(innerIsLoading).toBe(true)
    setImmediate(function () {
        // Should perform the query
        expect(queryOptions).toEqual(expectedQueryOptions);
        expect(innerRenderProps.getFilters("cv1")).toEqual(initialFilters);
        // Should set filter (replacing with same id)
        var newFilter = { id: "f1", expr: { type: "field", table: "t1", column: "c3" } };
        innerRenderProps.setFilter("cv1", newFilter);
        setTimeout(function () {
            var expectedQueryOptions2 = {
                select: {
                    e0: contextVarExprs[0]
                },
                from: "t1",
                where: { type: "op", table: "t1", op: "and", exprs: [value, newFilter.expr] },
                limit: 1
            };
            // Should perform the query
            expect(innerRenderProps.getFilters("cv1")).toEqual([newFilter]);
            var queryOptions2 = database.query.mock.calls[1][0];
            expect(queryOptions2).toEqual(expectedQueryOptions2);
            done();
        }, 10);
    });
});
test("filters are applied for rowset variables to variable value", function (done) {
    var contextVar = { id: "cv1", name: "cv1", type: "rowset", table: "t1" };
    var value = { type: "literal", valueType: "boolean", value: false };
    var contextVarExprs = [
        { type: "op", table: "t1", op: "count", exprs: [] }
    ];
    var initialFilters = [
        { id: "f1", expr: { type: "field", table: "t1", column: "c2" } }
    ];
    var innerRenderProps;
    var innerIsLoading = false;
    // Need mount as shallow rendering fails to call lifecycle componentDidUpdate
    var x = enzyme_1.mount((React.createElement(ContextVarInjector_1.default, { renderInstanceProps: outerRenderProps, injectedContextVar: contextVar, value: value, schema: schema, database: database, contextVarExprs: contextVarExprs, initialFilters: initialFilters }, function (renderInstanceProps, isLoading) {
        innerRenderProps = renderInstanceProps;
        innerIsLoading = isLoading;
        return React.createElement("div", null);
    })));
    setImmediate(function () {
        expect(innerRenderProps.contextVarValues.cv1).toEqual({
            type: "op", op: "and", table: "t1", exprs: [
                value, initialFilters[0].expr
            ]
        });
        done();
    });
});
//# sourceMappingURL=ContextVarInjector.test.js.map