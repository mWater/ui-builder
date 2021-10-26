"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const mockInstanceCtx_1 = __importDefault(require("../../__fixtures__/mockInstanceCtx"));
test("performs non-literal action", () => __awaiter(void 0, void 0, void 0, function* () {
    const ad = {
        type: "addRow",
        table: "t1",
        columnValues: {
            number: {
                contextVarId: null,
                expr: { type: "literal", valueType: "number", value: 123 }
            }
        }
    };
    const schema = (0, schema_1.default)();
    const database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    const action = new addRow_1.AddRowAction(ad);
    const instanceCtx = Object.assign(Object.assign({}, (0, mockInstanceCtx_1.default)()), { database: database, contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }], contextVarValues: { cv1: "123" }, getContextVarExprValue: () => {
            throw new Error("Not implemented");
        } });
    yield action.performAction(instanceCtx);
    expect(database.mutations.length).toBe(1);
    expect(database.mutations[0].values).toEqual({
        number: 123
    });
}));
test("performs literal action", () => __awaiter(void 0, void 0, void 0, function* () {
    const ad = {
        type: "addRow",
        table: "t1",
        columnValues: {
            number: {
                contextVarId: null,
                expr: { type: "literal", valueType: "number", value: 123 }
            }
        }
    };
    const schema = (0, schema_1.default)();
    const database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    const instanceCtx = Object.assign(Object.assign({}, (0, mockInstanceCtx_1.default)()), { database: database, contextVars: [{ id: "cv1", table: "t2", name: "Cv1", type: "row" }], contextVarValues: { cv1: "123" }, getContextVarExprValue: () => {
            throw new Error("Not implemented");
        }, getFilters: () => [] });
    const action = new addRow_1.AddRowAction(ad);
    yield action.performAction(instanceCtx);
    expect(database.mutations.length).toBe(1);
    expect(database.mutations[0].values).toEqual({
        number: 123
    });
}));
