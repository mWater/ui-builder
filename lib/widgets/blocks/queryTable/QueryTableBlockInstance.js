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
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const queryTable_1 = require("./queryTable");
const mwater_expressions_1 = require("mwater-expressions");
const _ = __importStar(require("lodash"));
const localization_1 = require("../../localization");
const contexts_1 = require("../../../contexts");
const blocks_1 = require("../../blocks");
require("./queryTable.css");
/** Instance of a query table */
class QueryTableBlockInstance extends React.Component {
    constructor(props) {
        super(props);
        /** Change listener to refresh database */
        this.handleChange = () => {
            this.performQuery();
        };
        this.handleShowMore = () => {
            this.setState({ limit: this.state.limit + this.props.block.blockDef.limit });
        };
        // First column with initial ordering sets the initial ordering
        let columnOrderIndex = null;
        let columnOrderDir = "asc";
        const blockDef = this.props.block.blockDef;
        for (let colIndex = 0; colIndex < blockDef.contents.length; colIndex++) {
            if (blockDef.columnInfos &&
                blockDef.columnInfos[colIndex] &&
                blockDef.columnInfos[colIndex].orderExpr &&
                blockDef.columnInfos[colIndex].initialOrderDir) {
                columnOrderIndex = colIndex;
                columnOrderDir = blockDef.columnInfos[colIndex].initialOrderDir;
            }
        }
        this.state = {
            refreshing: false,
            columnOrderIndex,
            columnOrderDir,
            limit: props.block.blockDef.limit,
            moreRowsAvail: false
        };
    }
    componentDidMount() {
        this.props.instanceCtx.database.addChangeListener(this.handleChange);
        this.performQuery();
    }
    componentDidUpdate(prevProps) {
        // Redo query if changed
        const newQueryOptions = this.createQuery();
        if (!_.isEqual(newQueryOptions, this.queryOptions) ||
            !_.isEqual(this.props.instanceCtx.contextVarValues, prevProps.instanceCtx.contextVarValues)) {
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
            exprs: _.compact([rowsetCVValue].concat(_.map(rips.getFilters(rowsetCV.id), (f) => f.expr)))
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
            // Add extra row to see if more available
            limit: this.state.limit != null ? this.state.limit + 1 : null
        };
        // Add column ordering if present
        if (this.state.columnOrderIndex != null) {
            queryOptions.orderBy.push({
                expr: block.blockDef.columnInfos[this.state.columnOrderIndex].orderExpr,
                dir: this.state.columnOrderDir
            });
        }
        // Add order by
        if (block.blockDef.orderBy) {
            queryOptions.orderBy = queryOptions.orderBy.concat(block.blockDef.orderBy);
        }
        // Stabilize sort order if in singleRow mode
        if (block.blockDef.mode === "singleRow") {
            queryOptions.orderBy.push({ expr: { type: "id", table: rowsetCV.table }, dir: "asc" });
        }
        // Add expressions
        if (block.blockDef.mode === "singleRow") {
            queryOptions.select.id = { type: "id", table: rowsetCV.table };
        }
        rowExprs.forEach((expr, index) => {
            queryOptions.select["e" + index] = expr;
        });
        // Add count to ensure that query is aggregate
        if (block.blockDef.mode == "multiRow") {
            queryOptions.select["cnt"] = { type: "op", table: rowsetCV.table, op: "count", exprs: [] };
        }
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
            if (_.isEqual(queryOptions, this.createQuery())) {
                // Take limit of rows
                const limitedRows = this.state.limit != null ? _.take(rows, this.state.limit) : rows;
                this.setState({
                    rows: limitedRows,
                    refreshing: false,
                    // If soft limit and more available, show that
                    moreRowsAvail: (this.props.block.blockDef.limitType || "soft") == "soft" && rows.length > limitedRows.length
                });
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
        const cvvalue = this.props.block.getRowContextVarValue(this.state.rows[rowIndex], rowExprs, this.props.instanceCtx.schema, rowsetCV, innerContextVars, (0, contexts_1.getFilteredContextVarValues)(this.props.instanceCtx)[rowsetCV.id]);
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
                const exprIndex = rowExprs.findIndex((rowExpr) => _.isEqual(expr, rowExpr));
                return this.state.rows[rowIndex]["e" + exprIndex];
            }, getFilters: (cvid) => {
                // If this creates a rowset, it has no filters as it can't be filtered
                if (cvid == rowcv.id) {
                    return [];
                }
                return rips.getFilters(cvid);
            }, setFilter: (cvid, filter) => {
                // Can't set filter for rowset
                if (cvid == rowcv.id) {
                    throw new Error("Can't set filter for query table rowset");
                }
                rips.setFilter(cvid, filter);
            } });
    }
    renderRow(row, rowIndex) {
        const rowRIProps = this.createRowInstanceCtx(rowIndex);
        const handleRowClick = () => {
            // Run action
            if (this.props.block.blockDef.rowClickAction) {
                const actionDef = this.props.block.blockDef.rowClickAction;
                const action = this.props.instanceCtx.actionLibrary.createAction(actionDef);
                action.performAction(Object.assign({}, rowRIProps));
            }
        };
        // Use row id if possible, otherwise just the index
        const rowKey = this.props.block.blockDef.mode == "singleRow" ? row.id : rowIndex;
        // Show pointer if works on click
        const rowStyle = {};
        if (this.props.block.blockDef.rowClickAction) {
            rowStyle.cursor = "pointer";
        }
        const getColumnVerticalAlign = (colIndex) => {
            const columnInfos = this.props.block.blockDef.columnInfos;
            return columnInfos && columnInfos[colIndex] ? columnInfos[colIndex].verticalAlign || "top" : "top";
        };
        return (React.createElement("tr", { key: rowKey, style: rowStyle }, this.props.block.blockDef.contents.map((b, colIndex) => {
            return (React.createElement("td", { key: colIndex, onClick: handleRowClick, style: { verticalAlign: getColumnVerticalAlign(colIndex) } }, rowRIProps.renderChildBlock(rowRIProps, b)));
        })));
    }
    renderRows() {
        if (this.state.error) {
            // TODO localize
            return (React.createElement("tr", { key: "error" },
                React.createElement("td", { key: "error", colSpan: this.props.block.blockDef.contents.length },
                    React.createElement("div", { className: "alert alert-danger" },
                        "Error loading data: ",
                        this.state.error.message))));
        }
        if (!this.state.rows) {
            return (React.createElement("tr", { key: "spin" },
                React.createElement("td", { key: "spin", colSpan: this.props.block.blockDef.contents.length },
                    React.createElement("i", { className: "fa fa-spinner fa-spin" }))));
        }
        if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
            return (React.createElement("tr", { key: "norows" },
                React.createElement("td", { key: "norows", colSpan: this.props.block.blockDef.contents.length, style: { fontStyle: "italic" } }, (0, localization_1.localize)(this.props.block.blockDef.noRowsMessage, this.props.instanceCtx.locale))));
        }
        return this.state.rows.map((row, rowIndex) => this.renderRow(row, rowIndex));
    }
    /** Render one header of the table */
    renderHeader(header, index) {
        const riProps = this.props.instanceCtx;
        const blockDef = this.props.block.blockDef;
        const renderOrder = () => {
            if (!blockDef.columnInfos || !blockDef.columnInfos[index] || !blockDef.columnInfos[index].orderExpr) {
                return null;
            }
            const handleOrderClick = () => {
                // Get current order
                const currentOrder = this.state.columnOrderIndex == index ? this.state.columnOrderDir : null;
                if (currentOrder == "asc") {
                    this.setState({ columnOrderDir: "desc" });
                }
                else if (currentOrder == "desc") {
                    this.setState({ columnOrderIndex: null });
                }
                else {
                    this.setState({ columnOrderDir: "asc", columnOrderIndex: index });
                }
            };
            // If not sorted
            if (this.state.columnOrderIndex != index) {
                return (React.createElement("div", { key: "order", style: { float: "right", color: "#CCC", cursor: "pointer" }, onClick: handleOrderClick },
                    React.createElement("i", { className: "fa fa-sort fa-fw" })));
            }
            return (React.createElement("div", { key: "order", style: { float: "right", cursor: "pointer" }, onClick: handleOrderClick }, this.state.columnOrderDir == "asc" ? (React.createElement("i", { className: "fa fa-sort-asc fa-fw" })) : (React.createElement("i", { className: "fa fa-sort-desc fa-fw" }))));
        };
        const style = {};
        if (this.props.block.blockDef.stickyHeaders) {
            style.position = "sticky";
            style.top = 0;
        }
        return (React.createElement("th", { key: index, style: style },
            renderOrder(),
            riProps.renderChildBlock(riProps, header)));
    }
    /** Render the show more rows at bottom */
    renderShowMore() {
        if (!this.state.moreRowsAvail) {
            return null;
        }
        return (React.createElement("tr", { key: "showMore" },
            React.createElement("td", { colSpan: this.props.block.blockDef.contents.length },
                React.createElement("a", { className: "link-plain", onClick: this.handleShowMore }, this.props.instanceCtx.T("Show more...")))));
    }
    render() {
        const blockDef = this.props.block.blockDef;
        const divStyle = {};
        const tableStyle = {
            marginTop: 5
        };
        if ((0, queryTable_1.getFixedWidth)(this.props.block.blockDef)) {
            tableStyle.width = (0, queryTable_1.getFixedWidth)(this.props.block.blockDef);
            divStyle.overflowX = "auto";
        }
        if (this.props.block.blockDef.maxHeight) {
            divStyle.overflowY = "auto";
            divStyle.maxHeight = this.props.block.blockDef.maxHeight;
        }
        // Fade if refreshing
        if (this.state.refreshing) {
            tableStyle.opacity = 0.6;
        }
        let className = "ui-builder-table";
        switch (blockDef.borders || "horizontal") {
            case "all":
                className += " ui-builder-table-bordered";
                break;
            case "none":
                className += " ui-builder-table-borderless";
                break;
        }
        switch (blockDef.padding || "normal") {
            case "compact":
                className += " ui-builder-table-condensed";
                break;
        }
        // Put hover if an action connected
        if (blockDef.rowClickAction) {
            className += " ui-builder-table-hover";
        }
        if (blockDef.striped) {
            className += " ui-builder-table-striped";
        }
        return (React.createElement("div", { style: divStyle },
            React.createElement("table", { className: className, style: tableStyle },
                React.createElement("colgroup", null, blockDef.contents.map((b, colIndex) => {
                    // Determine width
                    const columnInfos = blockDef.columnInfos;
                    const width = columnInfos && columnInfos[colIndex] ? columnInfos[colIndex].columnWidth || "auto" : "auto";
                    return React.createElement("col", { key: colIndex, style: { width: width } });
                })),
                !blockDef.hideHeaders ? (React.createElement("thead", null,
                    React.createElement("tr", { key: "header" }, blockDef.headers.map((b, index) => this.renderHeader(b, index))))) : null,
                React.createElement("tbody", null,
                    this.renderRows(),
                    this.renderShowMore()),
                blockDef.footers ? (React.createElement("tfoot", null,
                    React.createElement("tr", null, blockDef.footers.map((b, index) => (React.createElement("td", { key: index }, this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, b))))))) : null)));
    }
}
exports.default = QueryTableBlockInstance;
/** Replace every part of an object, including array members
 * replacer should return input to leave unchanged
 */
const mapObject = (obj, replacer) => {
    obj = replacer(obj);
    if (!obj) {
        return obj;
    }
    if (_.isArray(obj)) {
        return _.map(obj, (item) => mapObject(item, replacer));
    }
    if (_.isObject(obj)) {
        return _.mapValues(obj, (item) => mapObject(item, replacer));
    }
    return obj;
};
