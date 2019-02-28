"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("../../blocks");
const localization_1 = require("../../localization");
const Async_1 = __importDefault(require("react-select/lib/Async"));
/** Dropdown filter that is a text string. Should search in database for matches */
class TextInstance extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.getOptions = (input) => __awaiter(this, void 0, void 0, function* () {
            const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr);
            const contextVar = this.props.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId);
            const table = contextVar.table;
            const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const queryOptions = {
                select: { value: this.props.blockDef.filterExpr },
                distinct: true,
                from: table,
                where: {
                    type: "op",
                    op: "~*",
                    table: table,
                    exprs: [
                        this.props.blockDef.filterExpr,
                        { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
                    ]
                },
                orderBy: [{ expr: this.props.blockDef.filterExpr, dir: "asc" }],
                limit: 250
            };
            const rows = yield this.props.database.query(queryOptions, this.props.contextVars, {});
            // Filter null and blank
            const values = rows.map(r => r.value).filter(v => v);
            return values.map(v => ({ value: v, label: v }));
        });
        this.handleChange = (option) => {
            const value = option ? (option.value || null) : null; // Blank is null
            this.props.onChange(value);
        };
    }
    render() {
        const currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null;
        const noOptionsMessage = () => "Type to search";
        const styles = {
            control: (base) => (Object.assign({}, base, { height: 34, minHeight: 34, minWidth: 150 })),
            // Keep menu above other controls
            menu: (style) => (Object.assign({}, style, { zIndex: 2000 }))
        };
        // TODO key: JSON.stringify(@props.filters)  # Include to force a change when filters change
        return react_1.default.createElement(Async_1.default, { placeholder: localization_1.localize(this.props.blockDef.placeholder, this.props.locale), value: currentValue, defaultOptions: true, cacheOptions: null, loadOptions: this.getOptions, onChange: this.handleChange, isClearable: true, noOptionsMessage: noOptionsMessage, styles: styles });
        // styles: { 
        //   # Keep menu above fixed data table headers
        //   menu: (style) => _.extend({}, style, zIndex: 2)
        // }
    }
}
exports.default = TextInstance;
//# sourceMappingURL=TextInstance.js.map