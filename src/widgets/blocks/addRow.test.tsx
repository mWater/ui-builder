import { BlockDef } from "../blocks";
import simpleSchema from "../../__fixtures__/schema";
import { DataSource } from 'mwater-expressions';
import { PageStack } from '../../PageStack';
import { mount } from "enzyme";
import React from "react";
import VirtualDatabase from "../../database/VirtualDatabase";
import { NullDatabase } from "../../database/Database";
import BlockFactory from "../BlockFactory";
import { ActionLibrary } from "../ActionLibrary";
import { AddRowBlockDef, AddRowBlock } from "./addRow";
import { InstanceCtx } from "../../contexts";
import { TextboxBlockDef } from "./controls/textbox";

// Outer context vars
const schema = simpleSchema()

const createBlock = new BlockFactory().createBlock

let rips: InstanceCtx
let database: VirtualDatabase

beforeEach(() => {
  database = new VirtualDatabase(new NullDatabase(), schema, "en")

  // Create render instance props
  rips = {
    createBlock: createBlock,
    contextVars: [],
    database: database,
    getContextVarExprValue: jest.fn(),
    actionLibrary: {} as ActionLibrary,
    pageStack: {} as PageStack,
    contextVarValues: { },
    getFilters: jest.fn(),
    setFilter: jest.fn(),
    locale: "en",
    onSelectContextVar: jest.fn(),
    schema: schema,
    dataSource: {} as DataSource,
    renderChildBlock: (props: InstanceCtx, childBlockDef: BlockDef | null) => {
      if (childBlockDef) {
        const childBlock = createBlock(childBlockDef)
        return childBlock.renderInstance(props)
      }
      return <div/>
    },
    widgetLibrary: { widgets: {} },
    registerForValidation: () => { return () => {} },
    T: (str) => str
  }
})

const pause = () => new Promise((resolve) => setImmediate(resolve))

// Create add row block with textbox of added value
const addRowBlockDef: AddRowBlockDef = {
  id: "ar1",
  type: "addRow",
  table: "t1",
  columnValues: {
    text: { contextVarId: null, expr: { type: "literal", valueType: "text", value: "abc" }}
  },
  content: { 
    type: "textbox", 
    id: "tb1",
    rowContextVarId: "ar1",
    column: "text",
    required: false
  } as TextboxBlockDef
}

test("save writes to database", async () => {
  (rips.getContextVarExprValue as jest.Mock).mockReturnValue("abc")
  
  const addRowBlock = new AddRowBlock(addRowBlockDef);

  const inst = mount(addRowBlock.renderInstance(rips));

  // Wait for load
  await pause()
  inst.update()

  // Expect added row
  expect(database.mutations[0].type).toBe("add")

  expect(inst.find("input").prop("value")).toBe("abc")
})

test("reuses existing", async () => {
  const rips2: InstanceCtx = { ...rips, 
    contextVars: [{ id: "existing", type: "row", table: "t1", name: "Existing" }],
    contextVarValues: { existing: "123" }
  }

  const addRowBlock = new AddRowBlock({ 
    ...addRowBlockDef, 
    existingContextVarId: "existing",
    content: { 
      type: "textbox", 
      id: "tb1",
      rowContextVarId: "existing",
      column: "text",
      required: false
    } as TextboxBlockDef
  })

  const inst = mount(addRowBlock.renderInstance(rips2))

  // Wait for load
  await pause()
  inst.update()

  // Expect no added row
  expect(database.mutations.length).toBe(0)
})

test("does not reuse non-existing existing", async () => {
  const rips2: InstanceCtx = { ...rips, 
    contextVars: [{ id: "existing", type: "row", table: "t1", name: "Existing" }],
    contextVarValues: { existing: null }
  }

  const addRowBlock = new AddRowBlock({ 
    ...addRowBlockDef, 
    existingContextVarId: "existing",
    content: { 
      type: "textbox", 
      id: "tb1",
      rowContextVarId: "existing",
      column: "text",
      required: false
    } as TextboxBlockDef
  })

  const inst = mount(addRowBlock.renderInstance(rips2))

  // Wait for load
  await pause()
  inst.update()

  // Expect added row
  expect(database.mutations[0].type).toBe("add")
})