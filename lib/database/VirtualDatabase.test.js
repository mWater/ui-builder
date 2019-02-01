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
const VirtualDatabase_1 = __importDefault(require("./VirtualDatabase"));
const mockDatabase_1 = __importDefault(require("../__fixtures__/mockDatabase"));
const schema_1 = __importDefault(require("../__fixtures__/schema"));
const mwater_expressions_1 = require("mwater-expressions");
const _ = __importStar(require("lodash"));
const PromiseExprEvaluator_1 = require("./PromiseExprEvaluator");
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
test("shouldIncludeColumn includes regular columns and joins without inverse", () => {
    expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" } })).toBe(true);
    expect(vdb.shouldIncludeColumn({ id: "text", type: "text", name: { _base: "en" }, expr: { type: "literal", valueType: "text", value: "xyz" } })).toBe(false);
    expect(vdb.shouldIncludeColumn(schema.getColumn("t1", "1-2"))).toBe(false);
    expect(vdb.shouldIncludeColumn(schema.getColumn("t2", "2-1"))).toBe(true);
});
test("trigger change if underlying database changed", () => {
    let changed = false;
    vdb.addChangeListener(() => { changed = true; });
    // Fire change
    db.addChangeListener.mock.calls[0][0]();
    expect(changed).toBe(true);
});
test("queries with where clause and included columns", () => __awaiter(this, void 0, void 0, function* () {
    db.query.mockResolvedValue([]);
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
            "c_2-1": { type: "field", table: "t2", column: "2-1" }
        },
        from: "t2",
        where: t2Where
    });
}));
describe("select, order, limit", () => {
    const performQuery = (rawRowsByTable, queryOptions) => __awaiter(this, void 0, void 0, function* () {
        // Set up mock database to return raw rows with c_ prefixed on column names
        // This simulates a real database call
        db.query = ((qo) => __awaiter(this, void 0, void 0, function* () {
            // Get rows
            let rows;
            rows = rawRowsByTable[qo.from];
            // Filter rows by where
            if (qo.where) {
                const exprEval = new PromiseExprEvaluator_1.PromiseExprEvaluator(new mwater_expressions_1.ExprEvaluator(schema));
                const filteredRows = [];
                for (const row of rows) {
                    const evalRow = {
                        getPrimaryKey: () => Promise.resolve(row.id),
                        getField: (columnId) => Promise.resolve(row[columnId])
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
    test("simple query", () => __awaiter(this, void 0, void 0, function* () {
        const qopts = {
            select: { x: { type: "field", table: "t1", column: "text" } },
            from: "t1"
        };
        const rows = yield performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts);
        expect(rows).toEqual([
            { x: "abc" }
        ]);
    }));
    test("aggr count expr", () => __awaiter(this, void 0, void 0, function* () {
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
    test("orderby query with limit", () => __awaiter(this, void 0, void 0, function* () {
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
    test("n-1 join", () => __awaiter(this, void 0, void 0, function* () {
        const qopts = {
            select: { x: { type: "field", table: "t2", column: "2-1" } },
            from: "t2"
        };
        const rows = yield performQuery({ t1: [
                { id: "a", text: "a", number: 1 }
            ], t2: [
                { id: 1, text: "a", number: 1, "2-1": "a" }
            ] }, qopts);
        expect(rows).toEqual([
            { x: "a" }
        ]);
    }));
    test("n-1 scalar", () => __awaiter(this, void 0, void 0, function* () {
        const qopts = {
            select: { x: { type: "scalar", joins: ["2-1"], table: "t2", expr: { type: "field", table: "t1", column: "text" } } },
            from: "t2"
        };
        const rows = yield performQuery({ t1: [
                { id: 1, text: "abc" }
            ], t2: [
                { id: 101, "2-1": 1 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: "abc" }
        ]);
    }));
    test("1-n scalar", () => __awaiter(this, void 0, void 0, function* () {
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
                { id: 101, "2-1": 1, number: 1 },
                { id: 102, "2-1": 1, number: 2 },
                { id: 103, "2-1": 2, number: 4 }
            ] }, qopts);
        expect(rows).toEqual([
            { x: 3 },
            { x: 4 }
        ]);
    }));
    test("caches backend queries", () => __awaiter(this, void 0, void 0, function* () {
        const qopts = {
            select: { x: { type: "field", table: "t1", column: "text" } },
            from: "t1"
        };
        yield performQuery({ t1: [{ id: 1, text: "abc" }] }, qopts);
        // Should not crash as uses cached query
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
        test("waits until transaction committed", () => __awaiter(this, void 0, void 0, function* () {
            vdb.transaction().addRow("t1", { number: 6 });
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }] }, qopts);
            expect(rows).toEqual([
                { x: 5 }
            ]);
        }));
        test("insert relevant row", () => __awaiter(this, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.addRow("t1", { number: 6 });
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }] }, qopts);
            expect(rows).toEqual([
                { x: 5 },
                { x: 6 }
            ]);
        }));
        test("insert irrelevant rows", () => __awaiter(this, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.addRow("t1", { number: 1 });
            txn.addRow("t2", { number: 6 });
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }] }, qopts);
            expect(rows).toEqual([
                { x: 5 }
            ]);
        }));
        test("update relevant row", () => __awaiter(this, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.updateRow("t1", 1, { number: 7 });
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts);
            expect(rows).toEqual([
                { x: 6 },
                { x: 7 }
            ]);
        }));
        test("update relevant row to become irrelevant", () => __awaiter(this, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.updateRow("t1", 1, { number: 2 });
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts);
            expect(rows).toEqual([
                { x: 6 }
            ]);
        }));
        test("remove relevant row", () => __awaiter(this, void 0, void 0, function* () {
            const txn = vdb.transaction();
            txn.removeRow("t1", 1);
            txn.commit();
            const rows = yield performQuery({ t1: [{ id: 1, number: 5 }, { id: 2, number: 6 }] }, qopts);
            expect(rows).toEqual([
                { x: 6 }
            ]);
        }));
        test("notifies change listener", () => __awaiter(this, void 0, void 0, function* () {
            const changeListener = jest.fn();
            vdb.addChangeListener(changeListener);
            const txn = vdb.transaction();
            txn.removeRow("t1", 1);
            expect(changeListener.mock.calls.length).toBe(0);
            txn.commit();
            expect(changeListener.mock.calls.length).toBe(1);
        }));
        test("commits changes", () => __awaiter(this, void 0, void 0, function* () {
            // Create changes
            const txn = vdb.transaction();
            const pk = txn.addRow("t1", { number: 1 });
            txn.removeRow("t1", 1);
            txn.commit();
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
        test("substitutes temporary primary keys", () => __awaiter(this, void 0, void 0, function* () {
            // Create changes
            const txn = vdb.transaction();
            const pk = yield txn.addRow("t1", { number: 1 });
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
            expect(mockTransaction.addRow.mock.calls[0]).toEqual(["t1", { number: 1 }]);
            expect(mockTransaction.addRow.mock.calls[1]).toEqual(["t2", { "2-1": "PKA" }]);
        }));
        test("removes virtual rows locally", () => __awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=VirtualDatabase.test.js.map