import { HorizontalBlock, HorizontalBlockDef } from "./horizontal"
import { TextBlockDef } from "./text"

it("canonicalizes single item", () => {
  const hbd: HorizontalBlockDef = {
    type: "horizontal",
    id: "a",
    items: [{ id: "b", type: "text", text: null } as TextBlockDef]
  }

  const hbd2 = new HorizontalBlock(hbd).canonicalize()

  // Should collapse
  expect(hbd2).toEqual(hbd.items[0])
})

it("canonicalizes nested items", () => {
  const hbd: HorizontalBlockDef = {
    type: "horizontal",
    id: "a",
    items: [
      {
        type: "horizontal",
        id: "h1",
        items: [
          { id: "b", type: "text", text: null } as TextBlockDef,
          { id: "c", type: "text", text: null } as TextBlockDef
        ]
      } as HorizontalBlockDef,
      { id: "d", type: "text", text: null } as TextBlockDef
    ]
  }

  const hbd2 = new HorizontalBlock(hbd).canonicalize()

  // Should collapse
  expect(hbd2).toEqual({
    type: "horizontal",
    id: "a",
    items: [
      { id: "b", type: "text", text: null } as TextBlockDef,
      { id: "c", type: "text", text: null } as TextBlockDef,
      { id: "d", type: "text", text: null } as TextBlockDef
    ]
  })
})

it("canonicalizes good item as self", () => {
  const hbd: HorizontalBlockDef = {
    type: "horizontal",
    id: "a",
    items: [
      { id: "b", type: "text", text: null } as TextBlockDef,
      { id: "c", type: "text", text: null } as TextBlockDef
    ]
  }

  const hbd2 = new HorizontalBlock(hbd).canonicalize()

  // Should collapse
  expect(hbd).toBe(hbd2)
})
