"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var horizontal_1 = require("./horizontal");
it("canonicalizes single item", function () {
    var hbd = {
        type: "horizontal",
        id: "a",
        items: [
            { id: "b", type: "text", text: null }
        ]
    };
    var hbd2 = new horizontal_1.HorizontalBlock(hbd).canonicalize();
    // Should collapse
    expect(hbd2).toEqual(hbd.items[0]);
});
it("canonicalizes nested items", function () {
    var hbd = {
        type: "horizontal",
        id: "a",
        items: [
            { type: "horizontal", id: "h1", items: [
                    { id: "b", type: "text", text: null },
                    { id: "c", type: "text", text: null }
                ] },
            { id: "d", type: "text", text: null }
        ]
    };
    var hbd2 = new horizontal_1.HorizontalBlock(hbd).canonicalize();
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
it("canonicalizes good item as self", function () {
    var hbd = {
        type: "horizontal",
        id: "a",
        items: [
            { id: "b", type: "text", text: null },
            { id: "c", type: "text", text: null }
        ]
    };
    var hbd2 = new horizontal_1.HorizontalBlock(hbd).canonicalize();
    // Should collapse
    expect(hbd).toBe(hbd2);
});
