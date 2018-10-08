import * as React from "react";
import { ExprUtils } from "mwater-expressions";
import canonical from 'canonical-json';
import * as _ from "lodash";
/** Injects one context variable into the inner render instance props.
 * Holds state of the filters that are applied to rowset-type context vars
 * Computes values of expressions for row and rowset types
 */
export default class ContextVarsInjector extends React.Component {
    constructor(props) {
        super(props);
        this.handleDatabaseChange = () => {
            this.performQueries();
        };
        this.state = {
            filters: props.initialFilters || [],
            loading: true,
            refreshing: false,
            exprValues: {}
        };
    }
    componentDidMount() {
        this.performQueries();
        // Listen for changes to database
        this.props.database.addChangeListener(this.handleDatabaseChange);
    }
    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevProps.value, this.props.value) || !_.isEqual(prevState.filters, this.state.filters)) {
            this.performQueries();
        }
    }
    componentWillUnmount() {
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
    createRowsetQueryOptions(table) {
        const queryOptions = {
            select: {},
            from: table,
            where: this.props.value
        };
        // Add expressions as selects (only if aggregate for rowset)
        const exprUtils = new ExprUtils(this.props.schema);
        const nonAggrExpressions = this.props.contextVarExprs.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate");
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
        }
        return queryOptions;
    }
    async performQueries() {
        // Query database if row 
        if (this.props.contextVar.type === "row" && this.props.contextVarExprs.length > 0) {
            // Special case of null row value
            if (this.props.value == null) {
                this.setState({ exprValues: {}, loading: false, refreshing: false });
                return;
            }
            this.setState({ refreshing: true });
            const table = this.props.contextVar.table;
            // Perform query
            const queryOptions = this.createRowQueryOptions(table);
            const rows = await this.props.renderInstanceProps.database.query(queryOptions);
            // Ignore if out of date
            if (!_.isEqual(queryOptions, this.createRowQueryOptions(table))) {
                return;
            }
            if (rows.length === 0) {
                this.setState({ exprValues: {} });
            }
            else {
                const exprValues = {};
                for (let i = 0; i < this.props.contextVarExprs.length; i++) {
                    exprValues[canonical(this.props.contextVarExprs[i])] = rows[0]["e" + i];
                }
                this.setState({ exprValues, loading: false });
            }
        }
        // Query database if rowset
        if (this.props.contextVar.type === "rowset" && this.props.contextVarExprs.length > 0) {
            this.setState({ refreshing: true });
            const table = this.props.contextVar.table;
            // Perform query
            const queryOptions = this.createRowsetQueryOptions(table);
            const rows = await this.props.renderInstanceProps.database.query(queryOptions);
            // Ignore if out of date
            if (!_.isEqual(queryOptions, this.createRowsetQueryOptions(table))) {
                return;
            }
            const exprUtils = new ExprUtils(this.props.schema);
            const nonAggrExpressions = this.props.contextVarExprs.filter(expr => exprUtils.getExprAggrStatus(expr) === "aggregate");
            if (rows.length === 0) {
                this.setState({ exprValues: {} });
            }
            else {
                const exprValues = {};
                for (let i = 0; i < nonAggrExpressions.length; i++) {
                    exprValues[canonical(nonAggrExpressions[i])] = rows[0]["e" + i];
                }
                this.setState({ exprValues });
            }
        }
        this.setState({ refreshing: false, loading: false });
    }
    render() {
        const outer = this.props.renderInstanceProps;
        // Create inner props
        const innerProps = Object.assign({}, outer, { contextVars: outer.contextVars.concat(this.props.contextVar), getContextVarValue: (contextVarId) => {
                if (contextVarId === this.props.contextVar.id) {
                    return this.props.value;
                }
                else {
                    return outer.getContextVarValue(contextVarId);
                }
            }, getContextVarExprValue: (contextVarId, expr) => {
                if (contextVarId === this.props.contextVar.id) {
                    return this.state.exprValues[canonical(expr)];
                }
                else {
                    return outer.getContextVarExprValue(contextVarId, expr);
                }
            }, setFilter: (contextVarId, filter) => {
                if (contextVarId === this.props.contextVar.id) {
                    // Remove existing with same id
                    const filters = this.state.filters.filter(f => f.id !== filter.id);
                    filters.push(filter);
                    return this.setState({ filters });
                }
                else {
                    return outer.setFilter(contextVarId, filter);
                }
            }, getFilters: (contextVarId) => {
                if (contextVarId === this.props.contextVar.id) {
                    return this.state.filters;
                }
                else {
                    return outer.getFilters(contextVarId);
                }
            } });
        return this.props.children(innerProps, this.state.loading, this.state.refreshing);
    }
}
//# sourceMappingURL=ContextVarInjector.js.map