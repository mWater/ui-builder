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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var localization_1 = require("../../localization");
var contexts_1 = require("../../../contexts");
/** Instance of a query table */
var QueryTableBlockInstance = /** @class */ (function (_super) {
    __extends(QueryTableBlockInstance, _super);
    function QueryTableBlockInstance(props) {
        var _this = _super.call(this, props) || this;
        /** Change listener to refresh database */
        _this.handleChange = function () {
            _this.performQuery();
        };
        _this.handleShowMore = function () {
            _this.setState({ limit: _this.state.limit + _this.props.block.blockDef.limit });
        };
        // First column with initial ordering sets the initial ordering
        var columnOrderIndex = null;
        var columnOrderDir = "asc";
        var blockDef = _this.props.block.blockDef;
        for (var colIndex = 0; colIndex < blockDef.contents.length; colIndex++) {
            if (blockDef.columnInfos && blockDef.columnInfos[colIndex] && blockDef.columnInfos[colIndex].orderExpr && blockDef.columnInfos[colIndex].initialOrderDir) {
                columnOrderIndex = colIndex;
                columnOrderDir = blockDef.columnInfos[colIndex].initialOrderDir;
            }
        }
        _this.state = {
            refreshing: false,
            columnOrderIndex: columnOrderIndex,
            columnOrderDir: columnOrderDir,
            limit: props.block.blockDef.limit,
            moreRowsAvail: false
        };
        return _this;
    }
    QueryTableBlockInstance.prototype.componentDidMount = function () {
        this.props.instanceCtx.database.addChangeListener(this.handleChange);
        this.performQuery();
    };
    QueryTableBlockInstance.prototype.componentDidUpdate = function (prevProps) {
        // Redo query if changed
        var newQueryOptions = this.createQuery();
        if (!_.isEqual(newQueryOptions, this.queryOptions) || !_.isEqual(this.props.instanceCtx.contextVarValues, prevProps.instanceCtx.contextVarValues)) {
            this.performQuery();
        }
    };
    QueryTableBlockInstance.prototype.componentWillUnmount = function () {
        this.props.instanceCtx.database.removeChangeListener(this.handleChange);
    };
    QueryTableBlockInstance.prototype.createQuery = function () {
        var _this = this;
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
            // Add extra row to see if more available
            limit: this.state.limit != null ? this.state.limit + 1 : null
        };
        // Add column ordering if present
        if (this.state.columnOrderIndex != null) {
            queryOptions.orderBy.push({ expr: block.blockDef.columnInfos[this.state.columnOrderIndex].orderExpr, dir: this.state.columnOrderDir });
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
        rowExprs.forEach(function (expr, index) {
            queryOptions.select["e" + index] = expr;
        });
        // The context variable that represents the row has a value which changes with each row
        // so replace it with { type: "id" ...} expression so that it evaluates as the row id
        queryOptions = mapObject(queryOptions, function (input) {
            if (input && input.type == "variable" && input.variableId == _this.props.block.getRowContextVarId()) {
                return { type: "id", table: queryOptions.from };
            }
            return input;
        });
        return queryOptions;
    };
    QueryTableBlockInstance.prototype.performQuery = function () {
        var _this = this;
        var queryOptions = this.createQuery();
        this.queryOptions = queryOptions;
        // Mark as refreshing
        this.setState({ refreshing: true });
        this.props.instanceCtx.database.query(queryOptions, this.props.instanceCtx.contextVars, contexts_1.getFilteredContextVarValues(this.props.instanceCtx)).then(function (rows) {
            // Check if still relevant
            if (_.isEqual(queryOptions, _this.createQuery())) {
                // Take limit of rows
                var limitedRows = _this.state.limit != null ? _.take(rows, _this.state.limit) : rows;
                _this.setState({
                    rows: limitedRows,
                    refreshing: false,
                    // If soft limit and more available, show that
                    moreRowsAvail: (_this.props.block.blockDef.limitType || "soft") == "soft" && rows.length > limitedRows.length
                });
            }
        }).catch(function (error) {
            _this.setState({ error: error });
        });
    };
    QueryTableBlockInstance.prototype.createRowInstanceCtx = function (rowIndex) {
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
            }, getFilters: function (cvid) {
                // If this creates a rowset, it has no filters as it can't be filtered
                if (cvid == rowcv.id) {
                    return [];
                }
                return rips.getFilters(cvid);
            }, setFilter: function (cvid, filter) {
                // Can't set filter for rowset
                if (cvid == rowcv.id) {
                    throw new Error("Can't set filter for query table rowset");
                }
                rips.setFilter(cvid, filter);
            } });
    };
    QueryTableBlockInstance.prototype.renderRow = function (row, rowIndex) {
        var _this = this;
        var rowRIProps = this.createRowInstanceCtx(rowIndex);
        var handleRowClick = function () {
            // Run action
            if (_this.props.block.blockDef.rowClickAction) {
                var actionDef = _this.props.block.blockDef.rowClickAction;
                var action = _this.props.instanceCtx.actionLibrary.createAction(actionDef);
                action.performAction(__assign({}, rowRIProps));
            }
        };
        // Use row id if possible, otherwise just the index
        var rowKey = this.props.block.blockDef.mode == "singleRow" ? row.id : rowIndex;
        // Show pointer if works on click
        var rowStyle = {};
        if (this.props.block.blockDef.rowClickAction) {
            rowStyle.cursor = "pointer";
        }
        return (React.createElement("tr", { key: rowKey, style: rowStyle }, this.props.block.blockDef.contents.map(function (b, colIndex) {
            return (React.createElement("td", { key: colIndex, onClick: handleRowClick }, rowRIProps.renderChildBlock(rowRIProps, b)));
        })));
    };
    QueryTableBlockInstance.prototype.renderRows = function () {
        var _this = this;
        if (this.state.error) {
            // TODO localize
            return (React.createElement("tr", { key: "error" },
                React.createElement("td", { key: "error", colSpan: this.props.block.blockDef.contents.length },
                    React.createElement("div", { className: "alert alert-danger" }, "Error loading data"))));
        }
        if (!this.state.rows) {
            return (React.createElement("tr", { key: "spin" },
                React.createElement("td", { key: "spin", colSpan: this.props.block.blockDef.contents.length },
                    React.createElement("i", { className: "fa fa-spinner fa-spin" }))));
        }
        if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
            return (React.createElement("tr", { key: "norows" },
                React.createElement("td", { key: "norows", colSpan: this.props.block.blockDef.contents.length, style: { fontStyle: "italic" } }, localization_1.localize(this.props.block.blockDef.noRowsMessage, this.props.instanceCtx.locale))));
        }
        return this.state.rows.map(function (row, rowIndex) { return _this.renderRow(row, rowIndex); });
    };
    /** Render one header of the table */
    QueryTableBlockInstance.prototype.renderHeader = function (header, index) {
        var _this = this;
        var riProps = this.props.instanceCtx;
        var blockDef = this.props.block.blockDef;
        var renderOrder = function () {
            if (!blockDef.columnInfos || !blockDef.columnInfos[index] || !blockDef.columnInfos[index].orderExpr) {
                return null;
            }
            var handleOrderClick = function () {
                // Get current order
                var currentOrder = _this.state.columnOrderIndex == index ? _this.state.columnOrderDir : null;
                if (currentOrder == "asc") {
                    _this.setState({ columnOrderDir: "desc" });
                }
                else if (currentOrder == "desc") {
                    _this.setState({ columnOrderIndex: null });
                }
                else {
                    _this.setState({ columnOrderDir: "asc", columnOrderIndex: index });
                }
            };
            // If not sorted 
            if (_this.state.columnOrderIndex != index) {
                return React.createElement("div", { key: "order", style: { float: "right", color: "#CCC", cursor: "pointer" }, onClick: handleOrderClick },
                    React.createElement("i", { className: "fa fa-sort fa-fw" }));
            }
            return React.createElement("div", { key: "order", style: { float: "right", cursor: "pointer" }, onClick: handleOrderClick }, _this.state.columnOrderDir == "asc" ? React.createElement("i", { className: "fa fa-sort-asc fa-fw" }) : React.createElement("i", { className: "fa fa-sort-desc fa-fw" }));
        };
        return React.createElement("th", { key: index },
            renderOrder(),
            riProps.renderChildBlock(riProps, header));
    };
    /** Render the show more rows at bottom */
    QueryTableBlockInstance.prototype.renderShowMore = function () {
        if (!this.state.moreRowsAvail) {
            return null;
        }
        return React.createElement("tr", { key: "showMore" },
            React.createElement("td", { colSpan: this.props.block.blockDef.contents.length },
                React.createElement("a", { style: { cursor: "pointer" }, onClick: this.handleShowMore }, this.props.instanceCtx.T("Show more..."))));
    };
    QueryTableBlockInstance.prototype.render = function () {
        var _this = this;
        var riProps = this.props.instanceCtx;
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
            case "none":
                className += " table-borderless";
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
        if (blockDef.striped) {
            className += " table-striped";
        }
        return (React.createElement("table", { className: className, style: style },
            React.createElement("colgroup", null, blockDef.contents.map(function (b, colIndex) {
                // Determine width
                var columnInfos = blockDef.columnInfos;
                var width = columnInfos && columnInfos[colIndex] ? columnInfos[colIndex].columnWidth || "auto" : "auto";
                return React.createElement("col", { key: colIndex, style: { width: width } });
            })),
            !blockDef.hideHeaders ?
                React.createElement("thead", null,
                    React.createElement("tr", { key: "header" }, blockDef.headers.map(function (b, index) { return _this.renderHeader(b, index); })))
                : null,
            React.createElement("tbody", null,
                this.renderRows(),
                this.renderShowMore())));
    };
    return QueryTableBlockInstance;
}(React.Component));
exports.default = QueryTableBlockInstance;
/** Replace every part of an object, including array members
 * replacer should return input to leave unchanged
 */
var mapObject = function (obj, replacer) {
    obj = replacer(obj);
    if (!obj) {
        return obj;
    }
    if (_.isArray(obj)) {
        return _.map(obj, function (item) { return mapObject(item, replacer); });
    }
    if (_.isObject(obj)) {
        return _.mapValues(obj, function (item) { return mapObject(item, replacer); });
    }
    return obj;
};
