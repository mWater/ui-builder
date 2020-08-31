"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceDatabase = void 0;
var lodash_1 = __importDefault(require("lodash"));
var QueryCompiler_1 = require("./QueryCompiler");
var blocks_1 = require("../widgets/blocks");
/** Database which is driven from a data source. Changes must be handled externally and updates triggered manually */
var DataSourceDatabase = /** @class */ (function () {
    function DataSourceDatabase(schema, dataSource, transactionHandler) {
        this.schema = schema;
        this.dataSource = dataSource;
        this.transactionHandler = transactionHandler;
        this.changeListeners = [];
    }
    DataSourceDatabase.prototype.query = function (options, contextVars, filteredContextVarValues) {
        var _this = this;
        var queryCompiler = new QueryCompiler_1.QueryCompiler(this.schema, blocks_1.createExprVariables(contextVars), filteredContextVarValues);
        var _a = queryCompiler.compileQuery(options), jsonql = _a.jsonql, rowMapper = _a.rowMapper;
        return new Promise(function (resolve, reject) {
            _this.dataSource.performQuery(jsonql, function (error, rows) {
                if (error) {
                    reject(error);
                }
                else {
                    // Transform rows to remove c_ from columns
                    resolve(rows.map(rowMapper));
                }
            });
        });
    };
    /** Adds a listener which is called with each change to the database */
    DataSourceDatabase.prototype.addChangeListener = function (changeListener) {
        this.changeListeners = lodash_1.default.union(this.changeListeners, [changeListener]);
    };
    DataSourceDatabase.prototype.removeChangeListener = function (changeListener) {
        this.changeListeners = lodash_1.default.difference(this.changeListeners, [changeListener]);
    };
    /** Force change event to fire after clearing cache */
    DataSourceDatabase.prototype.triggerChange = function () {
        this.dataSource.clearCache();
        for (var _i = 0, _a = this.changeListeners; _i < _a.length; _i++) {
            var changeListener = _a[_i];
            changeListener();
        }
    };
    DataSourceDatabase.prototype.transaction = function () {
        if (!this.transactionHandler) {
            throw new Error("Not implemented");
        }
        return this.transactionHandler();
    };
    return DataSourceDatabase;
}());
exports.DataSourceDatabase = DataSourceDatabase;
