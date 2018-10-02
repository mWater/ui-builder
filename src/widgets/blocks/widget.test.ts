import { WidgetBlock, WidgetBlockDef } from './widget'
import { ContextVar, RenderInstanceProps, BlockDef, Filter } from '../blocks';
import { WidgetDef } from '../widgets';
import { Database } from '../../Database';
import { Expr, Schema } from 'mwater-expressions';
import { ActionLibrary } from '../ActionLibrary';
import { PageStack } from '../../PageStack';
import { WidgetLibrary } from '../../designer/widgetLibrary';

const createBlock = jest.fn()
const widgetDef : WidgetDef= {
  id: "w1",
  name: "W1",
  description: "",
  blockDef: {} as BlockDef,
  contextVars: [
    { id: "b1", name: "B1", type: "rowset" },
  ],
  contextVarPreviewValues: {}
}

const blockDef : WidgetBlockDef = {
  id: "a",
  type: "widget",
  widgetId: "w1",
  contextVarMap: {
    b1: "a1"
  },
  contextVarPreviewValues: {}
}

const contextVars : ContextVar[] = [
  { id: "a1", name: "A1", type: "text" },
  { id: "a2", name: "A2", type: "text" }
]

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
  let renderInstanceProps : RenderInstanceProps
  let innerRenderInstanceProps : RenderInstanceProps
 
  // Render instance
  beforeEach(() => {
    const widgetBlock = new WidgetBlock(blockDef, createBlock)

    const innerBlock = {
      renderInstance: jest.fn()
    }
  
    // Return inner block
    createBlock.mockReset()
    createBlock.mockReturnValueOnce(innerBlock)
  
    renderInstanceProps = {
      locale: "en",
      database: {} as Database,
      schema: {} as Schema,
      contextVars: contextVars, 
      actionLibrary: {} as ActionLibrary,
      widgetLibrary: { widgets: { w1: widgetDef }},
      pageStack: {} as PageStack,
      getContextVarValue: (id) => id,
      getContextVarExprValue: (id) => id,
      onSelectContextVar: jest.fn(),
      setFilter: jest.fn(),
      getFilters: jest.fn(),
      renderChildBlock: jest.fn()
    }
    widgetBlock.renderInstance(renderInstanceProps)

    // Get inner renderInstanceProps
    innerRenderInstanceProps = innerBlock.renderInstance.mock.calls[0][0] as RenderInstanceProps
  })

  test("contextVars", () => {
    expect(innerRenderInstanceProps.contextVars).toEqual(widgetDef.contextVars)
  })

  test("getContextVarValue maps", () => {
    expect(innerRenderInstanceProps.getContextVarValue("b1")).toBe("a1")
  })
  
  test("getContextVarExprValue maps", () => {
    expect(innerRenderInstanceProps.getContextVarExprValue("b1", {} as any)).toBe("a1")
  })

  test("onSelectContextVar maps", () => {
    innerRenderInstanceProps.onSelectContextVar("b1", "pk")
    expect((renderInstanceProps.onSelectContextVar as jest.Mock).mock.calls[0]).toEqual(["a1", "pk"])
  })

  test("setFilter maps", () => {
    innerRenderInstanceProps.setFilter("b1", {} as Filter)
    expect((renderInstanceProps.setFilter as jest.Mock).mock.calls[0]).toEqual(["a1", {}])
  })
})