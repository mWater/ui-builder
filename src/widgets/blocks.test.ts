import * as blocks from './blocks'

test("drops left", () => {
  const source = { id: "a", type: "dummy" }
  const target = { id: "b", type: "dummy" }
  const result = blocks.dropBlock(source, target, blocks.DropSide.left)
  expect(result.type).toBe("horizontal")
  expect(result.items[0]).toBe(source)
  expect(result.items[1]).toBe(target)
})