import * as blocks from './blocks'
import BlockFactory from './BlockFactory';

test("drops left", () => {
  const source = { id: "a", type: "dummy" }
  const target = { id: "b", type: "dummy" }
  const result = blocks.dropBlock(source, target, blocks.DropSide.left)
  expect(result.type).toBe("horizontal")
  expect(result.items[0]).toBe(source)
  expect(result.items[1]).toBe(target)
})


test("findBlockAncestry", () => {
  const createBlock = new BlockFactory().createBlock.bind(null, jest.fn())

  // Create simple tree
  const blockDef = {
    id: "a1",
    type: "horizontal",
    items: [
      { 
        id: "b1", 
        type: "horizontal",
        items: [{ id: "c1", type: "horizontal", items: [] }]
      }
    ]
  }
  
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "a1")!.map(b => b.blockDef!.id)).toEqual(["a1"])
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "b1")!.map(b => b.blockDef!.id)).toEqual(["a1", "b1"])
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "c1")!.map(b => b.blockDef!.id)).toEqual(["a1", "b1", "c1"])
  expect(blocks.findBlockAncestry(blockDef, createBlock, [], "x")).toBeNull()
})

test("getBlockTree", () => {
  const createBlock = new BlockFactory().createBlock.bind(null, jest.fn())

  // Create simple tree
  const blockDef = {
    id: "a1",
    type: "horizontal",
    items: [
      { 
        id: "b1", 
        type: "horizontal",
        items: [{ id: "c1", type: "horizontal", items: [] }]
      }
    ]
  }
  
  expect(blocks.getBlockTree(blockDef, createBlock, []).map(b => b.id)).toEqual(["a1", "b1", "c1"])
})
