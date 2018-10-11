export var OrderByDir;
(function (OrderByDir) {
    OrderByDir["asc"] = "asc";
    OrderByDir["desc"] = "desc";
})(OrderByDir || (OrderByDir = {}));
export class MockDatabase {
    async query(options, contextVars, contextVarValues) { return []; }
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener) { return; }
    removeChangeListener(changeListener) { return; }
    transaction() { return new MockTransaction(); }
}
class MockTransaction {
    /** Adds a row, returning the primary key as a promise */
    async addRow(table, values) { return null; }
    async updateRow(table, primaryKey, updates) { return; }
    async removeRow(table, primaryKey) { return; }
    async commit() { return; }
}
//# sourceMappingURL=Database.js.map