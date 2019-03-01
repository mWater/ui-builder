"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fixedTable_1 = require("./fixedTable");
test("adds rows", () => {
    const blockDef = {
        id: "xyz",
        type: "fixedTable",
        numRows: 1,
        numColumns: 1,
        cellBorders: "default",
        cellPadding: "default",
        rows: [
            { cells: [{ content: { id: "b11", type: "none" } }] }
        ]
    };
    const newBlockDef = fixedTable_1.setNumRows(blockDef, 2);
    expect(newBlockDef.numRows).toBe(2);
    expect(newBlockDef.numColumns).toBe(1);
    expect(newBlockDef.rows).toEqual([
        { cells: [{ content: { id: "b11", type: "none" } }] },
        { cells: [{ content: null }] }
    ]);
});
test("removes rows", () => {
    const blockDef = {
        id: "xyz",
        type: "fixedTable",
        numRows: 2,
        numColumns: 1,
        cellBorders: "default",
        cellPadding: "default",
        rows: [
            { cells: [{ content: { id: "b11", type: "none" } }] },
            { cells: [{ content: { id: "b21", type: "none" } }] }
        ]
    };
    const newBlockDef = fixedTable_1.setNumRows(blockDef, 1);
    expect(newBlockDef.numRows).toBe(1);
    expect(newBlockDef.numColumns).toBe(1);
    expect(newBlockDef.rows).toEqual([
        { cells: [{ content: { id: "b11", type: "none" } }] },
    ]);
});
test("adds columns", () => {
    const blockDef = {
        id: "xyz",
        type: "fixedTable",
        numRows: 1,
        numColumns: 1,
        cellBorders: "default",
        cellPadding: "default",
        rows: [
            { cells: [{ content: { id: "b11", type: "none" } }] }
        ]
    };
    const newBlockDef = fixedTable_1.setNumColumns(blockDef, 2);
    expect(newBlockDef.numRows).toBe(1);
    expect(newBlockDef.numColumns).toBe(2);
    expect(newBlockDef.rows).toEqual([
        { cells: [{ content: { id: "b11", type: "none" } }, { content: null }] },
    ]);
});
test("removes columns", () => {
    const blockDef = {
        id: "xyz",
        type: "fixedTable",
        numRows: 1,
        numColumns: 2,
        cellBorders: "default",
        cellPadding: "default",
        rows: [
            { cells: [{ content: { id: "b11", type: "none" } }, { content: { id: "b12", type: "none" } }] }
        ]
    };
    const newBlockDef = fixedTable_1.setNumColumns(blockDef, 1);
    expect(newBlockDef.numRows).toBe(1);
    expect(newBlockDef.numColumns).toBe(1);
    expect(newBlockDef.rows).toEqual([
        { cells: [{ content: { id: "b11", type: "none" } }] }
    ]);
});
//# sourceMappingURL=fixedTable.test.js.map