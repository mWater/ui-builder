import { mount } from 'enzyme';
import * as React from "react";
import { QueryTableBlock } from "./queryTable";
import QueryTableBlockInstance from "./QueryTableBlockInstance";
import simpleSchema from "../../../__fixtures__/schema";
import BlockFactory from '../../BlockFactory';
import mockDatabase from '../../../__fixtures__/mockDatabase';
import { OrderByDir } from '../../../database/Database';
// Outer context vars
const rowsetCV = { id: "cv1", type: "rowset", name: "", table: "t1" };
const contextVars = [rowsetCV];
const schema = simpleSchema();
const exprText = { type: "field", table: "t1", column: "text" };
const qtbdSingle = {
    id: "123",
    type: "queryTable",
    mode: "singleRow",
    headers: [],
    contents: [{ type: "expression", id: "re1", contextVarId: "123_row", expr: exprText }],
    rowsetContextVarId: "cv1",
    orderBy: null,
    limit: 10,
    where: null,
    rowClickAction: null
};
const createBlock = new BlockFactory().createBlock;
const qtbSingle = new QueryTableBlock(qtbdSingle, createBlock);
let rips;
let database;
beforeEach(() => {
    database = mockDatabase();
    rips = {
        contextVars: contextVars,
        database: database,
        getContextVarExprValue: jest.fn(),
        actionLibrary: {},
        pageStack: {},
        // Simple filter
        contextVarValues: { cv1: { type: "field", table: "t1", column: "boolean" } },
        getFilters: () => [],
        setFilter: jest.fn(),
        locale: "en",
        onSelectContextVar: jest.fn(),
        schema: schema,
        dataSource: {},
        renderChildBlock: jest.fn(),
        widgetLibrary: { widgets: {} }
    };
});
// single:
test("creates query", () => {
    database.query.mockResolvedValue([]);
    const inst = mount(React.createElement(QueryTableBlockInstance, { block: qtbSingle, renderInstanceProps: rips }));
    const queryOptions = database.query.mock.calls[0][0];
    expect(queryOptions).toEqual({
        select: {
            id: { type: "id", table: "t1" },
            e0: exprText
        },
        from: "t1",
        where: {
            type: "op",
            op: "and",
            table: "t1",
            exprs: [{ type: "field", table: "t1", column: "boolean" }],
        },
        limit: 10
    });
});
test("adds filters, orderBy and where", () => {
    database.query.mockResolvedValue([]);
    rips.getFilters = () => [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: true } }];
    const qtb = createBlock(Object.assign({}, qtbdSingle, { where: { type: "literal", valueType: "boolean", value: false }, orderBy: [
            { expr: { type: "field", table: "t1", column: "number" }, dir: OrderByDir.desc }
        ] }));
    const inst = mount(React.createElement(QueryTableBlockInstance, { block: qtb, renderInstanceProps: rips }));
    const queryOptions = database.query.mock.calls[0][0];
    expect(queryOptions).toEqual({
        select: {
            id: { type: "id", table: "t1" },
            e0: exprText
        },
        from: "t1",
        where: {
            type: "op",
            op: "and",
            table: "t1",
            exprs: [
                { type: "field", table: "t1", column: "boolean" },
                { type: "literal", valueType: "boolean", value: true },
                { type: "literal", valueType: "boolean", value: false }
            ]
        },
        orderBy: [
            { expr: { type: "field", table: "t1", column: "number" }, dir: OrderByDir.desc }
        ],
        limit: 10
    });
});
test("injects context variables", () => {
    database.query.mockResolvedValue([]);
    const inst = mount(React.createElement(QueryTableBlockInstance, { block: qtbSingle, renderInstanceProps: rips }));
    inst.setState({ rows: [{ id: "r1", e0: "abc" }] });
    const rowRips = inst.instance().createRowRenderInstanceProps(0);
    expect(rowRips.contextVarValues["123_row"]).toBe("r1");
    expect(rowRips.getContextVarExprValue("123_row", exprText)).toBe("abc");
});
// TODO performs action on row click
//# sourceMappingURL=QueryTableBlockInstance.test.js.map