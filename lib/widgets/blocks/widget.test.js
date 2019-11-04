"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var widget_1 = require("./widget");
var BlockFactory_1 = __importDefault(require("../BlockFactory"));
var immer_1 = __importDefault(require("immer"));
var innerBlockDef = {
    type: "expression",
    id: "exp1",
    contextVarId: "b1",
    expr: { type: "field", table: "t1", column: "text" },
    format: null
};
var widgetDef = {
    id: "w1",
    name: "W1",
    description: "",
    blockDef: innerBlockDef,
    contextVars: [
        { id: "b1", name: "B1", type: "row", table: "t1" },
    ],
    contextVarPreviewValues: {}
};
var blockDef = {
    id: "a",
    type: "widget",
    widgetId: "w1",
    contextVarMap: {
        b1: "a1"
    }
};
var widgetLibrary = {
    widgets: {
        "w1": widgetDef
    }
};
var contextVars = [
    { id: "a1", name: "A1", type: "text" },
    { id: "a2", name: "A2", type: "text" }
];
describe("getContextVarExprs", function () {
    test("gathers from inner widget and maps", function () {
        var createBlock = new BlockFactory_1.default().createBlock;
        var widgetBlock = new widget_1.WidgetBlock(blockDef);
        // Get expressions
        var exprs = widgetBlock.getContextVarExprs(contextVars[0], { widgetLibrary: widgetLibrary, createBlock: createBlock });
        expect(exprs).toEqual([
            { type: "field", table: "t1", column: "text" }
        ]);
    });
    test("gathers from inner widget and maps variables too", function () {
        // Alter widget block to have variable in expression
        var widgetLibrary2 = immer_1.default(widgetLibrary, function (draft) {
            (draft.widgets.w1.blockDef).expr = { type: "variable", variableId: "b1" };
        });
        var createBlock = new BlockFactory_1.default().createBlock;
        var widgetBlock = new widget_1.WidgetBlock(blockDef);
        // Get expressions
        var exprs = widgetBlock.getContextVarExprs(contextVars[0], { widgetLibrary: widgetLibrary2, createBlock: createBlock });
        expect(exprs).toEqual([
            { type: "variable", variableId: "a1" }
        ]);
    });
});
describe("getInitialFilters", function () {
    test("translates", function () {
        var createBlock = jest.fn();
        var widgetBlock = new widget_1.WidgetBlock(blockDef);
        var innerBlock = {
            getInitialFilters: jest.fn()
        };
        // Return inner block
        createBlock.mockReset();
        createBlock.mockReturnValueOnce(innerBlock);
        innerBlock.getInitialFilters.mockReturnValue([{ id: "f1", memo: "m", expr: {} }]);
        var filters = widgetBlock.getInitialFilters("a1", { widgetLibrary: widgetLibrary, contextVars: [], createBlock: createBlock });
        expect(filters).toEqual([{ id: "f1", memo: "m", expr: {} }]);
        expect(innerBlock.getInitialFilters.mock.calls[0][0]).toBe("b1");
    });
});
describe("renderInstance", function () {
    var instanceCtx;
    var innerInstanceCtx;
    // Render instance
    beforeEach(function () {
        var createBlock = jest.fn();
        var widgetBlock = new widget_1.WidgetBlock(blockDef);
        var innerBlock = {
            renderInstance: jest.fn()
        };
        // Return inner block
        createBlock.mockReturnValueOnce(innerBlock);
        instanceCtx = {
            createBlock: createBlock,
            locale: "en",
            database: {},
            schema: {},
            dataSource: {},
            contextVars: contextVars,
            actionLibrary: {},
            widgetLibrary: { widgets: { w1: widgetDef } },
            pageStack: {},
            contextVarValues: { a1: "a1" },
            getContextVarExprValue: jest.fn(),
            onSelectContextVar: jest.fn(),
            setFilter: jest.fn(),
            getFilters: jest.fn(),
            renderChildBlock: jest.fn(),
            registerForValidation: function () { return function () { }; }
        };
        widgetBlock.renderInstance(instanceCtx);
        // Get inner instanceCtx
        innerInstanceCtx = innerBlock.renderInstance.mock.calls[0][0];
    });
    test("contextVars", function () {
        expect(innerInstanceCtx.contextVars).toEqual(widgetDef.contextVars);
    });
    test("contextVarValues maps", function () {
        expect(innerInstanceCtx.contextVarValues.b1).toBe("a1");
    });
    test("getContextVarExprValue maps variables", function () {
        var outerGetContextVarExprValue = jest.fn();
        instanceCtx.getContextVarExprValue = outerGetContextVarExprValue;
        outerGetContextVarExprValue.mockReturnValue("abc");
        var innerExpr = { type: "variable", variableId: "b1" };
        expect(innerInstanceCtx.getContextVarExprValue("b1", innerExpr)).toBe("abc");
        expect(outerGetContextVarExprValue.mock.calls[0][0]).toBe("a1");
        expect(outerGetContextVarExprValue.mock.calls[0][1]).toEqual({ type: "variable", variableId: "a1" });
    });
    test("onSelectContextVar maps", function () {
        innerInstanceCtx.onSelectContextVar("b1", "pk");
        expect(instanceCtx.onSelectContextVar.mock.calls[0]).toEqual(["a1", "pk"]);
    });
    test("setFilter maps", function () {
        innerInstanceCtx.setFilter("b1", {});
        expect(instanceCtx.setFilter.mock.calls[0]).toEqual(["a1", {}]);
    });
});
describe("mapObjectTree", function () {
    test("deep mapping", function () {
        var obj = {
            x: 1,
            y: [{ foo: 1 }]
        };
        expect(widget_1.mapObjectTree(obj, function (input) {
            return (input.foo) ? { foo: 2 } : input;
        })).toEqual({
            x: 1,
            y: [{ foo: 2 }]
        });
    });
});
