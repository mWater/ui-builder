"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addRow_1 = require("./addRow");
const VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
const Database_1 = require("../../database/Database");
const schema_1 = __importDefault(require("../../__fixtures__/schema"));
const mockInstanceCtx_1 = __importDefault(require("../../__fixtures__/mockInstanceCtx"));
test("performs non-literal action", async () => {
    const ad = {
        type: "addRow",
        table: "t1",
        columnValues: {
            "number": {
                contextVarId: null,
                expr: { type: "literal", valueType: "number", value: 123 }
            }
        }
    };
    const schema = schema_1.default();
    const database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    const action = new addRow_1.AddRowAction(ad);
    const instanceCtx = { ...mockInstanceCtx_1.default(),
        database: database, contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }], contextVarValues: { cv1: "123" },
        getContextVarExprValue: () => { throw new Error("Not implemented"); }, };
    await action.performAction(instanceCtx);
    expect(database.mutations.length).toBe(1);
    expect(database.mutations[0].values).toEqual({
        number: 123
    });
});
test("performs literal action", async () => {
    const ad = {
        type: "addRow",
        table: "t1",
        columnValues: {
            "number": {
                contextVarId: null,
                expr: { type: "literal", valueType: "number", value: 123 }
            }
        }
    };
    const schema = schema_1.default();
    const database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    const instanceCtx = { ...mockInstanceCtx_1.default(),
        database: database, contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }], contextVarValues: { cv1: "123" },
        getContextVarExprValue: () => { throw new Error("Not implemented"); },
        getFilters: () => [] };
    const action = new addRow_1.AddRowAction(ad);
    await action.performAction(instanceCtx);
    expect(database.mutations.length).toBe(1);
    expect(database.mutations[0].values).toEqual({
        number: 123
    });
});
