"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const blocks_1 = require("./blocks");
const React = __importStar(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const canonical_json_1 = __importDefault(require("canonical-json"));
const _ = __importStar(require("lodash"));
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
            contextVarValues: props.renderInstanceProps.contextVarValues
        };
        this.unmounted = false;
    }
    componentDidMount() {
        this.performQueries();
        // Listen for changes to database
        this.props.database.addChangeListener(this.handleDatabaseChange);
    }
    componentDidUpdate(prevProps, prevState) {
        // If value change, filters change, or any context var values changes, refresh
        // TODO context var value changes are only relevant if referenced as a variable. Could be optimized
        if (!_.isEqual(prevProps.value, this.props.value)
            || !_.isEqual(prevState.filters, this.state.filters)
            || !_.isEqual(this.props.renderInstanceProps.contextVarValues, this.state.contextVarValues)) {
            this.performQueries();
        }
    }
    componentWillUnmount() {
        this.unmounted = true;
        this.props.database.removeChangeListener(this.handleDatabaseChange);
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
    createRowsetQueryOptions(table, variables) {
        const queryOptions = {
            select: {},
            from: table,
            where: this.props.value,
            limit: 1
        };
        // Add expressions as selects (only if aggregate for rowset)
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema, variables);
        const nonAggrExpressions = this.props.contextVarExprs.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate" || exprUtils.getExprAggrStatus(expr) === "literal");
        // Add expressions as selects
        for (let i = 0; i < nonAggrExpressions.length; i++) {
            queryOptions.select["e" + i] = nonAggrExpressions[i];
        }
        // Add filters
        if (this.state.filters.length > 0) {
            queryOptions.where = {
                type: "op",
                table: table,
                op: "and",
                exprs: _.compact([queryOptions.where || null].concat(_.compact(this.state.filters.map(f => f.expr))))
            };
            if (queryOptions.where.exprs.length === 0) {
                queryOptions.where = null;
            }
        }
        return queryOptions;
    }
    performQueries() {
        return __awaiter(this, void 0, void 0, function* () {
            const innerProps = this.createInnerProps();
            // Determine variables and values for expressions
            const variables = blocks_1.createExprVariables(innerProps.contextVars);
            const variableValues = innerProps.contextVarValues;
            this.setState({ refreshing: true, contextVarValues: this.props.renderInstanceProps.contextVarValues });
            // Query database if row 
            if (this.props.injectedContextVar.type === "row" && this.props.contextVarExprs.length > 0) {
                // Special case of null row value
                if (this.props.value == null) {
                    this.setState({ exprValues: {}, loading: false, refreshing: false, contextVarValues: this.props.renderInstanceProps.contextVarValues });
                    return;
                }
                this.setState({ refreshing: true });
                const table = this.props.injectedContextVar.table;
                // Perform query
                const queryOptions = this.createRowQueryOptions(table);
                const rows = yield this.props.database.query(queryOptions, innerProps.contextVars, innerProps.contextVarValues);
                // Ignore if query options out of date
                if (!_.isEqual(queryOptions, this.createRowQueryOptions(table))) {
                    return;
                }
                // Ignore if variable values out of date
                if (!_.isEqual(variableValues, this.createInnerProps().contextVarValues)) {
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
                        exprValues[canonical_json_1.default(this.props.contextVarExprs[i])] = rows[0]["e" + i];
                    }
                    this.setState({ exprValues });
                }
            }
            // Query database if rowset
            if (this.props.injectedContextVar.type === "rowset" && this.props.contextVarExprs.length > 0) {
                this.setState({ refreshing: true });
                const table = this.props.injectedContextVar.table;
                // Perform query
                const queryOptions = this.createRowsetQueryOptions(table, variables);
                const rows = yield this.props.database.query(queryOptions, innerProps.contextVars, innerProps.contextVarValues);
                // Ignore if query options out of date
                if (!_.isEqual(queryOptions, this.createRowsetQueryOptions(table, variables))) {
                    return;
                }
                // Ignore if variable values out of date
                if (!_.isEqual(variableValues, this.createInnerProps().contextVarValues)) {
                    return;
                }
                // Ignore if unmounted
                if (this.unmounted) {
                    return;
                }
                const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema, variables);
                const nonAggrExpressions = this.props.contextVarExprs.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate" || exprUtils.getExprAggrStatus(expr) === "literal");
                if (rows.length === 0) {
                    this.setState({ exprValues: {} });
                }
                else {
                    const exprValues = {};
                    for (let i = 0; i < nonAggrExpressions.length; i++) {
                        exprValues[canonical_json_1.default(nonAggrExpressions[i])] = rows[0]["e" + i];
                    }
                    this.setState({ exprValues });
                }
            }
            this.setState({ refreshing: false, loading: false });
        });
    }
    /** Create props needed by inner component */
    createInnerProps() {
        const outer = this.props.renderInstanceProps;
        // Get injected context variable value (rowset is special case that incorporates filters)
        let value = this.props.value;
        if (this.props.injectedContextVar.type === "rowset" && this.state.filters.length > 0) {
            value = { type: "op", op: "and", table: this.props.injectedContextVar.table, exprs: _.compact([value].concat(this.state.filters.map(f => f.expr))) };
        }
        // Create inner props
        const innerProps = Object.assign({}, outer, { database: this.props.database, contextVars: outer.contextVars.concat(this.props.injectedContextVar), contextVarValues: Object.assign({}, outer.contextVarValues, { [this.props.injectedContextVar.id]: value }), getContextVarExprValue: (contextVarId, expr) => {
                if (contextVarId === this.props.injectedContextVar.id) {
                    return this.state.exprValues[canonical_json_1.default(expr)];
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
        return this.props.children(this.createInnerProps(), this.state.loading, this.state.refreshing);
    }
}
exports.default = ContextVarInjector;
//# sourceMappingURL=ContextVarInjector.js.map