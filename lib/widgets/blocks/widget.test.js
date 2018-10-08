import { WidgetBlock } from './widget';
const createBlock = jest.fn();
const widgetDef = {
    id: "w1",
    name: "W1",
    description: "",
    blockDef: {},
    contextVars: [
        { id: "b1", name: "B1", type: "rowset" },
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
const contextVars = [
    { id: "a1", name: "A1", type: "text" },
    { id: "a2", name: "A2", type: "text" }
];
// TODO: getContextVarExprs(contextVarId: string) should gather from children
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
        const widgetBlock = new WidgetBlock(blockDef, createBlock);
        const innerBlock = {
            renderInstance: jest.fn()
        };
        // Return inner block
        createBlock.mockReset();
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
            getContextVarValue: (id) => id,
            getContextVarExprValue: (id) => id,
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
    test("getContextVarValue maps", () => {
        expect(innerRenderInstanceProps.getContextVarValue("b1")).toBe("a1");
    });
    test("getContextVarExprValue maps", () => {
        expect(innerRenderInstanceProps.getContextVarExprValue("b1", {})).toBe("a1");
    });
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