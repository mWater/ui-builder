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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = __importDefault(require("../../__fixtures__/schema"));
var saveCancel_1 = require("./saveCancel");
var enzyme_1 = require("enzyme");
var react_1 = __importDefault(require("react"));
var VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
var Database_1 = require("../../database/Database");
var BlockFactory_1 = __importDefault(require("../BlockFactory"));
// Outer context vars
var rowCV = { id: "cv1", type: "row", name: "", table: "t1" };
var contextVars = [rowCV];
var schema = schema_1.default();
var createBlock = new BlockFactory_1.default().createBlock;
var rips;
var database;
// Trap alerts
var alertMessages = [];
window.alert = function (msg) { return alertMessages.push(msg); };
beforeEach(function () {
    database = new VirtualDatabase_1.default(new Database_1.NullDatabase(), schema, "en");
    // Create render instance props
    rips = {
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
        renderChildBlock: function (props, childBlockDef, instanceId) {
            if (childBlockDef) {
                var childBlock = createBlock(childBlockDef);
                return childBlock.renderInstance(props);
            }
            return react_1.default.createElement("div", null);
        },
        widgetLibrary: { widgets: {} }
    };
    alertMessages = [];
});
var pause = function () { return new Promise(function (resolve, reject) { return setImmediate(resolve); }); };
// Create save/cancel with single required text control
var saveCancelBlockDef = {
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
test("save writes to database", function () { return __awaiter(void 0, void 0, void 0, function () {
    var saveCancelBlock, txn, pk, inst;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                saveCancelBlock = new saveCancel_1.SaveCancelBlock(saveCancelBlockDef, createBlock);
                txn = database.transaction();
                return [4 /*yield*/, txn.addRow("t1", { text: "abc" })];
            case 1:
                pk = _a.sent();
                return [4 /*yield*/, txn.commit()];
            case 2:
                _a.sent();
                rips.contextVarValues.cv1 = pk;
                inst = enzyme_1.mount(saveCancelBlock.renderInstance(rips));
                // Wait for load
                return [4 /*yield*/, pause()];
            case 3:
                // Wait for load
                _a.sent();
                inst.update();
                expect(inst.find("input").prop("value")).toBe("abc");
                // Fire on change
                inst.find("input").prop("onChange")({ target: { value: "def" } });
                // Wait for load
                return [4 /*yield*/, pause()];
            case 4:
                // Wait for load
                _a.sent();
                inst.update();
                expect(inst.find("input").prop("value")).toBe("def");
                // Blur
                inst.find("input").prop("onBlur")({ target: { value: "def" } });
                // Wait for load
                return [4 /*yield*/, pause()];
            case 5:
                // Wait for load
                _a.sent();
                inst.update();
                // Handle page close 
                rips.pageStack.closePage = jest.fn();
                // Call save
                inst.find("button").at(0).prop("onClick")({});
                // Wait for save
                return [4 /*yield*/, pause()];
            case 6:
                // Wait for save
                _a.sent();
                inst.update();
                expect(alertMessages.length).toBe(0);
                expect(database.mutations[0].type).toBe("add");
                return [2 /*return*/];
        }
    });
}); });
test("prevent save if required blank", function () { return __awaiter(void 0, void 0, void 0, function () {
    var saveCancelBlock, txn, pk, inst, closePage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                saveCancelBlock = new saveCancel_1.SaveCancelBlock(saveCancelBlockDef, createBlock);
                txn = database.transaction();
                return [4 /*yield*/, txn.addRow("t1", {})];
            case 1:
                pk = _a.sent();
                return [4 /*yield*/, txn.commit()];
            case 2:
                _a.sent();
                rips.contextVarValues.cv1 = pk;
                inst = enzyme_1.mount(saveCancelBlock.renderInstance(rips));
                // Wait for load
                return [4 /*yield*/, pause()];
            case 3:
                // Wait for load
                _a.sent();
                inst.update();
                expect(inst.find("input").prop("value")).toBe("");
                closePage = jest.fn();
                rips.pageStack.closePage = closePage;
                // Call save
                inst.find("button").at(0).prop("onClick")({});
                // Wait for save
                return [4 /*yield*/, pause()];
            case 4:
                // Wait for save
                _a.sent();
                inst.update();
                expect(closePage.mock.calls.length).toBe(0);
                expect(alertMessages).toEqual(["text required"]);
                return [2 /*return*/];
        }
    });
}); });
