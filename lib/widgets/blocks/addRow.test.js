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
const schema_1 = __importDefault(require("../../__fixtures__/schema"));
const enzyme_1 = require("enzyme");
const react_1 = __importDefault(require("react"));
const VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
const Database_1 = require("../../database/Database");
const BlockFactory_1 = __importDefault(require("../BlockFactory"));
const addRow_1 = require("./addRow");
// Outer context vars
const schema = schema_1.default();
const createBlock = new BlockFactory_1.default().createBlock;
let rips;
let database;
beforeEach(() => {
    database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
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
            return react_1.default.createElement("div", null);
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
test("save writes to database", () => __awaiter(this, void 0, void 0, function* () {
    const addRowBlock = new addRow_1.AddRowBlock(addRowBlockDef, createBlock);
    const inst = enzyme_1.mount(addRowBlock.renderInstance(rips));
    // Wait for load
    yield pause();
    inst.update();
    // Expect added row
    expect(database.mutations[0].type).toBe("add");
    expect(inst.find("input").prop("value")).toBe("abc");
}));
//# sourceMappingURL=addRow.test.js.map