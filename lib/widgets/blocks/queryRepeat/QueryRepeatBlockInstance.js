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
var QueryRepeatBlockInstance = /** @class */ (function (_super) {
    __extends(QueryRepeatBlockInstance, _super);
    function QueryRepeatBlockInstance(props) {
        var _this = _super.call(this, props) || this;
        /** Change listener to refresh database */
        _this.handleChange = function () {
            _this.performQuery();
        };
        _this.state = { refreshing: false };
        return _this;
    }
    QueryRepeatBlockInstance.prototype.componentDidMount = function () {
        this.props.instanceCtx.database.addChangeListener(this.handleChange);
        this.performQuery();
    };
    QueryRepeatBlockInstance.prototype.componentDidUpdate = function (prevProps) {
        // Redo query if changed
        var newQueryOptions = this.createQuery();
        if (!_.isEqual(newQueryOptions, this.queryOptions) || !_.isEqual(this.props.instanceCtx.contextVarValues, prevProps.instanceCtx.contextVarValues)) {
            this.performQuery();
        }
    };
    QueryRepeatBlockInstance.prototype.componentWillUnmount = function () {
        this.props.instanceCtx.database.removeChangeListener(this.handleChange);
    };
    QueryRepeatBlockInstance.prototype.createQuery = function () {
        var rips = this.props.instanceCtx;
        var block = this.props.block;
        // Get expressions
        var rowsetCV = rips.contextVars.find(function (cv) { return cv.id === block.blockDef.rowsetContextVarId; });
        var rowExprs = block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx);
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
        // Stabilize sort order
        queryOptions.orderBy.push({ expr: { type: "id", table: rowsetCV.table }, dir: "asc" });
        // Add expressions
        queryOptions.select.id = { type: "id", table: rowsetCV.table };
        rowExprs.forEach(function (expr, index) {
            queryOptions.select["e" + index] = expr;
        });
        return queryOptions;
    };
    QueryRepeatBlockInstance.prototype.performQuery = function () {
        var _this = this;
        var queryOptions = this.createQuery();
        this.queryOptions = queryOptions;
        // Mark as refreshing
        this.setState({ refreshing: true });
        this.props.instanceCtx.database.query(queryOptions, this.props.instanceCtx.contextVars, this.props.instanceCtx.contextVarValues).then(function (rows) {
            // Check if still relevant
            if (_.isEqual(queryOptions, _this.createQuery())) {
                _this.setState({ rows: rows, refreshing: false });
            }
        }).catch(function (error) {
            _this.setState({ error: error });
        });
    };
    QueryRepeatBlockInstance.prototype.createRowInstanceCtx = function (rowIndex) {
        var _a;
        var _this = this;
        var rips = this.props.instanceCtx;
        // Row context variable
        var rowsetCV = this.props.instanceCtx.contextVars.find(function (cv) { return cv.id === _this.props.block.blockDef.rowsetContextVarId; });
        var rowcv = this.props.block.createRowContextVar(rowsetCV);
        // TODO move out of here to be faster
        var rowExprs = this.props.block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx);
        var innerContextVars = rips.contextVars.concat(rowcv);
        // Row context variable value
        var cvvalue = this.props.block.getRowContextVarValue(this.state.rows[rowIndex], rowExprs, this.props.instanceCtx.schema, rowsetCV, innerContextVars);
        return __assign(__assign({}, rips), { contextVars: innerContextVars, contextVarValues: __assign(__assign({}, rips.contextVarValues), (_a = {}, _a[rowcv.id] = cvvalue, _a)), getContextVarExprValue: function (cvid, expr) {
                if (cvid !== rowcv.id) {
                    return rips.getContextVarExprValue(cvid, expr);
                }
                // Look up expression
                var exprIndex = rowExprs.findIndex(function (rowExpr) { return _.isEqual(expr, rowExpr); });
                return _this.state.rows[rowIndex]["e" + exprIndex];
            } });
    };
    QueryRepeatBlockInstance.prototype.renderSeparator = function () {
        switch (this.props.block.blockDef.separator) {
            case "none":
                return null;
            case "page_break":
                return React.createElement("div", { className: "page-break" });
            case "solid_line":
                return React.createElement("hr", null);
        }
    };
    QueryRepeatBlockInstance.prototype.renderRow = function (row, rowIndex) {
        var rowRIProps = this.createRowInstanceCtx(rowIndex);
        return (React.createElement("div", { key: row.id },
            rowIndex > 0 ? this.renderSeparator() : null,
            rowRIProps.renderChildBlock(rowRIProps, this.props.block.blockDef.content)));
    };
    QueryRepeatBlockInstance.prototype.renderRows = function () {
        var _this = this;
        if (this.state.error) {
            // TODO localize
            return React.createElement("div", { className: "alert alert-danger" }, "Error loading data");
        }
        if (!this.state.rows) {
            return React.createElement("i", { className: "fa fa-spinner fa-spin" });
        }
        if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
            return React.createElement("div", { style: { fontStyle: "italic" } }, localization_1.localize(this.props.block.blockDef.noRowsMessage, this.props.instanceCtx.locale));
        }
        return this.state.rows.map(function (row, rowIndex) { return _this.renderRow(row, rowIndex); });
    };
    QueryRepeatBlockInstance.prototype.render = function () {
        var riProps = this.props.instanceCtx;
        var style = {
            marginTop: 5
        };
        // Fade if refreshing
        if (this.state.refreshing) {
            style.opacity = 0.6;
        }
        return (React.createElement("div", null, this.renderRows()));
    };
    return QueryRepeatBlockInstance;
}(React.Component));
exports.default = QueryRepeatBlockInstance;
