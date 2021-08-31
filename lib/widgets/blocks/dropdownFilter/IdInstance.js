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
exports.IdInstance = void 0;
const react_1 = __importStar(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("../../blocks");
const IdDropdownComponent_1 = require("../controls/IdDropdownComponent");
const embeddedExprs_1 = require("../../../embeddedExprs");
const localization_1 = require("../../localization");
const hooks_1 = require("../../../hooks");
/** Dropdown filter that is an id */
const IdInstance = (props) => {
    const { blockDef } = props;
    const exprUtils = new mwater_expressions_1.ExprUtils(props.ctx.schema, (0, blocks_1.createExprVariables)(props.ctx.contextVars));
    const idTable = exprUtils.getExprIdTable(props.blockDef.filterExpr);
    const locale = props.ctx.locale;
    const schema = props.ctx.schema;
    const formatLocale = props.ctx.formatLocale;
    const formatIdLabel = (0, react_1.useCallback)((labelValues) => {
        if (props.blockDef.idMode == "advanced") {
            return (0, embeddedExprs_1.formatEmbeddedExprString)({
                text: (0, localization_1.localize)(blockDef.idLabelText, props.ctx.locale),
                contextVars: [],
                embeddedExprs: blockDef.idLabelEmbeddedExprs,
                exprValues: labelValues,
                formatLocale: formatLocale,
                locale: locale,
                schema: schema
            });
        }
        else {
            return labelValues[0];
        }
    }, [blockDef, locale, schema, formatLocale]);
    const labelEmbeddedExprs = (0, react_1.useMemo)(() => {
        return blockDef.idMode == "advanced"
            ? (blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr)
            : [blockDef.idLabelExpr];
    }, [blockDef]);
    const searchExprs = (0, react_1.useMemo)(() => {
        return blockDef.idMode == "advanced"
            ? blockDef.idSearchExprs || []
            : [blockDef.idLabelExpr];
    }, [blockDef]);
    const orderBy = (0, react_1.useMemo)(() => {
        return blockDef.idMode == "advanced"
            ? blockDef.idOrderBy || []
            : [{ expr: blockDef.idLabelExpr, dir: "asc" }];
    }, [blockDef]);
    const styles = (0, react_1.useMemo)(() => {
        return { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) };
    }, []);
    // Stabilize functions and values
    const onChange = (0, hooks_1.useStabilizeFunction)(props.onChange);
    const contextVars = (0, hooks_1.useStabilizeValue)(props.ctx.contextVars);
    const contextVarValues = (0, hooks_1.useStabilizeValue)(props.ctx.contextVarValues);
    return react_1.default.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.ctx.database, table: idTable, value: props.value, onChange: onChange, multi: false, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: props.blockDef.idFilterExpr || null, formatLabel: formatIdLabel, placeholder: (0, localization_1.localize)(props.blockDef.placeholder, props.locale), contextVars: contextVars, contextVarValues: contextVarValues, styles: styles });
};
exports.IdInstance = IdInstance;
