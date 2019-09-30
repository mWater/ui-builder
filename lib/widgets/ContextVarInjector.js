"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var blocks_1 = require("./blocks");
var React = __importStar(require("react"));
var mwater_expressions_1 = require("mwater-expressions");
var canonical_json_1 = __importDefault(require("canonical-json"));
var _ = __importStar(require("lodash"));
/** Injects one context variable into the inner render instance props.
 * Holds state of the filters that are applied to rowset-type context vars
 * Computes values of expressions for row and rowset types
 */
var ContextVarInjector = /** @class */ (function (_super) {
    __extends(ContextVarInjector, _super);
    function ContextVarInjector(props) {
        var _this = _super.call(this, props) || this;
        _this.handleDatabaseChange = function () {
            _this.performQueries();
        };
        _this.state = {
            filters: props.initialFilters || [],
            loading: true,
            refreshing: false,
            exprValues: {},
            contextVarValues: props.renderInstanceProps.contextVarValues
        };
        _this.unmounted = false;
        return _this;
    }
    ContextVarInjector.prototype.componentDidMount = function () {
        this.performQueries();
        // Listen for changes to database
        this.props.database.addChangeListener(this.handleDatabaseChange);
    };
    ContextVarInjector.prototype.componentDidUpdate = function (prevProps, prevState) {
        // If value change, filters change, or any context var values changes, refresh
        // TODO context var value changes are only relevant if referenced as a variable. Could be optimized
        if (!_.isEqual(prevProps.value, this.props.value)
            || !_.isEqual(prevState.filters, this.state.filters)
            || !_.isEqual(this.props.renderInstanceProps.contextVarValues, this.state.contextVarValues)) {
            this.performQueries();
        }
    };
    ContextVarInjector.prototype.componentWillUnmount = function () {
        this.unmounted = true;
        this.props.database.removeChangeListener(this.handleDatabaseChange);
    };
    ContextVarInjector.prototype.createRowQueryOptions = function (table) {
        var queryOptions = {
            select: {},
            from: table,
            where: {
                type: "op",
                op: "=",
                table: table,
                exprs: [{ type: "id", table: table }, { type: "literal", valueType: "id", idTable: table, value: this.props.value }]
            }
        };
        // Add expressions as selects
        for (var i = 0; i < this.props.contextVarExprs.length; i++) {
            queryOptions.select["e" + i] = this.props.contextVarExprs[i];
        }
        return queryOptions;
    };
    ContextVarInjector.prototype.createRowsetQueryOptions = function (table, variables) {
        var queryOptions = {
            select: {},
            from: table,
            where: this.props.value,
            limit: 1
        };
        // Add expressions as selects (only if aggregate for rowset)
        var exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema, variables);
        var nonAggrExpressions = this.props.contextVarExprs.filter(function (expr) { return exprUtils.getExprAggrStatus(expr) === "aggregate" || exprUtils.getExprAggrStatus(expr) === "literal"; });
        // Add expressions as selects
        for (var i = 0; i < nonAggrExpressions.length; i++) {
            queryOptions.select["e" + i] = nonAggrExpressions[i];
        }
        // Add filters
        if (this.state.filters.length > 0) {
            queryOptions.where = {
                type: "op",
                table: table,
                op: "and",
                exprs: _.compact([queryOptions.where || null].concat(_.compact(this.state.filters.map(function (f) { return f.expr; }))))
            };
            if (queryOptions.where.exprs.length === 0) {
                queryOptions.where = null;
            }
        }
        return queryOptions;
    };
    ContextVarInjector.prototype.performQueries = function () {
        return __awaiter(this, void 0, void 0, function () {
            var innerProps, variables, variableValues, table, queryOptions, rows, exprValues, i, error_1, table, queryOptions, rows, exprUtils_1, nonAggrExpressions, exprValues, i, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        innerProps = this.createInnerProps();
                        variables = blocks_1.createExprVariables(innerProps.contextVars);
                        variableValues = innerProps.contextVarValues;
                        this.setState({ refreshing: true, contextVarValues: this.props.renderInstanceProps.contextVarValues });
                        if (!(this.props.injectedContextVar.type === "row" && this.props.contextVarExprs.length > 0)) return [3 /*break*/, 4];
                        // Special case of null row value
                        if (this.props.value == null) {
                            this.setState({ exprValues: {}, loading: false, refreshing: false, contextVarValues: this.props.renderInstanceProps.contextVarValues });
                            return [2 /*return*/];
                        }
                        this.setState({ refreshing: true });
                        table = this.props.injectedContextVar.table;
                        queryOptions = this.createRowQueryOptions(table);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.props.database.query(queryOptions, innerProps.contextVars, innerProps.contextVarValues)
                            // Ignore if query options out of date
                        ];
                    case 2:
                        rows = _a.sent();
                        // Ignore if query options out of date
                        if (!_.isEqual(queryOptions, this.createRowQueryOptions(table))) {
                            return [2 /*return*/];
                        }
                        // Ignore if variable values out of date
                        if (!_.isEqual(variableValues, this.createInnerProps().contextVarValues)) {
                            return [2 /*return*/];
                        }
                        // Ignore if unmounted
                        if (this.unmounted) {
                            return [2 /*return*/];
                        }
                        if (rows.length === 0) {
                            this.setState({ exprValues: {} });
                        }
                        else {
                            exprValues = {};
                            for (i = 0; i < this.props.contextVarExprs.length; i++) {
                                exprValues[canonical_json_1.default(this.props.contextVarExprs[i])] = rows[0]["e" + i];
                            }
                            this.setState({ exprValues: exprValues });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.setState({ error: error_1 });
                        return [2 /*return*/];
                    case 4:
                        if (!(this.props.injectedContextVar.type === "rowset" && this.props.contextVarExprs.length > 0)) return [3 /*break*/, 8];
                        this.setState({ refreshing: true });
                        table = this.props.injectedContextVar.table;
                        queryOptions = this.createRowsetQueryOptions(table, variables);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.props.database.query(queryOptions, innerProps.contextVars, innerProps.contextVarValues)
                            // Ignore if query options out of date
                        ];
                    case 6:
                        rows = _a.sent();
                        // Ignore if query options out of date
                        if (!_.isEqual(queryOptions, this.createRowsetQueryOptions(table, variables))) {
                            return [2 /*return*/];
                        }
                        // Ignore if variable values out of date
                        if (!_.isEqual(variableValues, this.createInnerProps().contextVarValues)) {
                            return [2 /*return*/];
                        }
                        // Ignore if unmounted
                        if (this.unmounted) {
                            return [2 /*return*/];
                        }
                        exprUtils_1 = new mwater_expressions_1.ExprUtils(this.props.schema, variables);
                        nonAggrExpressions = this.props.contextVarExprs.filter(function (expr) { return exprUtils_1.getExprAggrStatus(expr) === "aggregate" || exprUtils_1.getExprAggrStatus(expr) === "literal"; });
                        if (rows.length === 0) {
                            this.setState({ exprValues: {} });
                        }
                        else {
                            exprValues = {};
                            for (i = 0; i < nonAggrExpressions.length; i++) {
                                exprValues[canonical_json_1.default(nonAggrExpressions[i])] = rows[0]["e" + i];
                            }
                            this.setState({ exprValues: exprValues });
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        this.setState({ error: error_2 });
                        return [2 /*return*/];
                    case 8:
                        this.setState({ refreshing: false, loading: false });
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Create props needed by inner component */
    ContextVarInjector.prototype.createInnerProps = function () {
        var _a;
        var _this = this;
        var outer = this.props.renderInstanceProps;
        // Get injected context variable value
        var value = this.props.value;
        // Create inner props
        var innerProps = __assign(__assign({}, outer), { database: this.props.database, contextVars: outer.contextVars.concat(this.props.injectedContextVar), contextVarValues: __assign(__assign({}, outer.contextVarValues), (_a = {}, _a[this.props.injectedContextVar.id] = value, _a)), getContextVarExprValue: function (contextVarId, expr) {
                if (contextVarId === _this.props.injectedContextVar.id) {
                    return _this.state.exprValues[canonical_json_1.default(expr)];
                }
                else {
                    return outer.getContextVarExprValue(contextVarId, expr);
                }
            }, setFilter: function (contextVarId, filter) {
                if (contextVarId === _this.props.injectedContextVar.id) {
                    // Remove existing with same id
                    var filters = _this.state.filters.filter(function (f) { return f.id !== filter.id; });
                    filters.push(filter);
                    return _this.setState({ filters: filters });
                }
                else {
                    return outer.setFilter(contextVarId, filter);
                }
            }, getFilters: function (contextVarId) {
                if (contextVarId === _this.props.injectedContextVar.id) {
                    return _this.state.filters;
                }
                else {
                    return outer.getFilters(contextVarId);
                }
            } });
        return innerProps;
    };
    ContextVarInjector.prototype.render = function () {
        if (this.state.error) {
            // TODO localize
            return React.createElement("div", { className: "alert alert-danger" }, "Error loading data");
        }
        return this.props.children(this.createInnerProps(), this.state.loading, this.state.refreshing);
    };
    return ContextVarInjector;
}(React.Component));
exports.default = ContextVarInjector;
