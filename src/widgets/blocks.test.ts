import * as blocks from './blocks'
import BlockFactory from './BlockFactory';
import { ContextVar } from './blocks';
import { QueryTableBlockDef } from './blocks/queryTable/queryTable';

test("drops left", () => {
  const source = { id: "a", type: "dummy" }
  const target = { id: "b", type: "dummy" }
  const result = blocks.dropBlock(source, target, blocks.DropSide.left) as any
  expect(result.type).toBe("horizontal")
  expect(result.items[0]).toBe(source)
  expect(result.items[1]).toBe(target)
})

test("findBlockAncestry", () => {
  const createBlock = new BlockFactory().createBlock

  // Create simple tree
  const blockDef = {
    id: "a1",
    type: "horizontal",
    align: "justify",
    items: [
      { 
        id: "b1", 
        type: "horizontal",
        align: "justify",
        items: [{ id: "c1", type: "horizontal", items: [] }]
      }
    ]
  }
  
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "a1")!.map(b => b.blockDef!.id)).toEqual(["a1"])
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "b1")!.map(b => b.blockDef!.id)).toEqual(["a1", "b1"])
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "c1")!.map(b => b.blockDef!.id)).toEqual(["a1", "b1", "c1"])
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "x")).toBeNull()
})

test("findBlockAncestry with queryTable", () => {
  const createBlock = new BlockFactory().createBlock

  // Root cv
  const rootContextVars: ContextVar[] = [
    { id: "cv1", type: "rowset", table: "t1", name: "CV1" }
  ]

  // Create simple tree
  const blockDef = {
    id: "qt1",
    type: "queryTable",
    rowsetContextVarId: "cv1",
    mode: "singleRow",
    headers: [],
    contents: [
      { id: "c1", type: "horizontal", items: [] }
    ]
  }
  
  const ancestry = blocks.findBlockAncestry(blockDef, createBlock, rootContextVars, "c1")
  expect(ancestry).toEqual([
    { blockDef: blockDef, contextVars: rootContextVars },
    { blockDef: blockDef.contents[0], contextVars: rootContextVars.concat({ id: "qt1_row", name: "Table row of CV1", type: "row", table: "t1" }) },
  ])
})

test("getBlockTree", () => {
  const createBlock = new BlockFactory().createBlock

  // Create simple tree
  const blockDef = {
    id: "a1",
    type: "horizontal",
    items: [
      { 
        id: "b1", 
        type: "horizontal",
        align: "justify",
        items: [{ id: "c1", type: "horizontal", align: "justify", items: [] }]
      }
    ]
  }
  
  expect(blocks.getBlockTree(blockDef, createBlock, []).map(b => b.blockDef.id)).toEqual(["a1", "b1", "c1"])
})

test("createExprVariables", () => {
  expect(blocks.createExprVariables([{ id: "cv1", type: "row", name: "Cv1", table: "t1" }])).toEqual([
    { id: "cv1", type: "id", name: { _base: "en", en: "Cv1" }, idTable: "t1" }
  ])

  expect(blocks.createExprVariables([{ id: "cv1", type: "text", name: "Cv1" }])).toEqual([
    { id: "cv1", type: "text", name: { _base: "en", en: "Cv1" } }
  ])

  expect(blocks.createExprVariables([{ id: "cv1", type: "rowset", name: "Cv1", table: "t1" }])).toEqual([
    { id: "cv1", type: "boolean", name: { _base: "en", en: "Cv1" }, table: "t1" }
  ])
})

test("duplicateBlockDef with queryTable", () => {
  const createBlock = new BlockFactory().createBlock

  // Root cv
  const rootContextVars: ContextVar[] = [
    { id: "cv1", type: "rowset", table: "t1", name: "CV1" }
  ]

  // Create simple tree
  const blockDef = {
    id: "qt1",
    type: "queryTable",
    rowsetContextVarId: "cv1",
    mode: "singleRow",
    headers: [],
    contents: [
      { id: "c1", type: "horizontal", items: [] }
    ]
  }
  
  const duplicate = blocks.duplicateBlockDef(blockDef, createBlock) as QueryTableBlockDef
  expect(duplicate.id).not.toBe(blockDef.id)
  expect(duplicate.contents[0]!.id).not.toBe(blockDef.contents[0]!.id)
})
