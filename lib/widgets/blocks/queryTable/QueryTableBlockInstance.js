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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var localization_1 = require("../../localization");
/** Instance of a query table */
var QueryTableBlockInstance = /** @class */ (function (_super) {
    __extends(QueryTableBlockInstance, _super);
    function QueryTableBlockInstance(props) {
        var _this = _super.call(this, props) || this;
        /** Change listener to refresh database */
        _this.handleChange = function () {
            _this.performQuery();
        };
        _this.state = { refreshing: false };
        return _this;
    }
    QueryTableBlockInstance.prototype.componentDidMount = function () {
        this.props.renderInstanceProps.database.addChangeListener(this.handleChange);
        this.performQuery();
    };
    QueryTableBlockInstance.prototype.componentDidUpdate = function (prevProps) {
        // Redo query if changed
        var newQueryOptions = this.createQuery();
        if (!_.isEqual(newQueryOptions, this.queryOptions)) {
            this.performQuery();
        }
    };
    QueryTableBlockInstance.prototype.componentWillUnmount = function () {
        this.props.renderInstanceProps.database.removeChangeListener(this.handleChange);
    };
    QueryTableBlockInstance.prototype.createQuery = function () {
        var rips = this.props.renderInstanceProps;
        var block = this.props.block;
        // Get expressions
        var rowsetCV = rips.contextVars.find(function (cv) { return cv.id === block.blockDef.rowsetContextVarId; });
        var rowExprs = block.getRowExprs(this.props.renderInstanceProps.contextVars, this.props.renderInstanceProps.widgetLibrary, this.props.renderInstanceProps.actionLibrary);
        var rowsetCVValue = rips.contextVarValues[rowsetCV.id];
        // Create where
        var where = {
            type: "op",
            op: "and",
            table: rowsetCV.table,
            exprs: _.compact([rowsetCVValue].concat(_.map(rips.getFilters(rowsetCV.id), function (f) { return f.expr; })))
        };
        // Add own where
        if (block.blockDef.where) {
            where.exprs.push(block.blockDef.where);
        }
        var queryOptions = {
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
        // Stabilize sort order if in singleRow mode
        if (block.blockDef.mode === "singleRow") {
            queryOptions.orderBy.push({ expr: { type: "id", table: rowsetCV.table }, dir: "asc" });
        }
        // Add expressions
        if (block.blockDef.mode === "singleRow") {
            queryOptions.select.id = { type: "id", table: rowsetCV.table };
        }
        rowExprs.forEach(function (expr, index) {
            queryOptions.select["e" + index] = expr;
        });
        return queryOptions;
    };
    QueryTableBlockInstance.prototype.performQuery = function () {
        var _this = this;
        var queryOptions = this.createQuery();
        this.queryOptions = queryOptions;
        // Mark as refreshing
        this.setState({ refreshing: true });
        this.props.renderInstanceProps.database.query(queryOptions, this.props.renderInstanceProps.contextVars, this.props.renderInstanceProps.contextVarValues).then(function (rows) {
            // Check if still relevant
            if (_.isEqual(queryOptions, _this.createQuery())) {
                _this.setState({ rows: rows, refreshing: false });
            }
        }).catch(function (error) {
            _this.setState({ error: error });
        });
    };
    QueryTableBlockInstance.prototype.createRowRenderInstanceProps = function (rowIndex) {
        var _a;
        var _this = this;
        var rips = this.props.renderInstanceProps;
        // Row context variable
        var rowsetCV = this.props.renderInstanceProps.contextVars.find(function (cv) { return cv.id === _this.props.block.blockDef.rowsetContextVarId; });
        var rowcv = this.props.block.createRowContextVar(rowsetCV);
        // TODO move out of here to be faster
        var rowExprs = this.props.block.getRowExprs(this.props.renderInstanceProps.contextVars, this.props.renderInstanceProps.widgetLibrary, this.props.renderInstanceProps.actionLibrary);
        var innerContextVars = rips.contextVars.concat(rowcv);
        // Row context variable value
        var cvvalue = this.props.block.getRowContextVarValue(this.state.rows[rowIndex], rowExprs, this.props.renderInstanceProps.schema, rowsetCV, innerContextVars);
        return __assign(__assign({}, rips), { contextVars: innerContextVars, contextVarValues: __assign(__assign({}, rips.contextVarValues), (_a = {}, _a[rowcv.id] = cvvalue, _a)), getContextVarExprValue: function (cvid, expr) {
                if (cvid !== rowcv.id) {
                    return rips.getContextVarExprValue(cvid, expr);
                }
                // Look up expression
                var exprIndex = rowExprs.findIndex(function (rowExpr) { return _.isEqual(expr, rowExpr); });
                return _this.state.rows[rowIndex]["e" + exprIndex];
            } });
    };
    QueryTableBlockInstance.prototype.renderRow = function (row, rowIndex) {
        var _this = this;
        var rowRIProps = this.createRowRenderInstanceProps(rowIndex);
        var handleRowClick = function () {
            // Run action
            if (_this.props.block.blockDef.rowClickAction) {
                var actionDef = _this.props.block.blockDef.rowClickAction;
                var action = _this.props.renderInstanceProps.actionLibrary.createAction(actionDef);
                action.performAction({
                    contextVars: rowRIProps.contextVars,
                    database: rowRIProps.database,
                    locale: rowRIProps.locale,
                    schema: _this.props.renderInstanceProps.schema,
                    contextVarValues: rowRIProps.contextVarValues,
                    pageStack: rowRIProps.pageStack,
                    getContextVarExprValue: rowRIProps.getContextVarExprValue,
                    getFilters: rowRIProps.getFilters
                });
            }
        };
        // Use row id if possible, otherwise just the index
        var rowKey = this.props.block.blockDef.mode == "singleRow" ? row.id : rowIndex;
        return (React.createElement("tr", { key: rowKey }, this.props.block.blockDef.contents.map(function (b, colIndex) {
            return (React.createElement("td", { key: colIndex, onClick: handleRowClick }, rowRIProps.renderChildBlock(rowRIProps, b)));
        })));
    };
    QueryTableBlockInstance.prototype.renderRows = function () {
        var _this = this;
        if (this.state.error) {
            // TODO localize
            return (React.createElement("tr", null,
                React.createElement("td", { colSpan: this.props.block.blockDef.contents.length },
                    React.createElement("div", { className: "alert alert-danger" }, "Error loading data"))));
        }
        if (!this.state.rows) {
            return (React.createElement("tr", null,
                React.createElement("td", { colSpan: this.props.block.blockDef.contents.length },
                    React.createElement("i", { className: "fa fa-spinner fa-spin" }))));
        }
        if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
            return (React.createElement("tr", null,
                React.createElement("td", { colSpan: this.props.block.blockDef.contents.length, style: { fontStyle: "italic" } }, localization_1.localize(this.props.block.blockDef.noRowsMessage, this.props.renderInstanceProps.locale))));
        }
        return this.state.rows.map(function (row, rowIndex) { return _this.renderRow(row, rowIndex); });
    };
    QueryTableBlockInstance.prototype.render = function () {
        var riProps = this.props.renderInstanceProps;
        var blockDef = this.props.block.blockDef;
        var style = {
            marginTop: 5
        };
        // Fade if refreshing
        if (this.state.refreshing) {
            style.opacity = 0.6;
        }
        var className = "table";
        switch (blockDef.borders || "horizontal") {
            case "all":
                className += " table-bordered";
                break;
        }
        switch (blockDef.padding || "normal") {
            case "compact":
                className += " table-condensed";
                break;
        }
        // Put hover if an action connected
        if (blockDef.rowClickAction) {
            className += " table-hover";
        }
        return (React.createElement("table", { className: className, style: style },
            !blockDef.hideHeaders ?
                React.createElement("thead", null,
                    React.createElement("tr", null, blockDef.headers.map(function (b, index) {
                        return React.createElement("th", { key: index }, riProps.renderChildBlock(riProps, b));
                    })))
                : null,
            React.createElement("tbody", null, this.renderRows())));
    };
    return QueryTableBlockInstance;
}(React.Component));
exports.default = QueryTableBlockInstance;
