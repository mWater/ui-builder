"use strict";
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
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const localization_1 = require("../../localization");
const async_1 = __importDefault(require("react-select/async"));
/** Dropdown filter that is a text[]. Should search in database for matches, returning value to match */
class TextArrInstance extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.getOptions = (input) => __awaiter(this, void 0, void 0, function* () {
            // Load options if not loaded
            if (!this.options) {
                this.options = yield this.loadOptions();
            }
            // Filter by input string
            if (input) {
                return this.options.filter(o => o.label.toLowerCase().startsWith(input.toLowerCase()));
            }
            else {
                return this.options;
            }
        });
        this.handleChange = (option) => {
            const value = option ? (option.value || null) : null; // Blank is null
            this.props.onChange(value);
        };
    }
    loadOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const contextVar = this.props.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId);
            const table = contextVar.table;
            const whereExprs = [];
            // Add context var value to only show possible text values. Do not filter on other
            // filters, as this causes problems due to https://github.com/JedWatson/react-select/issues/4012
            // as well as needing to exclude self-filters
            const cvValue = this.props.instanceCtx.contextVarValues[contextVar.id];
            if (cvValue) {
                whereExprs.push(cvValue);
            }
            // Filter out blanks
            whereExprs.push({
                type: "op",
                op: "is not null",
                table: table,
                exprs: [this.props.blockDef.filterExpr]
            });
            // Query all distinct values, which will include possibly more than one copy of each text string, as it
            // can appear in different combinations
            const queryOptions = {
                select: { value: this.props.blockDef.filterExpr },
                distinct: true,
                from: table,
                where: {
                    type: "op",
                    op: "and",
                    table: table,
                    exprs: whereExprs
                },
                limit: 250
            };
            try {
                const rows = yield this.props.database.query(queryOptions, this.props.contextVars, {});
                // Flatten and keep distinct
                const values = lodash_1.default.uniq(lodash_1.default.flatten(rows.map(r => r.value))).sort();
                return values.map(v => ({ value: v, label: v }));
            }
            catch (err) {
                // TODO localize
                alert("Unable to load options");
                return [];
            }
        });
    }
    render() {
        const currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null;
        // Make minimum size to fit text
        const minWidth = Math.min(300, Math.max(this.props.value ? this.props.value.length * 8 + 90 : 0, 150));
        const noOptionsMessage = () => "Type to search";
        const styles = {
            control: (style) => (Object.assign(Object.assign({}, style), { minWidth: minWidth })),
            menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
        };
        return react_1.default.createElement(async_1.default, { placeholder: localization_1.localize(this.props.blockDef.placeholder, this.props.locale), value: currentValue, defaultOptions: true, loadOptions: this.getOptions, onChange: this.handleChange, isClearable: true, noOptionsMessage: noOptionsMessage, styles: styles, classNamePrefix: "react-select-short", menuPortalTarget: document.body });
    }
}
exports.default = TextArrInstance;
