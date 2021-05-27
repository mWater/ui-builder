"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const VirtualDatabase_1 = __importDefault(require("./VirtualDatabase"));
const mockDatabase_1 = __importDefault(require("../__fixtures__/mockDatabase"));
const schema_1 = __importDefault(require("../__fixtures__/schema"));
const mwater_expressions_1 = require("mwater-expressions");
const _ = __importStar(require("lodash"));
const schema = schema_1.default();
let db;
let vdb;
const t2Where = {
    type: "op",
    op: "=",
    table: "t2",
    exprs: [
        { type: "field", table: "t2", column: "number" },
        { type: "literal", valueType: "number", value: 5 }
    ]
};
beforeEach(() => {
    db = mockDatabase_1.default();
    vdb = new VirtualDatabase_1.default(db, schema, "en");
});
/** Simulates a change to the virtual database to prevent passthrough */
const preventPassthrough = () => {
    const tx = vdb.transaction();
    tx.removeRow("t1", "NONSUCH");
    tx.removeRow("t2", "NONSUCH");
    tx.commit();
};
test("shouldIncludeColumn includes regular columns and joins without inverse", () => {
    expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" } })).toBe(true);
    expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" }, expr: { type: "literal", valueType: "text", value: "xyz" } })).toBe(false);
    expect(vdb.shouldIncludeColumn(schema.getColumn("t1", "1-2"))).toBe(false);
    expect(vdb.shouldIncludeColumn(schema.getColumn("t2", "id1"))).toBe(true);
});
test("trigger change if underlying database changed", () => {
    let changed = false;
    vdb.addChangeListener(() => { changed = true; });
    // Fire change
    db.addChangeListener.mock.calls[0][0]();
    expect(changed).toBe(true);
});
test("queries with where clause and included columns", () => __awaiter(void 0, void 0, void 0, function* () {
    db.query.mockResolvedValue([]);
    preventPassthrough(); // Test how queries are transformed by preventing passthrough
    yield vdb.query({
        select: {
            x: { type: "field", table: "t2", column: "text" }
        },
        from: "t2",
        where: t2Where,
        orderBy: [{ expr: { type: "field", table: "t2", column: "text" }, dir: "desc" }],
        limit: 10
    }, [], {});
    expect(db.query.mock.calls[0][0]).toEqual({
        select: {
            id: { type: "id", table: "t2" },
            c_text: { type: "field", table: "t2", column: "text" },
            c_number: { type: "field", table: "t2", column: "number" },
            c_id1: { type: "field", table: "t2", column: "id1" }
        },
        from: "t2",
        where: t2Where
    });
}));
describe("select, order, limit", () => {
    const performQuery = (rawRowsByTable, queryOptions) => __awaiter(void 0, void 0, void 0, function* () {
        // Set up mock database to return raw rows with c_ prefixed on column names
        // This simulates a real database call
        db.query = ((qo) => __awaiter(void 0, void 0, void 0, function* () {
            // Get rows
            let rows;
            rows = rawRowsByTable[qo.from];
            // Filter rows by where
            if (qo.where) {
                const exprEval = new mwater_expressions_1.PromiseExprEvaluator({ schema });
                const filteredRows = [];
                for (const row of rows) {
                    const evalRow = {
                        getPrimaryKey: () => Promise.resolve(row.id),
                        getField: (columnId) => Promise.resolve(row[columnId]),
                        followJoin: (columnId) => Promise.reject(new Error("Not implemented"))
                    };
                    if (yield exprEval.evaluate(qo.where, { row: evalRow })) {
                        filteredRows.push(row);
                    }
                }
                rows = filteredRows;
            }
            // Prepend c_ to non-id columns
            rows = rows.map((row) => _.mapKeys(row, (v, k) => k === "id" ? "id" : "c_" + k));
            return rows;
        }));
        // Perform query
        return vdb.query(queryOptions, [], {});
    });
    test("simple query", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "field", table: "t1", column: "text" } },
            from: "t1"
        };
        const rows = yield performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts);
        expect(rows).toEqual([
            { x: "abc" }
        ]);
    }));
    test("aggr count expr", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: {
                x: { type: "field", table: "t1", column: "text" },
                y: { type: "op", table: "t1", op: "count", exprs: [] }
            },
            from: "t1"
        };
        const rows = yield performQuery({ t1: [
                { id: 1, text: "abc" },
                { id: 2, text: "abc" },
                { id: 3, text: "def" }
            ] }, qopts);
        expect(rows).toEqual([
            { x: "abc", y: 2 },
            { x: "def", y: 1 }
        ]);
    }));
    test("count empty", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: {
                x: { type: "op", table: "t1", op: "count", exprs: [] }
            },
            from: "t1"
        };
        const rows = yield performQuery({ t1: [] }, qopts);
        expect(rows).toEqual([
            { x: 0 },
        ]);
    }));
    test("orderby query with limit", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "field", table: "t1", column: "text" } },
            from: "t1",
            orderBy: [{ expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }],
            limit: 2
        };
        const rows = yield performQuery({ t1: [
                { id: 1, text: "a", number: 1 },
                { id: 2, text: "b", number: 2 },
                { id: 3, text: "c", number: 3 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: "c" },
            { x: "b" }
        ]);
    }));
    test("orderby query with capitalization", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "id", table: "t1" } },
            from: "t1",
            orderBy: [
                { expr: { type: "field", table: "t1", column: "text" }, dir: "asc" },
                { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
            ],
        };
        const rows = yield performQuery({ t1: [
                { id: 1, text: "a", number: 1 },
                { id: 2, text: "a", number: 2 },
                { id: 3, text: "b", number: 3 },
                { id: 4, text: "A", number: 4 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: 2 },
            { x: 1 },
            { x: 4 },
            { x: 3 }
        ]);
    }));
    test("orderby query with nulls", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "id", table: "t1" } },
            from: "t1",
            orderBy: [
                { expr: { type: "field", table: "t1", column: "text" }, dir: "asc" },
                { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
            ],
        };
        const rows = yield performQuery({ t1: [
                { id: 1, text: "a", number: 1 },
                { id: 2, text: null, number: 2 },
                { id: 3, text: "b", number: 3 },
                { id: 4, text: "z", number: 4 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: 1 },
            { x: 3 },
            { x: 4 },
            { x: 2 }
        ]);
    }));
    test("orderby query with numbers", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "id", table: "t1" } },
            from: "t1",
            orderBy: [
                { expr: { type: "field", table: "t1", column: "number" }, dir: "desc" }
            ],
        };
        const rows = yield performQuery({ t1: [
                { id: 1, number: 1 },
                { id: 2, number: 2 },
                { id: 3, number: 3 },
                { id: 4, number: 11 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: 4 },
            { x: 3 },
            { x: 2 },
            { x: 1 }
        ]);
    }));
    test("id join", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "field", table: "t2", column: "id1" } },
            from: "t2"
        };
        const rows = yield performQuery({ t1: [
                { id: "a", text: "a", number: 1 }
            ], t2: [
                { id: 1, text: "a", number: 1, "id1": "a" }
            ] }, qopts);
        expect(rows).toEqual([
            { x: "a" }
        ]);
    }));
    test("n-1 scalar", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "scalar", joins: ["id1"], table: "t2", expr: { type: "field", table: "t1", column: "text" } } },
            from: "t2"
        };
        const rows = yield performQuery({ t1: [
                { id: 1, text: "abc" }
            ], t2: [
                { id: 101, "id1": 1 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: "abc" }
        ]);
    }));
    test("1-n scalar", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "scalar", joins: ["1-2"], table: "t1", expr: {
                        type: "op", op: "sum", table: "t1", exprs: [{ type: "field", table: "t2", column: "number" }]
                    } } },
            from: "t1"
        };
        const rows = yield performQuery({ t1: [
                { id: 1 },
                { id: 2 }
            ], t2: [
                { id: 101, "id1": 1, number: 1 },
                { id: 102, "id1": 1, number: 2 },
                { id: 103, "id1": 2, number: 4 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: 3 },
            { x: 4 }
        ]);
    }));
    test("caches backend queries", () => __awaiter(void 0, void 0, void 0, function* () {
        preventPassthrough(); // Test how queries are transformed by preventing passthrough
        const qopts = {
            select: { x: { type: "field", table: "t1", column: "text" } },
            from: "t1"
        };
        yield performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts);
        // Should not crash as uses cached query
        yield performQuery(null, qopts);
    }));
    test("does not query rows that are not yet added", () => __awaiter(void 0, void 0, void 0, function* () {
        const tx = vdb.transaction();
        const pk = yield tx.addRow("t1", {});
        yield tx.commit();
        const qopts = {
            select: { x: { type: "field", table: "t1", column: "text" } },
            from: "t1",
            where: { type: "op", table: "t1", op: "=", exprs: [
                    { type: "id", table: "t1" },
                    { type: "literal", valueType: "id", value: pk }
                ] }
        };
        // Should not crash as doesn't pass along
        yield performQuery(null, qopts);
    }));
    describe("transactions", () => {
        const numberField = { type: "field", table: "t1", column: "number" };
        const qopts = {
            select: { x: numberField },
            from: "t1",
            where: { type: "op", op: ">", table: "t1", exprs: [
                    numberField,
                    { type: "literal", valueType: "number", value: 3 }
                ] },
            orderBy: [{ expr: numberField, dir: "asc" }]
        };
        test("waits until transaction committed", () => __awaiter(void 0, void 0, void 0, function* () {
            preventPassthrough(); // Test how queries are transformed by preventing passthrough
            vdb.transaction().addRow("t1", { number: 6 });
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }] }, qopts);
            expect(rows).toEqual([
                { x: 5 }
            ]);
        }));
        test("insert relevant row", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            yield txn.addRow("t1", { number: 6 });
            yield txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }] }, qopts);
            expect(rows).toEqual([
                { x: 5 },
                { x: 6 }
            ]);
        }));
        test("insert irrelevant rows", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            yield txn.addRow("t1", { number: 1 });
            yield txn.addRow("t2", { number: 6 });
            yield txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }] }, qopts);
            expect(rows).toEqual([
                { x: 5 }
            ]);
        }));
        test("update relevant row", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.updateRow("t1", 1, { number: 7 });
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts);
            expect(rows).toEqual([
                { x: 6 },
                { x: 7 }
            ]);
        }));
        test("update relevant row to become irrelevant", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.updateRow("t1", 1, { number: 2 });
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts);
            expect(rows).toEqual([
                { x: 6 }
            ]);
        }));
        test("update irrelevant row to become relevant", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.updateRow("t1", 1, { number: 7 });
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 2 }, { id: 2, number: 6 }] }, qopts);
            expect(rows).toEqual([
                { x: 6 },
                { x: 7 }
            ]);
        }));
        test("remove relevant row", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.removeRow("t1", 1);
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts);
            expect(rows).toEqual([
                { x: 6 }
            ]);
        }));
        test("notifies change listener", () => __awaiter(void 0, void 0, void 0, function* () {
            const changeListener = jest.fn();
            vdb.addChangeListener(changeListener);
            const txn = vdb.transaction();
            txn.removeRow("t1", 1);
            expect(changeListener.mock.calls.length).toBe(0);
            txn.commit();
            expect(changeListener.mock.calls.length).toBe(1);
        }));
        test("commits changes", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create changes
            const txn = vdb.transaction();
            const pk = yield txn.addRow("t1", { number: 1 });
            yield txn.removeRow("t1", 1);
            yield txn.commit();
            // Mock underlying transaction
            const mockTransaction = {
                addRow: jest.fn(),
                updateRow: jest.fn(),
                removeRow: jest.fn(),
                commit: jest.fn()
            };
            db.transaction.mockReturnValue(mockTransaction);
            // Commit to underlying database
            yield vdb.commit();
            expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 1 }]);
            expect(mockTransaction.removeRow.mock.calls[0]).toEqual(["t1", 1]);
            expect(() => vdb.transaction()).toThrow();
        }));
        test("shortcuts updating inserted row", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            const pk = yield txn.addRow("t1", { number: 1 });
            yield txn.updateRow("t1", pk, { number: 2 });
            yield txn.commit();
            expect(vdb.mutations).toEqual([{
                    type: "add",
                    table: "t1",
                    primaryKey: pk,
                    values: { number: 2 }
                }]);
        }));
        test("shortcuts updating row", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            yield txn.updateRow("t1", 1, { number: 2 });
            yield txn.updateRow("t1", 1, { number: 3 });
            yield txn.commit();
            expect(vdb.mutations).toEqual([{
                    type: "update",
                    table: "t1",
                    primaryKey: 1,
                    updates: { number: 3 }
                }]);
        }));
        test("shortcuts removing inserted row", () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = vdb.transaction();
            const pk = yield txn.addRow("t1", { number: 1 });
            yield txn.removeRow("t1", pk);
            yield txn.commit();
            expect(vdb.mutations).toEqual([]);
        }));
        test("substitutes temporary primary keys", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create changes
            const txn = vdb.transaction();
            const pk = yield txn.addRow("t1", { number: 1 });
            yield txn.updateRow("t1", pk, { number: 2 });
            const pk2 = yield txn.addRow("t2", { "2-1": pk });
            yield txn.commit();
            // Mock underlying transaction
            const mockTransaction = {
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
            yield vdb.commit();
            expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 2 }]);
            expect(mockTransaction.addRow.mock.calls[1]).toEqual(["t2", { "2-1": "PKA" }]);
        }));
        test("removes virtual rows locally", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create changes
            const txn = vdb.transaction();
            const pk = yield txn.addRow("t1", { number: 1 });
            yield txn.updateRow("t1", pk, { number: 2 });
            yield txn.removeRow("t2", pk);
            yield txn.commit();
            // Mock underlying transaction
            const mockTransaction = {
                addRow: jest.fn(),
                updateRow: jest.fn(),
                removeRow: jest.fn(),
                commit: jest.fn()
            };
            db.transaction.mockReturnValue(mockTransaction);
            // Commit to underlying database
            yield vdb.commit();
            expect(mockTransaction.addRow.mock.calls.length).toBe(0);
            expect(mockTransaction.updateRow.mock.calls.length).toBe(0);
            expect(mockTransaction.removeRow.mock.calls.length).toBe(0);
        }));
    });
});
