"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addRow_1 = require("./addRow");
const VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
const Database_1 = require("../../database/Database");
const schema_1 = __importDefault(require("../../__fixtures__/schema"));
test("gets context var exprs", () => {
    const ad = {
        type: "addRow",
        table: "abc",
        columnValues: {
            "a": {
                contextVarId: "cv1",
                expr: { type: "literal", valueType: "number", value: 123 }
            },
            "b": {
                contextVarId: "cv2",
                expr: { type: "literal", valueType: "number", value: 456 }
            }
        }
    };
    const varExprs = new addRow_1.AddRowAction(ad).getContextVarExprs({ id: "cv2" });
    expect(varExprs).toEqual([{ type: "literal", valueType: "number", value: 456 }]);
});
test("performs non-literal action", () => __awaiter(this, void 0, void 0, function* () {
    const ad = {
        type: "addRow",
        table: "t1",
        columnValues: {
            "number": {
                contextVarId: "cv1",
                expr: { type: "literal", valueType: "number", value: 123 }
            }
        }
    };
    const schema = schema_1.default();
    const database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    const action = new addRow_1.AddRowAction(ad);
    yield action.performAction({
        locale: "en",
        database: database,
        schema: {},
        pageStack: {},
        contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }],
        contextVarValues: { cv1: "123" },
        getContextVarExprValue: (cvid, expr) => 123
    });
    expect(database.mutations.length).toBe(1);
    expect(database.mutations[0].values).toEqual({
        number: 123
    });
}));
test("performs literal action", () => __awaiter(this, void 0, void 0, function* () {
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
    yield action.performAction({
        locale: "en",
        database: database,
        schema: {},
        pageStack: {},
        contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }],
        contextVarValues: { cv1: "123" },
        getContextVarExprValue: (cvid, expr) => { throw new Error("Not used"); }
    });
    expect(database.mutations.length).toBe(1);
    expect(database.mutations[0].values).toEqual({
        number: 123
    });
}));
//# sourceMappingURL=addRow.test.js.map