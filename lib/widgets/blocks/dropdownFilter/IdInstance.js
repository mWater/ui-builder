"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdInstance = void 0;
const react_1 = __importDefault(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("../../blocks");
const IdDropdownComponent_1 = require("../controls/IdDropdownComponent");
const embeddedExprs_1 = require("../../../embeddedExprs");
const localization_1 = require("../../localization");
/** Dropdown filter that is an id */
exports.IdInstance = (props) => {
    const exprUtils = new mwater_expressions_1.ExprUtils(props.ctx.schema, blocks_1.createExprVariables(props.ctx.contextVars));
    const idTable = exprUtils.getExprIdTable(props.blockDef.filterExpr);
    const formatIdLabel = (labelValues) => {
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
    let labelEmbeddedExprs;
    let searchExprs;
    let orderBy;
    // Handle modes
    if (props.blockDef.idMode == "advanced") {
        labelEmbeddedExprs = (props.blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr);
        searchExprs = props.blockDef.idSearchExprs || [];
        orderBy = props.blockDef.idOrderBy || [];
    }
    else {
        labelEmbeddedExprs = [props.blockDef.idLabelExpr];
        searchExprs = [props.blockDef.idLabelExpr];
        orderBy = [{ expr: props.blockDef.idLabelExpr, dir: "asc" }];
    }
    return react_1.default.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.ctx.database, table: idTable, value: props.value, onChange: props.onChange, multi: false, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: props.blockDef.idFilterExpr || null, formatLabel: formatIdLabel, placeholder: localization_1.localize(props.blockDef.placeholder, props.locale), contextVars: props.ctx.contextVars, contextVarValues: props.ctx.contextVarValues, styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
};
