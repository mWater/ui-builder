"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualDatabase_1 = __importDefault(require("./VirtualDatabase"));
var mockDatabase_1 = __importDefault(require("../__fixtures__/mockDatabase"));
var schema_1 = __importDefault(require("../__fixtures__/schema"));
var mwater_expressions_1 = require("mwater-expressions");
var _ = __importStar(require("lodash"));
var PromiseExprEvaluator_1 = require("./PromiseExprEvaluator");
var schema = schema_1.default();
var db;
var vdb;
var t2Where = {
    type: "op",
    op: "=",
    table: "t2",
    exprs: [
        { type: "field", table: "t2", column: "number" },
        { type: "literal", valueType: "number", value: 5 }
    ]
};
beforeEach(function () {
    db = mockDatabase_1.default();
    vdb = new VirtualDatabase_1.default(db, schema, "en");
});
test("shouldIncludeColumn includes regular columns and joins without inverse", function () {
    expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" } })).toBe(true);
    expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" }, expr: { type: "literal", valueType: "text", value: "xyz" } })).toBe(false);
    expect(vdb.shouldIncludeColumn(schema.getColumn("t1", "1-2"))).toBe(false);
    expect(vdb.shouldIncludeColumn(schema.getColumn("t2", "2-1"))).toBe(true);
});
test("trigger change if underlying database changed", function () {
    var changed = false;
    vdb.addChangeListener(function () { changed = true; });
    // Fire change
    db.addChangeListener.mock.calls[0][0]();
    expect(changed).toBe(true);
});
test("queries with where clause and included columns", function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db.query.mockResolvedValue([]);
                return [4 /*yield*/, vdb.query({
                        select: {
                            x: { type: "field", table: "t2", column: "text" }
                        },
                        from: "t2",
                        where: t2Where,
                        orderBy: [{ expr: { type: "field", table: "t2", column: "text" }, dir: "desc" }],
                        limit: 10
                    }, [], {})];
            case 1:
                _a.sent();
                expect(db.query.mock.calls[0][0]).toEqual({
                    select: {
                        id: { type: "id", table: "t2" },
                        c_text: { type: "field", table: "t2", column: "text" },
                        c_number: { type: "field", table: "t2", column: "number" },
                        "c_2-1": { type: "field", table: "t2", column: "2-1" }
                    },
                    from: "t2",
                    where: t2Where
                });
                return [2 /*return*/];
        }
    });
}); });
describe("select, order, limit", function () {
    var performQuery = function (rawRowsByTable, queryOptions) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Set up mock database to return raw rows with c_ prefixed on column names
            // This simulates a real database call
            db.query = (function (qo) { return __awaiter(_this, void 0, void 0, function () {
                var rows, exprEval, filteredRows, _loop_1, _i, rows_1, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            rows = rawRowsByTable[qo.from];
                            if (!qo.where) return [3 /*break*/, 5];
                            exprEval = new PromiseExprEvaluator_1.PromiseExprEvaluator(new mwater_expressions_1.ExprEvaluator(schema));
                            filteredRows = [];
                            _loop_1 = function (row) {
                                var evalRow;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            evalRow = {
                                                getPrimaryKey: function () { return Promise.resolve(row.id); },
                                                getField: function (columnId) { return Promise.resolve(row[columnId]); }
                                            };
                                            return [4 /*yield*/, exprEval.evaluate(qo.where, { row: evalRow })];
                                        case 1:
                                            if (_a.sent()) {
                                                filteredRows.push(row);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            _i = 0, rows_1 = rows;
                            _a.label = 1;
                        case 1:
                            if (!(_i < rows_1.length)) return [3 /*break*/, 4];
                            row = rows_1[_i];
                            return [5 /*yield**/, _loop_1(row)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            rows = filteredRows;
                            _a.label = 5;
                        case 5:
                            // Prepend c_ to non-id columns
                            rows = rows.map(function (row) { return _.mapKeys(row, function (v, k) { return k === "id" ? "id" : "c_" + k; }); });
                            return [2 /*return*/, rows];
                    }
                });
            }); });
            // Perform query
            return [2 /*return*/, vdb.query(queryOptions, [], {})];
        });
    }); };
    test("simple query", function () { return __awaiter(_this, void 0, void 0, function () {
        var qopts, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qopts = {
                        select: { x: { type: "field", table: "t1", column: "text" } },
                        from: "t1"
                    };
                    return [4 /*yield*/, performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts)];
                case 1:
                    rows = _a.sent();
                    expect(rows).toEqual([
                        { x: "abc" }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test("aggr count expr", function () { return __awaiter(_this, void 0, void 0, function () {
        var qopts, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qopts = {
                        select: {
                            x: { type: "field", table: "t1", column: "text" },
                            y: { type: "op", table: "t1", op: "count", exprs: [] }
                        },
                        from: "t1"
                    };
                    return [4 /*yield*/, performQuery({ t1: [
                                { id: 1, text: "abc" },
                                { id: 2, text: "abc" },
                                { id: 3, text: "def" }
                            ] }, qopts)];
                case 1:
                    rows = _a.sent();
                    expect(rows).toEqual([
                        { x: "abc", y: 2 },
                        { x: "def", y: 1 }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test("orderby query with limit", function () { return __awaiter(_this, void 0, void 0, function () {
        var qopts, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qopts = {
                        select: { x: { type: "field", table: "t1", column: "text" } },
                        from: "t1",
                        orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }],
                        limit: 2
                    };
                    return [4 /*yield*/, performQuery({ t1: [
                                { id: 1, text: "a", number: 1 },
                                { id: 2, text: "b", number: 2 },
                                { id: 3, text: "c", number: 3 }
                            ] }, qopts)];
                case 1:
                    rows = _a.sent();
                    expect(rows).toEqual([
                        { x: "c" },
                        { x: "b" }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test("n-1 join", function () { return __awaiter(_this, void 0, void 0, function () {
        var qopts, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qopts = {
                        select: { x: { type: "field", table: "t2", column: "2-1" } },
                        from: "t2"
                    };
                    return [4 /*yield*/, performQuery({ t1: [
                                { id: "a", text: "a", number: 1 }
                            ], t2: [
                                { id: 1, text: "a", number: 1, "2-1": "a" }
                            ] }, qopts)];
                case 1:
                    rows = _a.sent();
                    expect(rows).toEqual([
                        { x: "a" }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test("n-1 scalar", function () { return __awaiter(_this, void 0, void 0, function () {
        var qopts, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qopts = {
                        select: { x: { type: "scalar", joins: ["2-1"], table: "t2", expr: { type: "field", table: "t1", column: "text" } } },
                        from: "t2"
                    };
                    return [4 /*yield*/, performQuery({ t1: [
                                { id: 1, text: "abc" }
                            ], t2: [
                                { id: 101, "2-1": 1 }
                            ] }, qopts)];
                case 1:
                    rows = _a.sent();
                    expect(rows).toEqual([
                        { x: "abc" }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test("1-n scalar", function () { return __awaiter(_this, void 0, void 0, function () {
        var qopts, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qopts = {
                        select: { x: { type: "scalar", joins: ["1-2"], table: "t1", expr: {
                                    type: "op", op: "sum", table: "t1", exprs: [{ type: "field", table: "t2", column: "number" }]
                                } } },
                        from: "t1"
                    };
                    return [4 /*yield*/, performQuery({ t1: [
                                { id: 1 },
                                { id: 2 }
                            ], t2: [
                                { id: 101, "2-1": 1, number: 1 },
                                { id: 102, "2-1": 1, number: 2 },
                                { id: 103, "2-1": 2, number: 4 }
                            ] }, qopts)];
                case 1:
                    rows = _a.sent();
                    expect(rows).toEqual([
                        { x: 3 },
                        { x: 4 }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test("caches backend queries", function () { return __awaiter(_this, void 0, void 0, function () {
        var qopts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qopts = {
                        select: { x: { type: "field", table: "t1", column: "text" } },
                        from: "t1"
                    };
                    return [4 /*yield*/, performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts)
                        // Should not crash as uses cached query
                    ];
                case 1:
                    _a.sent();
                    // Should not crash as uses cached query
                    return [4 /*yield*/, performQuery(null, qopts)];
                case 2:
                    // Should not crash as uses cached query
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe("transactions", function () {
        var numberField = { type: "field", table: "t1", column: "number" };
        var qopts = {
            select: { x: numberField },
            from: "t1",
            where: { type: "op", op: ">", table: "t1", exprs: [
                    numberField,
                    { type: "literal", valueType: "number", value: 3 }
                ] },
            orderBy: [{ expr: numberField, dir: "asc" }]
        };
        test("waits until transaction committed", function () { return __awaiter(_this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vdb.transaction().addRow("t1", { number: 6 });
                        return [4 /*yield*/, performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)];
                    case 1:
                        rows = _a.sent();
                        expect(rows).toEqual([
                            { x: 5 }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("insert relevant row", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        txn.addRow("t1", { number: 6 });
                        txn.commit();
                        return [4 /*yield*/, performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)];
                    case 1:
                        rows = _a.sent();
                        expect(rows).toEqual([
                            { x: 5 },
                            { x: 6 }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("insert irrelevant rows", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        txn.addRow("t1", { number: 1 });
                        txn.addRow("t2", { number: 6 });
                        txn.commit();
                        return [4 /*yield*/, performQuery({ t1: [{ id: 1, number: 5 }] }, qopts)];
                    case 1:
                        rows = _a.sent();
                        expect(rows).toEqual([
                            { x: 5 }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("update relevant row", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        txn.updateRow("t1", 1, { number: 7 });
                        txn.commit();
                        return [4 /*yield*/, performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts)];
                    case 1:
                        rows = _a.sent();
                        expect(rows).toEqual([
                            { x: 6 },
                            { x: 7 }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("update relevant row to become irrelevant", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        txn.updateRow("t1", 1, { number: 2 });
                        txn.commit();
                        return [4 /*yield*/, performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts)];
                    case 1:
                        rows = _a.sent();
                        expect(rows).toEqual([
                            { x: 6 }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("remove relevant row", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        txn.removeRow("t1", 1);
                        txn.commit();
                        return [4 /*yield*/, performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts)];
                    case 1:
                        rows = _a.sent();
                        expect(rows).toEqual([
                            { x: 6 }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("notifies change listener", function () { return __awaiter(_this, void 0, void 0, function () {
            var changeListener, txn;
            return __generator(this, function (_a) {
                changeListener = jest.fn();
                vdb.addChangeListener(changeListener);
                txn = vdb.transaction();
                txn.removeRow("t1", 1);
                expect(changeListener.mock.calls.length).toBe(0);
                txn.commit();
                expect(changeListener.mock.calls.length).toBe(1);
                return [2 /*return*/];
            });
        }); });
        test("commits changes", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, pk, mockTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        pk = txn.addRow("t1", { number: 1 });
                        txn.removeRow("t1", 1);
                        txn.commit();
                        mockTransaction = {
                            addRow: jest.fn(),
                            updateRow: jest.fn(),
                            removeRow: jest.fn(),
                            commit: jest.fn()
                        };
                        db.transaction.mockReturnValue(mockTransaction);
                        // Commit to underlying database
                        return [4 /*yield*/, vdb.commit()];
                    case 1:
                        // Commit to underlying database
                        _a.sent();
                        expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 1 }]);
                        expect(mockTransaction.removeRow.mock.calls[0]).toEqual(["t1", 1]);
                        expect(function () { return vdb.transaction(); }).toThrow();
                        return [2 /*return*/];
                }
            });
        }); });
        test("substitutes temporary primary keys", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, pk, pk2, mockTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        return [4 /*yield*/, txn.addRow("t1", { number: 1 })];
                    case 1:
                        pk = _a.sent();
                        return [4 /*yield*/, txn.addRow("t2", { "2-1": pk })];
                    case 2:
                        pk2 = _a.sent();
                        return [4 /*yield*/, txn.commit()
                            // Mock underlying transaction
                        ];
                    case 3:
                        _a.sent();
                        mockTransaction = {
                            addRow: jest.fn(),
                            updateRow: jest.fn(),
                            removeRow: jest.fn(),
                            commit: jest.fn()
                        };
                        db.transaction.mockReturnValue(mockTransaction);
                        // Mock return pks
                        mockTransaction.addRow.mockResolvedValueOnce("PKA");
                        mockTransaction.addRow.mockResolvedValueOnce("PKB");
                        // Commit to underlying database
                        return [4 /*yield*/, vdb.commit()];
                    case 4:
                        // Commit to underlying database
                        _a.sent();
                        expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 1 }]);
                        expect(mockTransaction.addRow.mock.calls[1]).toEqual(["t2", { "2-1": "PKA" }]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("removes virtual rows locally", function () { return __awaiter(_this, void 0, void 0, function () {
            var txn, pk, mockTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txn = vdb.transaction();
                        return [4 /*yield*/, txn.addRow("t1", { number: 1 })];
                    case 1:
                        pk = _a.sent();
                        return [4 /*yield*/, txn.updateRow("t1", pk, { number: 2 })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, txn.removeRow("t2", pk)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, txn.commit()
                            // Mock underlying transaction
                        ];
                    case 4:
                        _a.sent();
                        mockTransaction = {
                            addRow: jest.fn(),
                            updateRow: jest.fn(),
                            removeRow: jest.fn(),
                            commit: jest.fn()
                        };
                        db.transaction.mockReturnValue(mockTransaction);
                        // Commit to underlying database
                        return [4 /*yield*/, vdb.commit()];
                    case 5:
                        // Commit to underlying database
                        _a.sent();
                        expect(mockTransaction.addRow.mock.calls.length).toBe(0);
                        expect(mockTransaction.updateRow.mock.calls.length).toBe(0);
                        expect(mockTransaction.removeRow.mock.calls.length).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=VirtualDatabase.test.js.map