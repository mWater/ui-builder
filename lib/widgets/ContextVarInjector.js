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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const blocks_1 = require("./blocks");
const React = __importStar(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const canonical_json_1 = __importDefault(require("canonical-json"));
const lodash_1 = __importDefault(require("lodash"));
const contexts_1 = require("../contexts");
/** Injects one context variable into the inner render instance props.
 * Holds state of the filters that are applied to rowset-type context vars
 * Computes values of expressions for row and rowset types
 */
class ContextVarInjector extends React.Component {
    constructor(props) {
        super(props);
        this.handleDatabaseChange = () => {
            this.performQueries();
        };
        this.state = {
            filters: props.initialFilters || [],
            loading: true,
            refreshing: false,
            exprValues: {},
            filteredContextVarValues: (0, contexts_1.getFilteredContextVarValues)(props.instanceCtx)
        };
        this.unmounted = false;
    }
    componentDidMount() {
        this.performQueries();
        // Listen for changes to database
        this.props.instanceCtx.database.addChangeListener(this.handleDatabaseChange);
    }
    componentDidUpdate(prevProps, prevState) {
        // If value change, filters change, or any context var values changes, refresh
        // TODO context var value changes are only relevant if referenced as a variable. Could be optimized
        if (!lodash_1.default.isEqual(prevProps.value, this.props.value)
            || !lodash_1.default.isEqual(prevState.filters, this.state.filters)
            || !lodash_1.default.isEqual((0, contexts_1.getFilteredContextVarValues)(this.createInnerProps()), this.state.filteredContextVarValues)) {
            this.performQueries();
        }
    }
    componentWillUnmount() {
        this.unmounted = true;
        this.props.instanceCtx.database.removeChangeListener(this.handleDatabaseChange);
    }
    createRowQueryOptions(table) {
        const queryOptions = {
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
        for (let i = 0; i < this.props.contextVarExprs.length; i++) {
            queryOptions.select["e" + i] = this.props.contextVarExprs[i];
        }
        return queryOptions;
    }
    /** Create query options for aggregate and literal expressions */
    createRowsetAggrQueryOptions(table, variables) {
        const queryOptions = {
            select: {},
            from: table,
            where: this.props.value,
            limit: 1
        };
        // Add expressions as selects (only if aggregate for rowset)
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.instanceCtx.schema, variables);
        const aggrExpressions = this.props.contextVarExprs.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate" || exprUtils.getExprAggrStatus(expr) === "literal");
        // Add expressions as selects
        for (let i = 0; i < aggrExpressions.length; i++) {
            queryOptions.select["e" + i] = aggrExpressions[i];
        }
        // Add filters
        if (this.state.filters.length > 0) {
            queryOptions.where = {
                type: "op",
                table: table,
                op: "and",
                exprs: lodash_1.default.compact([queryOptions.where || null].concat(lodash_1.default.compact(this.state.filters.map(f => f.expr))))
            };
            if (queryOptions.where.exprs.length === 0) {
                queryOptions.where = null;
            }
        }
        return queryOptions;
    }
    /** Create query options for individual expressions */
    createRowsetIndividualQueryOptions(table, variables, expr) {
        const queryOptions = {
            select: {
                value: expr
            },
            distinct: true,
            from: table,
            where: this.props.value,
            limit: 2
        };
        // Add filters
        if (this.state.filters.length > 0) {
            queryOptions.where = {
                type: "op",
                table: table,
                op: "and",
                exprs: lodash_1.default.compact([queryOptions.where || null].concat(lodash_1.default.compact(this.state.filters.map(f => f.expr))))
            };
            if (queryOptions.where.exprs.length === 0) {
                queryOptions.where = null;
            }
        }
        return queryOptions;
    }
    performQueries() {
        return __awaiter(this, void 0, void 0, function* () {
            // No need to perform queries if no context var exprs
            if (!this.props.contextVarExprs || this.props.contextVarExprs.length == 0) {
                if (this.state.loading || this.state.refreshing) {
                    this.setState({ loading: false, refreshing: false });
                }
                return;
            }
            const innerProps = this.createInnerProps();
            // Determine variables and values for expressions
            const variables = (0, blocks_1.createExprVariables)(innerProps.contextVars);
            const variableValues = (0, contexts_1.getFilteredContextVarValues)(innerProps);
            this.setState({ refreshing: true, filteredContextVarValues: variableValues });
            // Query database if row 
            if (this.props.injectedContextVar.type === "row") {
                // Special case of null row value
                if (this.props.value == null) {
                    this.setState({ exprValues: {}, loading: false, refreshing: false, filteredContextVarValues: variableValues });
                    return;
                }
                this.setState({ refreshing: true });
                const table = this.props.injectedContextVar.table;
                // Perform query
                const queryOptions = this.createRowQueryOptions(table);
                try {
                    const rows = yield this.props.instanceCtx.database.query(queryOptions, innerProps.contextVars, variableValues);
                    // Ignore if query options out of date
                    if (!lodash_1.default.isEqual(queryOptions, this.createRowQueryOptions(table))) {
                        return;
                    }
                    // Ignore if variable values out of date
                    if (!lodash_1.default.isEqual(variableValues, (0, contexts_1.getFilteredContextVarValues)(this.createInnerProps()))) {
                        return;
                    }
                    // Ignore if unmounted
                    if (this.unmounted) {
                        return;
                    }
                    if (rows.length === 0) {
                        this.setState({ exprValues: {} });
                    }
                    else {
                        const exprValues = {};
                        for (let i = 0; i < this.props.contextVarExprs.length; i++) {
                            exprValues[(0, canonical_json_1.default)(this.props.contextVarExprs[i])] = rows[0]["e" + i];
                        }
                        this.setState({ exprValues });
                    }
                }
                catch (error) {
                    this.setState({ error });
                    return;
                }
            }
            // Query database if rowset
            if (this.props.injectedContextVar.type === "rowset") {
                this.setState({ refreshing: true });
                const table = this.props.injectedContextVar.table;
                // Perform query
                const queryAggrOptions = this.createRowsetAggrQueryOptions(table, variables);
                try {
                    const exprUtils = new mwater_expressions_1.ExprUtils(this.props.instanceCtx.schema, variables);
                    const aggrExpressions = this.props.contextVarExprs.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate" || exprUtils.getExprAggrStatus(expr) === "literal");
                    const individualExpressions = this.props.contextVarExprs.filter(expr => exprUtils.getExprAggrStatus(expr) === "individual");
                    const exprValues = {};
                    // Perform one big query for all non-individual
                    const aggrRows = yield this.props.instanceCtx.database.query(queryAggrOptions, innerProps.contextVars, (0, contexts_1.getFilteredContextVarValues)(innerProps));
                    if (aggrRows.length > 0) {
                        for (let i = 0; i < aggrExpressions.length; i++) {
                            exprValues[(0, canonical_json_1.default)(aggrExpressions[i])] = aggrRows[0]["e" + i];
                        }
                    }
                    else {
                        for (let i = 0; i < aggrExpressions.length; i++) {
                            exprValues[(0, canonical_json_1.default)(aggrExpressions[i])] = null;
                        }
                    }
                    // Perform individual queries for individual expressions
                    for (const individualExpression of individualExpressions) {
                        const queryIndividualOptions = this.createRowsetIndividualQueryOptions(table, variables, individualExpression);
                        const individualRows = yield this.props.instanceCtx.database.query(queryIndividualOptions, innerProps.contextVars, (0, contexts_1.getFilteredContextVarValues)(innerProps));
                        if (individualRows.length == 1) {
                            exprValues[(0, canonical_json_1.default)(individualExpression)] = individualRows[0].value;
                        }
                        else {
                            exprValues[(0, canonical_json_1.default)(individualExpression)] = null;
                        }
                    }
                    // Ignore if query options out of date
                    if (!lodash_1.default.isEqual(queryAggrOptions, this.createRowsetAggrQueryOptions(table, variables))) {
                        return;
                    }
                    // Ignore if variable values out of date
                    if (!lodash_1.default.isEqual(variableValues, (0, contexts_1.getFilteredContextVarValues)(this.createInnerProps()))) {
                        return;
                    }
                    // Ignore if unmounted
                    if (this.unmounted) {
                        return;
                    }
                    // Save values
                    this.setState({ exprValues });
                }
                catch (error) {
                    this.setState({ error });
                    return;
                }
            }
            this.setState({ refreshing: false, loading: false });
        });
    }
    /** Create props needed by inner component */
    createInnerProps() {
        const outer = this.props.instanceCtx;
        // Get injected context variable value
        let value = this.props.value;
        const contextVars = outer.contextVars.concat(this.props.injectedContextVar);
        const contextVarValues = Object.assign(Object.assign({}, outer.contextVarValues), { [this.props.injectedContextVar.id]: value });
        // Create inner props
        const innerProps = Object.assign(Object.assign({}, outer), { database: this.props.instanceCtx.database, contextVars: contextVars, contextVarValues: contextVarValues, getContextVarExprValue: (contextVarId, expr) => {
                // Null expression has null value
                if (!expr) {
                    return null;
                }
                // If no context variable, evaluate expression
                if (contextVarId == null) {
                    return new mwater_expressions_1.PromiseExprEvaluator({
                        schema: outer.schema,
                        locale: outer.locale,
                        variables: (0, blocks_1.createExprVariables)(contextVars),
                        variableValues: (0, blocks_1.createExprVariableValues)(contextVars, contextVarValues)
                    }).evaluateSync(expr);
                }
                if (contextVarId === this.props.injectedContextVar.id) {
                    return this.state.exprValues[(0, canonical_json_1.default)(expr)];
                }
                else {
                    return outer.getContextVarExprValue(contextVarId, expr);
                }
            }, setFilter: (contextVarId, filter) => {
                if (contextVarId === this.props.injectedContextVar.id) {
                    // Remove existing with same id
                    const filters = this.state.filters.filter(f => f.id !== filter.id);
                    filters.push(filter);
                    return this.setState({ filters });
                }
                else {
                    return outer.setFilter(contextVarId, filter);
                }
            }, getFilters: (contextVarId) => {
                if (contextVarId === this.props.injectedContextVar.id) {
                    return this.state.filters;
                }
                else {
                    return outer.getFilters(contextVarId);
                }
            } });
        return innerProps;
    }
    render() {
        if (this.state.error) {
            // TODO localize
            return React.createElement("div", { className: "alert alert-danger" }, "Error loading data");
        }
        return this.props.children(this.createInnerProps(), this.state.loading, this.state.refreshing);
    }
}
exports.default = ContextVarInjector;
