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
exports.TagsEditorBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const ControlBlock_1 = require("./ControlBlock");
const async_creatable_1 = __importDefault(require("react-select/async-creatable"));
const react_select_1 = __importDefault(require("react-select"));
/** Block which shows a dropdown control to select existing or create new tags */
class TagsEditorBlock extends ControlBlock_1.ControlBlock {
    renderControl(props) {
        const styles = {
            control: (base) => (Object.assign(Object.assign({}, base), { minWidth: 150 })),
            // Keep menu above other controls
            menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
        };
        // If can't be displayed properly
        const defaultControl = (react_1.default.createElement("div", { style: { padding: 5 } },
            react_1.default.createElement(react_select_1.default, { classNamePrefix: "react-select-short", styles: styles, menuPortalTarget: document.body })));
        // If can't be rendered due to missing context variable, just show error
        if (!props.rowContextVar || !this.blockDef.column) {
            return defaultControl;
        }
        // Get column
        const column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        if (!column) {
            return defaultControl;
        }
        return (react_1.default.createElement(TagEditorInstance, { table: props.rowContextVar.table, disabled: props.disabled, column: column.id, database: props.database, value: props.value, onChange: props.onChange }));
    }
    /** Filter the columns that this control is for. Must be text[] */
    filterColumn(column) {
        return !column.expr && column.type == "text[]";
    }
}
exports.TagsEditorBlock = TagsEditorBlock;
/** Allows editing of a series of tags, allowing selecting existing or creating new */
class TagEditorInstance extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.getOptions = (input) => __awaiter(this, void 0, void 0, function* () {
            // Load options if not loaded
            if (!this.options) {
                this.options = yield this.loadOptions();
            }
            // Filter by input string
            if (input) {
                return this.options.filter((o) => o.label.toLowerCase().startsWith(input.toLowerCase()));
            }
            else {
                return this.options;
            }
        });
        this.handleChange = (value) => {
            if (!this.props.onChange) {
                return;
            }
            if (value) {
                this.props.onChange(value.map((v) => v.value));
            }
            else {
                this.props.onChange(null);
            }
        };
    }
    loadOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const { table, column } = this.props;
            // Query all distinct values, which will include possibly more than one copy of each text string, as it
            // can appear in different combinations
            const queryOptions = {
                select: { value: { type: "field", table, column } },
                distinct: true,
                from: table,
                where: {
                    type: "op",
                    op: "is not null",
                    table,
                    exprs: [{ type: "field", table, column }]
                },
                limit: 250
            };
            try {
                const rows = yield this.props.database.query(queryOptions, [], {});
                // Flatten and keep distinct
                const values = lodash_1.default.uniq(lodash_1.default.flatten(rows.map((r) => r.value))).sort();
                return values.map((v) => ({ value: v, label: v }));
            }
            catch (err) {
                // TODO localize
                alert("Unable to load options");
                return [];
            }
        });
    }
    render() {
        const styles = {
            control: (style) => (Object.assign({}, style)),
            menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
        };
        return (react_1.default.createElement(async_creatable_1.default, { cacheOptions: true, defaultOptions: true, loadOptions: this.getOptions, styles: styles, value: this.props.value ? this.props.value.map((v) => ({ value: v, label: v })) : null, classNamePrefix: "react-select-short", menuPortalTarget: document.body, isMulti: true, onChange: this.handleChange, isDisabled: this.props.disabled || !this.props.onChange }));
    }
}
