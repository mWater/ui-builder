"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = __importDefault(require("../../../__fixtures__/schema"));
var enzyme_1 = require("enzyme");
var dropdownFilter_1 = require("./dropdownFilter");
var EnumInstance_1 = __importDefault(require("./EnumInstance"));
var TextInstance_1 = __importDefault(require("./TextInstance"));
describe("enum filter", function () {
    var dropdownFilterBlockDef = {
        id: "ddf1",
        filterExpr: { type: "field", table: "t1", column: "enum" },
        placeholder: null,
        rowsetContextVarId: "cv1",
        type: "dropdownFilter"
    };
    var dropdownFilterBlock = new dropdownFilter_1.DropdownFilterBlock(dropdownFilterBlockDef);
    test("sets filter on change", function () {
        var props = {
            schema: schema_1.default(),
            getFilters: jest.fn(),
            setFilter: jest.fn(),
            locale: "en",
            contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
        };
        props.getFilters.mockReturnValue([]);
        var inst = enzyme_1.shallow(dropdownFilterBlock.renderInstance(props));
        // Set an option
        inst.find(EnumInstance_1.default).prop("onChange")("op1");
        expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
                id: "ddf1",
                expr: { type: "op", table: "t1", op: "=", exprs: [
                        { type: "field", table: "t1", column: "enum" },
                        { type: "literal", valueType: "enum", value: "op1" },
                    ] },
                memo: "op1"
            }]);
    });
    test("clears filter on null change", function () {
        var props = {
            schema: schema_1.default(),
            getFilters: jest.fn(),
            setFilter: jest.fn(),
            locale: "en",
            contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
        };
        props.getFilters.mockReturnValue([]);
        var inst = enzyme_1.shallow(dropdownFilterBlock.renderInstance(props));
        // Set an option
        inst.find(EnumInstance_1.default).prop("onChange")(null);
        expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
                id: "ddf1",
                expr: null,
                memo: null
            }]);
    });
});
describe("text filter", function () {
    var dropdownFilterBlockDef = {
        id: "ddf1",
        filterExpr: { type: "field", table: "t1", column: "text" },
        placeholder: null,
        rowsetContextVarId: "cv1",
        type: "dropdownFilter"
    };
    var dropdownFilterBlock = new dropdownFilter_1.DropdownFilterBlock(dropdownFilterBlockDef);
    test("sets filter on change", function () {
        var props = {
            schema: schema_1.default(),
            getFilters: jest.fn(),
            setFilter: jest.fn(),
            locale: "en",
            contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
        };
        props.getFilters.mockReturnValue([]);
        var inst = enzyme_1.shallow(dropdownFilterBlock.renderInstance(props));
        // Set an option
        inst.find(TextInstance_1.default).prop("onChange")("op1");
        expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
                id: "ddf1",
                expr: { type: "op", table: "t1", op: "=", exprs: [
                        { type: "field", table: "t1", column: "text" },
                        { type: "literal", valueType: "text", value: "op1" },
                    ] },
                memo: "op1"
            }]);
    });
    test("clears filter on null change", function () {
        var props = {
            schema: schema_1.default(),
            getFilters: jest.fn(),
            setFilter: jest.fn(),
            locale: "en",
            contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
        };
        props.getFilters.mockReturnValue([]);
        var inst = enzyme_1.shallow(dropdownFilterBlock.renderInstance(props));
        // Set an option
        inst.find(TextInstance_1.default).prop("onChange")(null);
        expect(props.setFilter.mock.calls[0]).toEqual(["cv1", {
                id: "ddf1",
                expr: null,
                memo: null
            }]);
    });
});
