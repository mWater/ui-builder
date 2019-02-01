"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class NullDatabase {
    query(options, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener) { return; }
    removeChangeListener(changeListener) { return; }
    transaction() { return new NullTransaction(); }
}
exports.NullDatabase = NullDatabase;
class NullTransaction {
    /** Adds a row, returning the primary key as a promise */
    addRow(table, values) {
        return __awaiter(this, void 0, void 0, function* () { return null; });
    }
    updateRow(table, primaryKey, updates) {
        return __awaiter(this, void 0, void 0, function* () { return; });
    }
    removeRow(table, primaryKey) {
        return __awaiter(this, void 0, void 0, function* () { return; });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () { return; });
    }
}
//# sourceMappingURL=Database.js.map