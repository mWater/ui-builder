import { WidgetBlock, WidgetBlockDef, mapObjectTree } from './widget'
import { ContextVar, RenderInstanceProps, Filter } from '../blocks';
import { WidgetDef } from '../widgets';
import { Database } from '../../database/Database';
import { Schema, DataSource, Expr } from 'mwater-expressions';
import { ActionLibrary } from '../ActionLibrary';
import { PageStack } from '../../PageStack';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import BlockFactory from '../BlockFactory';
import { ExpressionBlockDef } from './expression';
import produce from 'immer';

const innerBlockDef: ExpressionBlockDef = { 
  type: "expression", 
  id: "exp1", 
  contextVarId: "b1", 
  expr: { type: "field", table: "t1", column: "text" }, 
  format: null 
}

const widgetDef : WidgetDef = {
  id: "w1",
  name: "W1",
  description: "",
  blockDef: innerBlockDef,
  contextVars: [
    { id: "b1", name: "B1", type: "row", table: "t1" },
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

const widgetLibrary: WidgetLibrary = {
  widgets: {
    "w1": widgetDef
  }
}

const contextVars : ContextVar[] = [
  { id: "a1", name: "A1", type: "text" },
  { id: "a2", name: "A2", type: "text" }
]

describe("getContextVarExprs", () => {
  test("gathers from inner widget and maps", () => {
    const createBlock = new BlockFactory().createBlock
    const widgetBlock = new WidgetBlock(blockDef, createBlock)

    // Get expressions
    const exprs = widgetBlock.getContextVarExprs(contextVars[0], widgetLibrary, {} as ActionLibrary)

    expect(exprs).toEqual([
      { type: "field", table: "t1", column: "text" }
    ])
  })

  test("gathers from inner widget and maps variables too", () => {
    // Alter widget block to have variable in expression
    const widgetLibrary2 = produce(widgetLibrary, (draft) => {
      draft.widgets.w1!.blockDef!.expr = { type: "variable", variableId: "b1" }
    })

    const createBlock = new BlockFactory().createBlock
    const widgetBlock = new WidgetBlock(blockDef, createBlock)

    // Get expressions
    const exprs = widgetBlock.getContextVarExprs(contextVars[0], widgetLibrary2, {} as ActionLibrary)

    expect(exprs).toEqual([
      { type: "variable", variableId: "a1" }
    ])
  })
})

describe("getInitialFilters", () => {
  test("translates", () => {
    const createBlock = jest.fn()
    const widgetBlock = new WidgetBlock(blockDef, createBlock)

    const innerBlock = {
      getInitialFilters: jest.fn()
    }
  
    // Return inner block
    createBlock.mockReset()
    createBlock.mockReturnValueOnce(innerBlock)
    innerBlock.getInitialFilters.mockReturnValue([{ id: "f1", memo: "m", expr: {} as Expr }])

    const filters = widgetBlock.getInitialFilters("a1", widgetLibrary)
    expect(filters).toEqual([{ id: "f1", memo: "m", expr: {} as Expr }])
    expect(innerBlock.getInitialFilters.mock.calls[0][0]).toBe("b1")
  })
})

describe("renderInstance", () => {
  let renderInstanceProps : RenderInstanceProps
  let innerRenderInstanceProps : RenderInstanceProps
 
  // Render instance
  beforeEach(() => {
    const createBlock = jest.fn()
    const widgetBlock = new WidgetBlock(blockDef, createBlock)

    const innerBlock = {
      renderInstance: jest.fn()
    }
  
    // Return inner block
    createBlock.mockReturnValueOnce(innerBlock)
  
    renderInstanceProps = {
      locale: "en",
      database: {} as Database,
      schema: {} as Schema,
      dataSource: {} as DataSource,
      contextVars: contextVars, 
      actionLibrary: {} as ActionLibrary,
      widgetLibrary: { widgets: { w1: widgetDef }},
      pageStack: {} as PageStack,
      contextVarValues: { a1: "a1" },
      getContextVarExprValue: jest.fn(),
      onSelectContextVar: jest.fn(),
      setFilter: jest.fn(),
      getFilters: jest.fn(),
      renderChildBlock: jest.fn(),
      registerForValidation: () => { return () => {} }      
    }
    widgetBlock.renderInstance(renderInstanceProps)

    // Get inner renderInstanceProps
    innerRenderInstanceProps = innerBlock.renderInstance.mock.calls[0][0] as RenderInstanceProps
  })

  test("contextVars", () => {
    expect(innerRenderInstanceProps.contextVars).toEqual(contextVars.concat(widgetDef.contextVars))
  })

  test("contextVarValues maps", () => {
    expect(innerRenderInstanceProps.contextVarValues.b1).toBe("a1")
  })
  
  test("getContextVarExprValue maps variables", () => {
    const outerGetContextVarExprValue = jest.fn()
    renderInstanceProps.getContextVarExprValue = outerGetContextVarExprValue

    outerGetContextVarExprValue.mockReturnValue("abc")
    const innerExpr: Expr = { type: "variable", variableId: "b1" }
    expect(innerRenderInstanceProps.getContextVarExprValue("b1", innerExpr)).toBe("abc")
    expect(outerGetContextVarExprValue.mock.calls[0][0]).toBe("a1")
    expect(outerGetContextVarExprValue.mock.calls[0][1]).toEqual({ type: "variable", variableId: "a1" })
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


describe("mapObjectTree", () => {
  test("deep mapping", () => {
    const obj = {
      x: 1,
      y: [{ foo: 1 }]
    }

    expect(mapObjectTree(obj, (input) => {
      return (input.foo) ? { foo: 2 } : input
    })).toEqual({
      x: 1,
      y: [{ foo: 2 }]
    })
  })
})