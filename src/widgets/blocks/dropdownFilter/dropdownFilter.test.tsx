import simpleSchema from "../../../__fixtures__/schema";
import { shallow } from "enzyme";
import { DropdownFilterBlock, DropdownFilterBlockDef } from "./dropdownFilter";
import { RenderInstanceProps } from "../../blocks";

describe("enum filter", () => {
  const dropdownFilterBlockDef: DropdownFilterBlockDef = {
    id: "ddf1",
    filterExpr: { type: "field", table: "t1", column: "enum" },
    placeholder: null,
    rowsetContextVarId: "cv1",
    type: "dropdownFilter"
  }
  const dropdownFilterBlock = new DropdownFilterBlock(dropdownFilterBlockDef)

  test("sets filter on change", () => {
    const props = {
      schema: simpleSchema(),
      getFilters: jest.fn(),
      setFilter: jest.fn(),
      locale: "en", 
      contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
    }
  
    props.getFilters.mockReturnValue([])
  
    const inst = shallow(dropdownFilterBlock.renderInstance((props as any) as RenderInstanceProps))
  
    // Set an option
    inst.prop("onChange")({ id: "op1", name: { _base: "en", en: "Op1" }})
  
    expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
      id: "ddf1",
      expr: { type: "op", table: "t1", op: "=", exprs: [
        { type: "field", table: "t1", column: "enum" },      
        { type: "literal", valueType: "enum", value: "op1" },      
      ]},
      memo: "op1"
    }])
  })
  
  test("clears filter on null change", () => {
    const props = {
      schema: simpleSchema(),
      getFilters: jest.fn(),
      setFilter: jest.fn(),
      locale: "en", 
      contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
    }
  
    props.getFilters.mockReturnValue([])
  
    const inst = shallow(dropdownFilterBlock.renderInstance((props as any) as RenderInstanceProps))
  
    // Set an option
    inst.prop("onChange")(null)
  
    expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
      id: "ddf1",
      expr: null,
      memo: null
    }])
  })
})


describe("text filter", () => {
  const dropdownFilterBlockDef: DropdownFilterBlockDef = {
    id: "ddf1",
    filterExpr: { type: "field", table: "t1", column: "text" },
    placeholder: null,
    rowsetContextVarId: "cv1",
    type: "dropdownFilter"
  }
  const dropdownFilterBlock = new DropdownFilterBlock(dropdownFilterBlockDef)

  test("sets filter on change", () => {
    const props = {
      schema: simpleSchema(),
      getFilters: jest.fn(),
      setFilter: jest.fn(),
      locale: "en", 
      contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
    }
  
    props.getFilters.mockReturnValue([])
  
    const inst = shallow(dropdownFilterBlock.renderInstance((props as any) as RenderInstanceProps))
  
    // Set an option
    inst.prop("onChange")({ value: "op1", label: "op1" })
  
    expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
      id: "ddf1",
      expr: { type: "op", table: "t1", op: "=", exprs: [
        { type: "field", table: "t1", column: "text" },      
        { type: "literal", valueType: "text", value: "op1" },      
      ]},
      memo: "op1"
    }])
  })
  
  test("clears filter on null change", () => {
    const props = {
      schema: simpleSchema(),
      getFilters: jest.fn(),
      setFilter: jest.fn(),
      locale: "en", 
      contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
    }
  
    props.getFilters.mockReturnValue([])
  
    const inst = shallow(dropdownFilterBlock.renderInstance((props as any) as RenderInstanceProps))
  
    // Set an option
    inst.prop("onChange")(null)
  
    expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
      id: "ddf1",
      expr: null,
      memo: null
    }])
  })
})
