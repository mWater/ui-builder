"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queryRepeat_1 = require("./queryRepeat");
const schema_1 = __importDefault(require("../../../__fixtures__/schema"));
const BlockFactory_1 = __importDefault(require("../../BlockFactory"));
// Outer context vars
const rowsetCV = { id: "cv1", type: "rowset", name: "CV1", table: "t1" };
const contextVars = [rowsetCV];
const qrbd = {
    id: "123",
    type: "queryRepeat",
    separator: "solid_line",
    content: null,
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null
};
const createBlock = new BlockFactory_1.default().createBlock;
const qrb = new queryRepeat_1.QueryRepeatBlock(qrbd);
const schema = schema_1.default();
test("gets row cv", () => {
    expect(qrb.createRowContextVar(rowsetCV)).toEqual({
        id: "123_row",
        name: "Table row of CV1",
        type: "row",
        table: "t1"
    });
});
test("gets row cv value", () => {
    expect(qrb.getRowContextVarValue({ id: "123" }, [], schema, rowsetCV, contextVars)).toEqual("123");
});
test("gets row expressions", () => {
    // Create single expression in contents
    const expr = { type: "field", table: "t1", column: "text" };
    const qrbd2 = { ...qrbd, content: { type: "expression", id: "re1", contextVarId: "123_row", expr: expr } };
    const qrb = new queryRepeat_1.QueryRepeatBlock(qrbd2);
    expect(qrb.getRowExprs(contextVars, { createBlock: createBlock })).toEqual([expr]);
});
