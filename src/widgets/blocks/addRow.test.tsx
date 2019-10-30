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
    registerForValidation: () => { return () => {} }
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
  const addRowBlock = new AddRowBlock(addRowBlockDef);

  const inst = mount(addRowBlock.renderInstance(rips))

  // Wait for load
  await pause()
  inst.update()

  // Expect added row
  expect(database.mutations[0].type).toBe("add")

  expect(inst.find("input").prop("value")).toBe("abc")
})