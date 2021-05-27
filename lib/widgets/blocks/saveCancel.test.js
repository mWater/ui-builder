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
const schema_1 = __importDefault(require("../../__fixtures__/schema"));
const saveCancel_1 = require("./saveCancel");
const enzyme_1 = require("enzyme");
const react_1 = __importDefault(require("react"));
const VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
const Database_1 = require("../../database/Database");
const BlockFactory_1 = __importDefault(require("../BlockFactory"));
// Outer context vars
const rowCV = { id: "cv1", type: "row", name: "", table: "t1" };
const contextVars = [rowCV];
const schema = schema_1.default();
const createBlock = new BlockFactory_1.default().createBlock;
let rips;
let database;
// Trap alerts
let alertMessages = [];
window.alert = (msg) => alertMessages.push(msg);
beforeEach(() => {
    database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    // Create render instance props
    rips = {
        createBlock: createBlock,
        contextVars: contextVars,
        database: database,
        getContextVarExprValue: jest.fn(),
        actionLibrary: {},
        pageStack: {},
        contextVarValues: { cv1: "123" },
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
            return react_1.default.createElement("div", null);
        },
        widgetLibrary: { widgets: {} },
        registerForValidation: () => { return () => { }; },
        T: (str) => str
    };
    alertMessages = [];
});
const pause = () => new Promise((resolve, reject) => setImmediate(resolve));
// Create save/cancel with single required text control
const saveCancelBlockDef = {
    id: "sc1",
    type: "saveCancel",
    saveLabel: { _base: "en", en: "Save" },
    cancelLabel: { _base: "en", en: "Cancel" },
    confirmDiscardMessage: { _base: "en", en: "Discard changes?" },
    child: {
        type: "textbox",
        id: "tb1",
        rowContextVarId: "cv1",
        column: "text",
        required: true,
        requiredMessage: { _base: "en", en: "text required" },
        placeholder: null
    }
};
test("save writes to database", () => __awaiter(void 0, void 0, void 0, function* () {
    const saveCancelBlock = new saveCancel_1.SaveCancelBlock(saveCancelBlockDef);
    // Add row to database
    const txn = database.transaction();
    const pk = yield txn.addRow("t1", { text: "abc" });
    yield txn.commit();
    rips.contextVarValues.cv1 = pk;
    const inst = enzyme_1.mount(saveCancelBlock.renderInstance(rips));
    // Wait for load
    yield pause();
    inst.update();
    expect(inst.find("input").prop("value")).toBe("abc");
    // Fire on change
    inst.find("input").prop("onChange")({ target: { value: "def" } });
    // Wait for load
    yield pause();
    inst.update();
    expect(inst.find("input").prop("value")).toBe("def");
    // Blur
    inst.find("input").prop("onBlur")({ target: { value: "def" } });
    // Wait for load
    yield pause();
    inst.update();
    // Handle page close 
    rips.pageStack.closePage = jest.fn();
    // Call save
    inst.find("button").at(0).prop("onClick")({});
    // Wait for save
    yield pause();
    inst.update();
    expect(alertMessages.length).toBe(0);
    expect(database.mutations[0].type).toBe("add");
    // expect(transaction.updateRow.mock.calls[0][2]).toEqual({ text: "def" })
}));
test("prevent save if required blank", () => __awaiter(void 0, void 0, void 0, function* () {
    const saveCancelBlock = new saveCancel_1.SaveCancelBlock(saveCancelBlockDef);
    // Add row to database
    const txn = database.transaction();
    const pk = yield txn.addRow("t1", {});
    yield txn.commit();
    rips.contextVarValues.cv1 = pk;
    const inst = enzyme_1.mount(saveCancelBlock.renderInstance(rips));
    // Wait for load
    yield pause();
    inst.update();
    expect(inst.find("input").prop("value")).toBe("");
    // Handle page close 
    const closePage = jest.fn();
    rips.pageStack.closePage = closePage;
    // Call save
    inst.find("button").at(0).prop("onClick")({});
    // Wait for save
    yield pause();
    inst.update();
    expect(closePage.mock.calls.length).toBe(0);
    expect(alertMessages).toEqual([]);
}));
