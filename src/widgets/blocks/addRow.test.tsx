import { RenderInstanceProps, ContextVar, BlockDef } from "../blocks";
import simpleSchema from "../../__fixtures__/schema";
import { SaveCancelBlockDef, SaveCancelBlock } from "./saveCancel";
import { DataSource } from 'mwater-expressions';
import { PageStack } from '../../PageStack';
import { mount } from "enzyme";
import React from "react";
import VirtualDatabase from "../../database/VirtualDatabase";
import { NullDatabase, Database } from "../../database/Database";
import BlockFactory from "../BlockFactory";
import { ActionLibrary } from "../ActionLibrary";
import { AddRowBlockDef, AddRowBlock } from "./addRow";

// Outer context vars
const rowCV = { id: "cv1", type: "rowset", name: "", table: "t1" }
const contextVars: ContextVar[] = [rowCV]

const schema = simpleSchema()

const createBlock = new BlockFactory().createBlock

let rips: RenderInstanceProps
let database: VirtualDatabase

beforeEach(() => {
  database = new VirtualDatabase(new NullDatabase(), schema, "en")

  // Create render instance props
  rips = {
   contextVars: contextVars,
   database: database,
   getContextVarExprValue: jest.fn(),
   actionLibrary: {} as ActionLibrary,
   pageStack: {} as PageStack,
   contextVarValues: { cv1: null },
   getFilters: jest.fn(),
   setFilter: jest.fn(),
   locale: "en",
   onSelectContextVar: jest.fn(),
   schema: schema,
   dataSource: {} as DataSource,
   renderChildBlock: (props: RenderInstanceProps, childBlockDef: BlockDef | null, instanceId?: string) => {
     if (childBlockDef) {
       const childBlock = createBlock(childBlockDef)
       return childBlock.renderInstance(props)
     }
     return <div/>
   },
   widgetLibrary: { widgets: {} }
 }
})

const pause = () => new Promise((resolve, reject) => setImmediate(resolve))

// Create add row block with textbox of added value
const addRowBlockDef: AddRowBlockDef = {
  id: "ar1",
  type: "addRow",
  table: "t1",
  columnValues: {
    text: { contextVarId: "cv1", expr: { type: "literal", valueType: "text", value: "abc" }}
  },
  content: { 
    type: "textbox", 
    id: "tb1",
    rowContextVarId: "ar1",
    column: "text",
    required: false
  }
}

test("save writes to database", async () => {
  const addRowBlock = new AddRowBlock(addRowBlockDef, createBlock);

  const inst = mount(addRowBlock.renderInstance(rips))

  // Wait for load
  await pause()
  inst.update()

  // Expect added row
  expect(database.mutations[0].type).toBe("add")

  console.log(inst.debug())

  expect(inst.find("input").prop("value")).toBe("abc")
})