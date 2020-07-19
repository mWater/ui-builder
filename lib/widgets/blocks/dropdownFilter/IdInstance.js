"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdInstance = void 0;
var react_1 = __importDefault(require("react"));
var mwater_expressions_1 = require("mwater-expressions");
var blocks_1 = require("../../blocks");
var IdDropdownComponent_1 = require("../controls/IdDropdownComponent");
var embeddedExprs_1 = require("../../../embeddedExprs");
var localization_1 = require("../../localization");
/** Dropdown filter that is an id */
exports.IdInstance = function (props) {
    var exprUtils = new mwater_expressions_1.ExprUtils(props.ctx.schema, blocks_1.createExprVariables(props.ctx.contextVars));
    var idTable = exprUtils.getExprIdTable(props.blockDef.filterExpr);
    var formatIdLabel = function (labelValues) {
        if (props.blockDef.idMode == "advanced") {
            return embeddedExprs_1.formatEmbeddedExprString({
                text: localization_1.localize(props.blockDef.idLabelText, props.ctx.locale),
                contextVars: [],
                embeddedExprs: props.blockDef.idLabelEmbeddedExprs,
                exprValues: labelValues,
                formatLocale: props.ctx.formatLocale,
                locale: props.ctx.locale,
                schema: props.ctx.schema
            });
        }
        else {
            return labelValues[0];
        }
    };
    var labelEmbeddedExprs;
    var searchExprs;
    var orderBy;
    // Handle modes
    if (props.blockDef.idMode == "advanced") {
        labelEmbeddedExprs = (props.blockDef.idLabelEmbeddedExprs || []).map(function (ee) { return ee.expr; });
        searchExprs = props.blockDef.idSearchExprs || [];
        orderBy = props.blockDef.idOrderBy || [];
    }
    else {
        labelEmbeddedExprs = [props.blockDef.idLabelExpr];
        searchExprs = [props.blockDef.idLabelExpr];
        orderBy = [{ expr: props.blockDef.idLabelExpr, dir: "asc" }];
    }
    return react_1.default.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.ctx.database, table: idTable, value: props.value, onChange: props.onChange, multi: false, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: props.blockDef.idFilterExpr || null, formatLabel: formatIdLabel, contextVars: props.ctx.contextVars, contextVarValues: props.ctx.contextVarValues, styles: { menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); } } });
};
