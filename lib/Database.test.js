"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("./database/Database");
test("finds filters by primary key only", () => {
    expect((0, Database_1.getWherePrimaryKey)(null)).toBeNull();
    expect((0, Database_1.getWherePrimaryKey)({ type: "field", table: "t1", column: "x" })).toBeNull();
    expect((0, Database_1.getWherePrimaryKey)({ type: "id", table: "t1" })).toBeNull();
    expect((0, Database_1.getWherePrimaryKey)({
        type: "op",
        op: "=",
        table: "t1",
        exprs: [
            { type: "id", table: "t1" },
            { type: "literal", valueType: "id", value: 123 }
        ]
    })).toBe(123);
    // Also wrapped in and
    expect((0, Database_1.getWherePrimaryKey)({
        type: "op",
        op: "and",
        table: "t1",
        exprs: [
            {
                type: "op",
                op: "=",
                table: "t1",
                exprs: [
                    { type: "id", table: "t1" },
                    { type: "literal", valueType: "id", value: 123 }
                ]
            }
        ]
    })).toBe(123);
    expect((0, Database_1.getWherePrimaryKey)(null)).toBeNull();
});
