"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const horizontal_1 = require("./horizontal");
it("canonicalizes single item", () => {
    const hbd = {
        type: "horizontal",
        id: "a",
        items: [{ id: "b", type: "text", text: null }]
    };
    const hbd2 = new horizontal_1.HorizontalBlock(hbd).canonicalize();
    // Should collapse
    expect(hbd2).toEqual(hbd.items[0]);
});
it("canonicalizes nested items", () => {
    const hbd = {
        type: "horizontal",
        id: "a",
        items: [
            {
                type: "horizontal",
                id: "h1",
                items: [
                    { id: "b", type: "text", text: null },
                    { id: "c", type: "text", text: null }
                ]
            },
            { id: "d", type: "text", text: null }
        ]
    };
    const hbd2 = new horizontal_1.HorizontalBlock(hbd).canonicalize();
    // Should collapse
    expect(hbd2).toEqual({
        type: "horizontal",
        id: "a",
        items: [
            { id: "b", type: "text", text: null },
            { id: "c", type: "text", text: null },
            { id: "d", type: "text", text: null }
        ]
    });
});
it("canonicalizes good item as self", () => {
    const hbd = {
        type: "horizontal",
        id: "a",
        items: [
            { id: "b", type: "text", text: null },
            { id: "c", type: "text", text: null }
        ]
    };
    const hbd2 = new horizontal_1.HorizontalBlock(hbd).canonicalize();
    // Should collapse
    expect(hbd).toBe(hbd2);
});
