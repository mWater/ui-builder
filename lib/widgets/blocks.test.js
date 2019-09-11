"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var blocks = __importStar(require("./blocks"));
var BlockFactory_1 = __importDefault(require("./BlockFactory"));
test("drops left", function () {
    var source = { id: "a", type: "dummy" };
    var target = { id: "b", type: "dummy" };
    var result = blocks.dropBlock(source, target, blocks.DropSide.left);
    expect(result.type).toBe("horizontal");
    expect(result.items[0]).toBe(source);
    expect(result.items[1]).toBe(target);
});
test("findBlockAncestry", function () {
    var createBlock = new BlockFactory_1.default().createBlock;
    // Create simple tree
    var blockDef = {
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
    };
    expect(blocks.findBlockAncestry(blockDef, createBlock, [], "a1").map(function (b) { return b.blockDef.id; })).toEqual(["a1"]);
    expect(blocks.findBlockAncestry(blockDef, createBlock, [], "b1").map(function (b) { return b.blockDef.id; })).toEqual(["a1", "b1"]);
    expect(blocks.findBlockAncestry(blockDef, createBlock, [], "c1").map(function (b) { return b.blockDef.id; })).toEqual(["a1", "b1", "c1"]);
    expect(blocks.findBlockAncestry(blockDef, createBlock, [], "x")).toBeNull();
});
test("findBlockAncestry with queryTable", function () {
    var createBlock = new BlockFactory_1.default().createBlock;
    // Root cv
    var rootContextVars = [
        { id: "cv1", type: "rowset", table: "t1", name: "CV1" }
    ];
    // Create simple tree
    var blockDef = {
        id: "qt1",
        type: "queryTable",
        rowsetContextVarId: "cv1",
        mode: "singleRow",
        headers: [],
        contents: [
            { id: "c1", type: "horizontal", items: [] }
        ]
    };
    var ancestry = blocks.findBlockAncestry(blockDef, createBlock, rootContextVars, "c1");
    expect(ancestry).toEqual([
        { blockDef: blockDef, contextVars: rootContextVars },
        { blockDef: blockDef.contents[0], contextVars: rootContextVars.concat({ id: "qt1_row", name: "Table row", type: "row", table: "t1" }) },
    ]);
});
test("getBlockTree", function () {
    var createBlock = new BlockFactory_1.default().createBlock;
    // Create simple tree
    var blockDef = {
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
    };
    expect(blocks.getBlockTree(blockDef, createBlock, []).map(function (b) { return b.blockDef.id; })).toEqual(["a1", "b1", "c1"]);
});
test("createExprVariables", function () {
    expect(blocks.createExprVariables([{ id: "cv1", type: "row", name: "Cv1", table: "t1" }])).toEqual([
        { id: "cv1", type: "id", name: { _base: "en", en: "Cv1" }, idTable: "t1" }
    ]);
    expect(blocks.createExprVariables([{ id: "cv1", type: "text", name: "Cv1" }])).toEqual([
        { id: "cv1", type: "text", name: { _base: "en", en: "Cv1" } }
    ]);
    expect(blocks.createExprVariables([{ id: "cv1", type: "rowset", name: "Cv1", table: "t1" }])).toEqual([
        { id: "cv1", type: "boolean", name: { _base: "en", en: "Cv1" }, table: "t1" }
    ]);
});
test("duplicateBlockDef with queryTable", function () {
    var createBlock = new BlockFactory_1.default().createBlock;
    // Root cv
    var rootContextVars = [
        { id: "cv1", type: "rowset", table: "t1", name: "CV1" }
    ];
    // Create simple tree
    var blockDef = {
        id: "qt1",
        type: "queryTable",
        rowsetContextVarId: "cv1",
        mode: "singleRow",
        headers: [],
        contents: [
            { id: "c1", type: "horizontal", items: [] }
        ]
    };
    var duplicate = blocks.duplicateBlockDef(blockDef, createBlock);
    expect(duplicate.id).not.toBe(blockDef.id);
    expect(duplicate.contents[0].id).not.toBe(blockDef.contents[0].id);
});
