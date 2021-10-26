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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const localization_1 = require("../../localization");
const async_1 = __importDefault(require("react-select/async"));
const hooks_1 = require("../../../hooks");
/** Dropdown filter that is a text string. Should search in database for matches */
function TextInstance(props) {
    const getOptions = (0, hooks_1.useStabilizeFunction)((input) => __awaiter(this, void 0, void 0, function* () {
        const contextVar = props.contextVars.find((cv) => cv.id === props.blockDef.rowsetContextVarId);
        const table = contextVar.table;
        const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const whereExprs = [];
        // Add context var value to only show possible text values. Do not filter on other
        // filters, as this causes problems due to https://github.com/JedWatson/react-select/issues/4012
        // as well as needing to exclude self-filters
        const cvValue = props.instanceCtx.contextVarValues[contextVar.id];
        if (cvValue) {
            whereExprs.push(cvValue);
        }
        // Filter by input string
        whereExprs.push({
            type: "op",
            op: "~*",
            table: table,
            exprs: [props.blockDef.filterExpr, { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }]
        });
        const queryOptions = {
            select: { value: props.blockDef.filterExpr },
            distinct: true,
            from: table,
            where: {
                type: "op",
                op: "and",
                table: table,
                exprs: whereExprs
            },
            orderBy: [{ expr: props.blockDef.filterExpr, dir: "asc" }],
            limit: 250
        };
        try {
            const rows = yield props.database.query(queryOptions, props.contextVars, {});
            // Filter null and blank
            const values = rows.map((r) => r.value).filter((v) => v);
            return values.map((v) => ({ value: v, label: v }));
        }
        catch (err) {
            // TODO localize
            alert("Unable to load options");
            return [];
        }
    }));
    const handleChange = (0, hooks_1.useStabilizeFunction)((option) => {
        const value = option ? option.value || null : null; // Blank is null
        props.onChange(value);
    });
    const currentValue = props.value ? { value: props.value, label: props.value } : null;
    // Make minimum size to fit text
    const minWidth = Math.min(300, Math.max(props.value ? props.value.length * 8 + 90 : 0, 150));
    const noOptionsMessage = (0, react_1.useCallback)(() => "Type to search", []);
    const styles = (0, react_1.useMemo)(() => {
        return {
            control: (style) => (Object.assign(Object.assign({}, style), { minWidth: minWidth })),
            menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
        };
    }, [minWidth]);
    return (react_1.default.createElement(MemoAsync, { placeholder: (0, localization_1.localize)(props.blockDef.placeholder, props.locale), value: currentValue, defaultOptions: true, loadOptions: getOptions, onChange: handleChange, isClearable: true, noOptionsMessage: noOptionsMessage, styles: styles }));
}
exports.default = TextInstance;
const MemoAsync = (0, react_1.memo)((props) => {
    return (react_1.default.createElement(async_1.default, { placeholder: props.placeholder, value: props.value, defaultOptions: props.defaultOptions, loadOptions: props.loadOptions, onChange: props.onChange, isClearable: props.isClearable, noOptionsMessage: props.noOptionsMessage, styles: props.styles, classNamePrefix: "react-select-short", menuPortalTarget: document.body }));
});
