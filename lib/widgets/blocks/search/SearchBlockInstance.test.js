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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const SearchBlockInstance_1 = __importDefault(require("./SearchBlockInstance"));
const enzyme_1 = require("enzyme");
const React = __importStar(require("react"));
const schema_1 = __importDefault(require("../../../__fixtures__/schema"));
const getFilter = (blockDef, searchText) => {
    return new Promise((resolve, reject) => {
        // Create minimal renderInstanceProps
        const renderInstanceProps = {
            schema: schema_1.default(),
            setFilter: (contextVarId, filter) => {
                resolve({ contextVarId: contextVarId, filter: filter });
            },
            contextVars: [{ id: "cv1", type: "rowset", table: "t1" }]
        };
        const sbi = enzyme_1.shallow(React.createElement(SearchBlockInstance_1.default, { blockDef: blockDef, renderInstanceProps: renderInstanceProps }));
        sbi.prop("onChange")(searchText);
    });
};
test("creates search on single text expression", () => __awaiter(this, void 0, void 0, function* () {
    const searchExprs = [
        { type: "field", table: "t1", column: "text" }
    ];
    const filter = yield getFilter({ id: "s", rowsetContextVarId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "xyz*");
    expect(filter).toEqual({
        contextVarId: "cv1",
        filter: {
            id: "s",
            expr: {
                type: "op",
                table: "t1",
                op: "or",
                exprs: [
                    {
                        type: "op",
                        table: "t1",
                        op: "~*",
                        exprs: [
                            searchExprs[0],
                            { type: "literal", valueType: "text", value: "xyz\\*" }
                        ]
                    }
                ]
            }
        }
    });
}));
test("creates search on single enum expression", () => __awaiter(this, void 0, void 0, function* () {
    const searchExprs = [
        { type: "field", table: "t1", column: "enum" }
    ];
    const filter = yield getFilter({ id: "s", rowsetContextVarId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "B");
    expect(filter).toEqual({
        contextVarId: "cv1",
        filter: {
            id: "s",
            expr: {
                type: "op",
                table: "t1",
                op: "or",
                exprs: [
                    {
                        type: "op",
                        table: "t1",
                        op: "= any",
                        exprs: [
                            searchExprs[0],
                            { type: "literal", valueType: "enumset", value: ["b"] }
                        ]
                    }
                ]
            }
        }
    });
}));
test("creates search on single enumset expression", () => __awaiter(this, void 0, void 0, function* () {
    const searchExprs = [
        { type: "field", table: "t1", column: "enumset" }
    ];
    const filter = yield getFilter({ id: "s", rowsetContextVarId: "cv1", searchExprs: searchExprs, type: "search", placeholder: null }, "B");
    expect(filter).toEqual({
        contextVarId: "cv1",
        filter: {
            id: "s",
            expr: {
                type: "op",
                table: "t1",
                op: "or",
                exprs: [
                    {
                        type: "op",
                        table: "t1",
                        op: "intersects",
                        exprs: [
                            searchExprs[0],
                            { type: "literal", valueType: "enumset", value: ["b"] }
                        ]
                    }
                ]
            }
        }
    });
}));
//# sourceMappingURL=SearchBlockInstance.test.js.map