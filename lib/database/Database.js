export class NullDatabase {
    async query(options, contextVars, contextVarValues) { return []; }
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener) { return; }
    removeChangeListener(changeListener) { return; }
    transaction() { return new NullTransaction(); }
}
class NullTransaction {
    /** Adds a row, returning the primary key as a promise */
    async addRow(table, values) { return null; }
    async updateRow(table, primaryKey, updates) { return; }
    async removeRow(table, primaryKey) { return; }
    async commit() { return; }
}
//# sourceMappingURL=Database.js.map