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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const lodash_1 = __importDefault(require("lodash"));
const localization_1 = require("../../localization");
const contexts_1 = require("../../../contexts");
const blocks_1 = require("../../blocks");
/** Instance of a query table */
class QueryRepeatBlockInstance extends React.Component {
    constructor(props) {
        super(props);
        /** Change listener to refresh database */
        this.handleChange = () => {
            this.performQuery();
        };
        this.state = { refreshing: false };
    }
    componentDidMount() {
        this.props.instanceCtx.database.addChangeListener(this.handleChange);
        this.performQuery();
    }
    componentDidUpdate(prevProps) {
        // Redo query if changed
        const newQueryOptions = this.createQuery();
        if (!lodash_1.default.isEqual(newQueryOptions, this.queryOptions) ||
            !lodash_1.default.isEqual(this.props.instanceCtx.contextVarValues, prevProps.instanceCtx.contextVarValues)) {
            this.performQuery();
        }
    }
    componentWillUnmount() {
        this.props.instanceCtx.database.removeChangeListener(this.handleChange);
    }
    createQuery() {
        const rips = this.props.instanceCtx;
        const block = this.props.block;
        // Get expressions
        const rowsetCV = rips.contextVars.find((cv) => cv.id === block.blockDef.rowsetContextVarId);
        const rowExprs = block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx);
        const rowsetCVValue = rips.contextVarValues[rowsetCV.id];
        // Create where
        const where = {
            type: "op",
            op: "and",
            table: rowsetCV.table,
            exprs: lodash_1.default.compact([rowsetCVValue].concat(lodash_1.default.map(rips.getFilters(rowsetCV.id), (f) => f.expr)))
        };
        // Add own where
        if (block.blockDef.where) {
            where.exprs.push(block.blockDef.where);
        }
        let queryOptions = {
            select: {},
            from: rowsetCV.table,
            where: where.exprs.length > 0 ? where : null,
            orderBy: [],
            limit: block.blockDef.limit
        };
        // Add order by
        if (block.blockDef.orderBy) {
            queryOptions.orderBy = queryOptions.orderBy.concat(block.blockDef.orderBy);
        }
        // Stabilize sort order
        queryOptions.orderBy.push({ expr: { type: "id", table: rowsetCV.table }, dir: "asc" });
        // Add expressions
        queryOptions.select.id = { type: "id", table: rowsetCV.table };
        rowExprs.forEach((expr, index) => {
            queryOptions.select["e" + index] = expr;
        });
        // The context variable that represents the row has a value which changes with each row
        // so replace it with { type: "id" ...} expression so that it evaluates as the row id
        queryOptions = mapObject(queryOptions, (input) => {
            if (input && input.type == "variable" && input.variableId == this.props.block.getRowContextVarId()) {
                return { type: "id", table: queryOptions.from };
            }
            return input;
        });
        return queryOptions;
    }
    performQuery() {
        const queryOptions = this.createQuery();
        this.queryOptions = queryOptions;
        // Mark as refreshing
        this.setState({ refreshing: true });
        this.props.instanceCtx.database
            .query(queryOptions, this.props.instanceCtx.contextVars, (0, contexts_1.getFilteredContextVarValues)(this.props.instanceCtx))
            .then((rows) => {
            // Check if still relevant
            if (lodash_1.default.isEqual(queryOptions, this.createQuery())) {
                this.setState({ rows, refreshing: false });
            }
        })
            .catch((error) => {
            this.setState({ error: error });
        });
    }
    createRowInstanceCtx(rowIndex) {
        const rips = this.props.instanceCtx;
        // Row context variable
        const rowsetCV = this.props.instanceCtx.contextVars.find((cv) => cv.id === this.props.block.blockDef.rowsetContextVarId);
        const rowcv = this.props.block.createRowContextVar(rowsetCV);
        // TODO move out of here to be faster
        const rowExprs = this.props.block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx);
        const innerContextVars = rips.contextVars.concat(rowcv);
        // Row context variable value
        const cvvalue = this.props.block.getRowContextVarValue(this.state.rows[rowIndex], rowExprs, this.props.instanceCtx.schema, rowsetCV, innerContextVars);
        const innerContextVarValues = Object.assign(Object.assign({}, rips.contextVarValues), { [rowcv.id]: cvvalue });
        return Object.assign(Object.assign({}, rips), { contextVars: innerContextVars, contextVarValues: innerContextVarValues, getContextVarExprValue: (cvid, expr) => {
                // Null expression has null value
                if (!expr) {
                    return null;
                }
                // If no context variable, evaluate expression
                if (cvid == null) {
                    return new mwater_expressions_1.PromiseExprEvaluator({
                        schema: rips.schema,
                        locale: rips.locale,
                        variables: (0, blocks_1.createExprVariables)(innerContextVars),
                        variableValues: (0, blocks_1.createExprVariableValues)(innerContextVars, innerContextVarValues)
                    }).evaluateSync(expr);
                }
                if (cvid !== rowcv.id) {
                    return rips.getContextVarExprValue(cvid, expr);
                }
                // Look up expression
                const exprIndex = rowExprs.findIndex((rowExpr) => lodash_1.default.isEqual(expr, rowExpr));
                return this.state.rows[rowIndex]["e" + exprIndex];
            } });
    }
    renderSeparator() {
        switch (this.props.block.blockDef.separator) {
            case "none":
                return null;
            case "page_break":
                return React.createElement("div", { className: "page-break" });
            case "solid_line":
                return React.createElement("hr", null);
        }
    }
    renderRow(row, rowIndex) {
        const orientation = this.props.block.blockDef.orientation || "vertical";
        const horizontalSpacing = this.props.block.blockDef.horizontalSpacing != null ? this.props.block.blockDef.horizontalSpacing : 5;
        const rowRIProps = this.createRowInstanceCtx(rowIndex);
        if (orientation == "vertical") {
            return (React.createElement("div", { key: row.id },
                rowIndex > 0 ? this.renderSeparator() : null,
                rowRIProps.renderChildBlock(rowRIProps, this.props.block.blockDef.content)));
        }
        else {
            return (React.createElement("div", { key: row.id, style: { display: "inline-block", verticalAlign: "top", marginLeft: rowIndex > 0 ? horizontalSpacing : 0 } }, rowRIProps.renderChildBlock(rowRIProps, this.props.block.blockDef.content)));
        }
    }
    renderRows() {
        if (this.state.error) {
            // TODO localize
            return React.createElement("div", { className: "alert alert-danger" }, "Error loading data");
        }
        if (!this.state.rows) {
            return (React.createElement("div", { style: { textAlign: "center", fontSize: 20 } },
                React.createElement("i", { className: "fa fa-spinner fa-spin" })));
        }
        if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
            return (React.createElement("div", { style: { fontStyle: "italic" } }, (0, localization_1.localize)(this.props.block.blockDef.noRowsMessage, this.props.instanceCtx.locale)));
        }
        return this.state.rows.map((row, rowIndex) => this.renderRow(row, rowIndex));
    }
    render() {
        const riProps = this.props.instanceCtx;
        const style = {
            marginTop: 5
        };
        // Fade if refreshing
        if (this.state.refreshing) {
            style.opacity = 0.6;
        }
        return React.createElement("div", null, this.renderRows());
    }
}
exports.default = QueryRepeatBlockInstance;
/** Replace every part of an object, including array members
 * replacer should return input to leave unchanged
 */
const mapObject = (obj, replacer) => {
    obj = replacer(obj);
    if (!obj) {
        return obj;
    }
    if (lodash_1.default.isArray(obj)) {
        return lodash_1.default.map(obj, (item) => mapObject(item, replacer));
    }
    if (lodash_1.default.isObject(obj)) {
        return lodash_1.default.mapValues(obj, (item) => mapObject(item, replacer));
    }
    return obj;
};
