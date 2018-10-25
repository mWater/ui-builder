import simpleSchema from "../../__fixtures__/schema";
import { mount } from "enzyme";
import React from "react";
import VirtualDatabase from "../../database/VirtualDatabase";
import { NullDatabase } from "../../database/Database";
import BlockFactory from "../BlockFactory";
import { AddRowBlock } from "./addRow";
// Outer context vars
const schema = simpleSchema();
const createBlock = new BlockFactory().createBlock;
let rips;
let database;
beforeEach(() => {
    database = new VirtualDatabase(new NullDatabase(), schema, "en");
    // Create render instance props
    rips = {
        contextVars: [],
        database: database,
        getContextVarExprValue: jest.fn(),
        actionLibrary: {},
        pageStack: {},
        contextVarValues: {},
        getFilters: jest.fn(),
        setFilter: jest.fn(),
        locale: "en",
        onSelectContextVar: jest.fn(),
        schema: schema,
        dataSource: {},
        renderChildBlock: (props, childBlockDef) => {
            if (childBlockDef) {
                const childBlock = createBlock(childBlockDef);
                return childBlock.renderInstance(props);
            }
            return React.createElement("div", null);
        },
        widgetLibrary: { widgets: {} }
    };
});
const pause = () => new Promise((resolve) => setImmediate(resolve));
// Create add row block with textbox of added value
const addRowBlockDef = {
    id: "ar1",
    type: "addRow",
    table: "t1",
    columnValues: {
        text: { contextVarId: null, expr: { type: "literal", valueType: "text", value: "abc" } }
    },
    content: {
        type: "textbox",
        id: "tb1",
        rowContextVarId: "ar1",
        column: "text",
        required: false
    }
};
test("save writes to database", async () => {
    const addRowBlock = new AddRowBlock(addRowBlockDef, createBlock);
    const inst = mount(addRowBlock.renderInstance(rips));
    // Wait for load
    await pause();
    inst.update();
    // Expect added row
    expect(database.mutations[0].type).toBe("add");
    console.log(inst.debug());
    expect(inst.find("input").prop("value")).toBe("abc");
});
//# sourceMappingURL=addRow.test.js.map