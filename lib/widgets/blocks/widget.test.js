import { WidgetBlock } from './widget';
import BlockFactory from '../BlockFactory';
const widgetBlockDef = {
    type: "expression",
    id: "exp1",
    contextVarId: "b1",
    expr: { type: "field", table: "t1", column: "text" },
    format: null
};
const widgetDef = {
    id: "w1",
    name: "W1",
    description: "",
    blockDef: widgetBlockDef,
    contextVars: [
        { id: "b1", name: "B1", type: "row", table: "t1" },
    ],
    contextVarPreviewValues: {}
};
const blockDef = {
    id: "a",
    type: "widget",
    widgetId: "w1",
    contextVarMap: {
        b1: "a1"
    },
    contextVarPreviewValues: {}
};
const widgetLibrary = {
    widgets: {
        "w1": widgetDef
    }
};
const contextVars = [
    { id: "a1", name: "A1", type: "text" },
    { id: "a2", name: "A2", type: "text" }
];
describe("getContextVarExprs", () => {
    test("gathers from inner widget and maps", () => {
        const createBlock = new BlockFactory().createBlock;
        const widgetBlock = new WidgetBlock(blockDef, createBlock);
        // Get expressions
        const exprs = widgetBlock.getContextVarExprs(contextVars[0], widgetLibrary);
        expect(exprs).toEqual([
            { type: "field", table: "t1", column: "text" }
        ]);
    });
    // TODO
    // test("gathers from inner widget and maps variables too", () => {
    //   // Alter widget block to have variable in expression
    //   const widgetLibrary2 = produce(widgetLibrary, (draft) => {
    //     draft.widgets.w1!.blockDef!.expr = { type: "variable", variableId: "b1" }
    //   })
    //   const createBlock = new BlockFactory().createBlock
    //   const widgetBlock = new WidgetBlock(blockDef, createBlock)
    //   // Get expressions
    //   const exprs = widgetBlock.getContextVarExprs(contextVars[0], widgetLibrary2)
    //   expect(exprs).toEqual([
    //     { type: "variable", variableId: "a1" }
    //   ])
    // })
});
// describe("getInitialFilters", () => {
//   test("translates", async () => {
//     const widgetBlock = new WidgetBlock(blockDef, createBlock, lookupWidget)
//     const innerBlock = {
//       getInitialFilters: jest.fn()
//     }
//     // Return inner block
//     createBlock.mockReset()
//     createBlock.mockReturnValueOnce(innerBlock)
//     innerBlock.getInitialFilters.mockResolvedValueOnce([{ id: "f1", memo: "m", expr: {} as Expr }])
//     const filters = await widgetBlock.getInitialFilters("a1")
//     expect(filters).toEqual([{ id: "f1", memo: "m", expr: {} as Expr }])
//     expect(innerBlock.getInitialFilters.mock.calls[0][0]).toBe("b1")
//   })
// })
describe("renderInstance", () => {
    let renderInstanceProps;
    let innerRenderInstanceProps;
    // Render instance
    beforeEach(() => {
        const createBlock = jest.fn();
        const widgetBlock = new WidgetBlock(blockDef, createBlock);
        const innerBlock = {
            renderInstance: jest.fn()
        };
        // Return inner block
        createBlock.mockReturnValueOnce(innerBlock);
        renderInstanceProps = {
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
            renderChildBlock: jest.fn()
        };
        widgetBlock.renderInstance(renderInstanceProps);
        // Get inner renderInstanceProps
        innerRenderInstanceProps = innerBlock.renderInstance.mock.calls[0][0];
    });
    test("contextVars", () => {
        expect(innerRenderInstanceProps.contextVars).toEqual(widgetDef.contextVars);
    });
    test("contextVarValues maps", () => {
        expect(innerRenderInstanceProps.contextVarValues.b1).toBe("a1");
    });
    // TODO
    // test("getContextVarExprValue maps", () => {
    //   expect(innerRenderInstanceProps.getContextVarExprValue("b1", {} as any)).toBe("a1")
    // })
    test("onSelectContextVar maps", () => {
        innerRenderInstanceProps.onSelectContextVar("b1", "pk");
        expect(renderInstanceProps.onSelectContextVar.mock.calls[0]).toEqual(["a1", "pk"]);
    });
    test("setFilter maps", () => {
        innerRenderInstanceProps.setFilter("b1", {});
        expect(renderInstanceProps.setFilter.mock.calls[0]).toEqual(["a1", {}]);
    });
});
//# sourceMappingURL=widget.test.js.map