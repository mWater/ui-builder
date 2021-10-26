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
const VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
const Database_1 = require("../../database/Database");
const schema_1 = __importDefault(require("../../__fixtures__/schema"));
const openPage_1 = require("./openPage");
const mockInstanceCtx_1 = __importDefault(require("../../__fixtures__/mockInstanceCtx"));
test("performs action", () => __awaiter(void 0, void 0, void 0, function* () {
    const ad = {
        type: "openPage",
        pageType: "normal",
        widgetId: "innerPage",
        contextVarValues: {
            innercv1: {
                type: "ref",
                contextVarId: "outercv1"
            }
        }
    };
    const schema = (0, schema_1.default)();
    const database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    const openPage = jest.fn();
    const pageStack = {
        openPage: openPage
    };
    const instanceCtx = Object.assign(Object.assign({}, (0, mockInstanceCtx_1.default)()), { database: database, schema: schema, pageStack: pageStack, contextVars: [{ id: "outercv1", table: "t2", name: "Cv1", type: "rowset" }], contextVarValues: { outercv1: { type: "literal", valueType: "boolean", value: true } }, getContextVarExprValue: () => {
            throw new Error("Not implemented");
        }, getFilters: (cvid) => {
            return cvid == "outercv1"
                ? [{ id: "f1", expr: { type: "literal", valueType: "boolean", value: false } }]
                : [];
        }, widgetLibrary: {
            widgets: {
                innerPage: {
                    contextVars: [{ id: "innercv1", type: "boolean" }]
                }
            }
        } });
    const action = new openPage_1.OpenPageAction(ad);
    yield action.performAction(instanceCtx);
    const page = openPage.mock.calls[0][0];
    // Should include filters in rowset
    expect(page.contextVarValues["innercv1"]).toEqual({
        type: "op",
        table: "t2",
        op: "and",
        exprs: [
            { type: "literal", valueType: "boolean", value: true },
            { type: "literal", valueType: "boolean", value: false }
        ]
    });
}));
