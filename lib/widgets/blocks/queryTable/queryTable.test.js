import { QueryTableBlock } from "./queryTable";
import simpleSchema from "../../../__fixtures__/schema";
import BlockFactory from "../../BlockFactory";
// Outer context vars
const rowsetCV = { id: "cv1", type: "rowset", name: "", table: "t1" };
const contextVars = [rowsetCV];
const qtbdSingle = {
    id: "123",
    type: "queryTable",
    mode: "singleRow",
    headers: [],
    contents: [],
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null,
    rowClickAction: null
};
const createBlock = new BlockFactory().createBlock;
const qtbSingle = new QueryTableBlock(qtbdSingle, createBlock);
const qtbdMultiple = {
    id: "123",
    type: "queryTable",
    mode: "multiRow",
    headers: [],
    contents: [],
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null,
    rowClickAction: null
};
const qtbMultiple = new QueryTableBlock(qtbdMultiple, createBlock);
const schema = simpleSchema();
test("gets single row cv", () => {
    expect(qtbSingle.createRowContextVar(rowsetCV)).toEqual({
        id: "123_row",
        name: "Table row",
        type: "row",
        table: "t1"
    });
});
test("gets multiple row cv", () => {
    expect(qtbMultiple.createRowContextVar(rowsetCV)).toEqual({
        id: "123_rowset",
        name: "Table row rowset",
        type: "rowset",
        table: "t1"
    });
});
test("gets single row cv value", () => {
    expect(qtbSingle.getRowContextVarValue({ id: "123" }, [], schema, rowsetCV)).toEqual("123");
});
test("gets multiple row cv value", () => {
    // One non-aggregate, one aggregate
    const exprs = [
        { type: "field", table: "t1", column: "text" },
        { type: "op", table: "t1", op: "count", exprs: [] }
    ];
    expect(qtbMultiple.getRowContextVarValue({ e0: "xyz", e1: 4 }, exprs, schema, rowsetCV)).toEqual({
        type: "op",
        op: "and",
        table: "t1",
        exprs: [
            { type: "op", table: "t1", op: "=", exprs: [exprs[0], { type: "literal", valueType: "text", value: "xyz" }] }
        ]
    });
});
test("gets row expressions", () => {
    // Create single expression in contents
    const expr = { type: "field", table: "t1", column: "text" };
    const qtbd = Object.assign({}, qtbdSingle, { contents: [{ type: "expression", id: "re1", contextVarId: "123_row", expr: expr }] });
    const qtb = new QueryTableBlock(qtbd, createBlock);
    expect(qtb.getRowExprs(contextVars)).toEqual([expr]);
});
//# sourceMappingURL=queryTable.test.js.map