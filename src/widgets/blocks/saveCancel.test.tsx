import { ContextVar, BlockDef } from "../blocks";
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
import { InstanceCtx } from "../../contexts";

// Outer context vars
const rowCV: ContextVar = { id: "cv1", type: "row", name: "", table: "t1" }
const contextVars: ContextVar[] = [rowCV]

const schema = simpleSchema()

const createBlock = new BlockFactory().createBlock

let rips: InstanceCtx
let database: VirtualDatabase

// Trap alerts
let alertMessages: string[] = []
window.alert = (msg: string) => alertMessages.push(msg)

beforeEach(() => {
  database = new VirtualDatabase(new NullDatabase(), schema, "en")

  // Create render instance props
  rips = {
    createBlock: createBlock,
    contextVars: contextVars,
    database: database,
    getContextVarExprValue: jest.fn(),
    actionLibrary: {} as ActionLibrary,
    pageStack: {} as PageStack,
    contextVarValues: { cv1: "123" },
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

 alertMessages = []
})

const pause = () => new Promise((resolve, reject) => setImmediate(resolve))

// Create save/cancel with single required text control
const saveCancelBlockDef: SaveCancelBlockDef = {
  id: "sc1",
  type: "saveCancel",
  saveLabel: { _base: "en", en: "Save" },
  cancelLabel: { _base: "en", en: "Cancel" },
  confirmDiscardMessage: { _base: "en", en: "Discard changes?" },
  child: { 
    type: "textbox", 
    id: "tb1",
    rowContextVarId: "cv1",
    column: "text",
    required: true,
    requiredMessage: { _base: "en", en: "text required" },
    placeholder: null
  }
}

test("save writes to database", async () => {
  const saveCancelBlock = new SaveCancelBlock(saveCancelBlockDef, createBlock);

  // Add row to database
  const txn = database.transaction()
  const pk = await txn.addRow("t1", { text: "abc" })
  await txn.commit()
  rips.contextVarValues.cv1 = pk
  
  const inst = mount(saveCancelBlock.renderInstance(rips))

  // Wait for load
  await pause()
  inst.update()

  expect(inst.find("input").prop("value")).toBe("abc")

  // Fire on change
  inst.find("input").prop("onChange")!({ target: { value: "def" }} as any)

  // Wait for load
  await pause()
  inst.update()

  expect(inst.find("input").prop("value")).toBe("def")

  // Blur
  inst.find("input").prop("onBlur")!({ target: { value: "def" }} as any)

  // Wait for load
  await pause()
  inst.update()
  
  // Handle page close 
  rips.pageStack.closePage = jest.fn()

  // Call save
  inst.find("button").at(0).prop("onClick")!({} as any)

  // Wait for save
  await pause()
  inst.update()
  
  expect(alertMessages.length).toBe(0)

  expect(database.mutations[0].type).toBe("add")
  // expect(transaction.updateRow.mock.calls[0][2]).toEqual({ text: "def" })
})

test("prevent save if required blank", async () => {
  const saveCancelBlock = new SaveCancelBlock(saveCancelBlockDef, createBlock);

  // Add row to database
  const txn = database.transaction()
  const pk = await txn.addRow("t1", { })
  await txn.commit()
  rips.contextVarValues.cv1 = pk
  
  const inst = mount(saveCancelBlock.renderInstance(rips))

  // Wait for load
  await pause()
  inst.update()

  expect(inst.find("input").prop("value")).toBe("")

  // Handle page close 
  const closePage = jest.fn()
  rips.pageStack.closePage = closePage

  // Call save
  inst.find("button").at(0).prop("onClick")!({} as any)

  // Wait for save
  await pause()
  inst.update()

  expect(closePage.mock.calls.length).toBe(0)
  expect(alertMessages).toEqual(["text required"])
})