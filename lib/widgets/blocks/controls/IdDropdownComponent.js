"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdDropdownComponent = void 0;
const react_select_1 = __importDefault(require("react-select"));
const Database_1 = require("../../../database/Database");
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
/** Displays a combo box that allows selecting one id value from a list */
function IdDropdownComponent(props) {
    const [currentValue, setCurrentValue] = (0, react_1.useState)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [inputValue, setInputValue] = (0, react_1.useState)("");
    const [options, setOptions] = (0, react_1.useState)([]);
    // Keep track of latest input value to ensure options are latest
    const inputValueRef = react_2.default.useRef(inputValue);
    inputValueRef.current = inputValue;
    // Increment when database is changed
    const refreshTrigger = (0, Database_1.useDatabaseChangeListener)(props.database);
    /** Creates an option from a query row that is in form { id:, label0:, label1:, ...} */
    const rowToOption = (row) => {
        const value = { id: row.id, labelValues: [] };
        for (let i = 0; i < props.labelEmbeddedExprs.length; i++) {
            value.labelValues[i] = row[`label${i}`];
        }
        return value;
    };
    // Load current value
    (0, react_1.useEffect)(() => {
        if (props.value) {
            setLoading(true);
            const where = props.multi
                ? {
                    type: "op",
                    op: "= any",
                    table: props.table,
                    exprs: [
                        { type: "id", table: props.table },
                        { type: "literal", idTable: props.table, valueType: "id[]", value: props.value }
                    ]
                }
                : {
                    type: "op",
                    op: "=",
                    table: props.table,
                    exprs: [
                        { type: "id", table: props.table },
                        { type: "literal", idTable: props.table, valueType: "id", value: props.value }
                    ]
                };
            const query = {
                select: {
                    id: { type: "id", table: props.table }
                },
                from: props.table,
                where: where
            };
            // Add label exprs
            for (let i = 0; i < props.labelEmbeddedExprs.length; i++) {
                query.select[`label${i}`] = props.labelEmbeddedExprs[i];
            }
            const results = props.database.query(query, props.contextVars, props.contextVarValues);
            results
                .then((rows) => {
                if (props.multi) {
                    if (rows[0]) {
                        setCurrentValue(rows.map((r) => rowToOption(r)));
                    }
                    else {
                        setCurrentValue(undefined);
                    }
                }
                else {
                    if (rows[0]) {
                        setCurrentValue(rowToOption(rows[0]));
                    }
                    else {
                        setCurrentValue(undefined);
                    }
                }
                setLoading(false);
            })
                .catch((err) => {
                throw err;
            });
        }
        else {
            setCurrentValue(undefined);
        }
    }, [props.value, props.table, props.multi, refreshTrigger]);
    // Callback that react-select uses to get values
    const loadOptions = (0, react_1.useCallback)((input) => {
        // Determine filter expressions
        const filters = [];
        if (input) {
            const orFilter = {
                type: "op",
                table: props.table,
                op: "or",
                exprs: props.searchExprs.map((se) => ({
                    type: "op",
                    table: props.table,
                    op: "~*",
                    exprs: [se, { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }]
                }))
            };
            filters.push(orFilter);
        }
        if (props.filterExpr) {
            filters.push(props.filterExpr);
        }
        // Perform query to get options
        const query = {
            select: {
                id: { type: "id", table: props.table }
            },
            from: props.table,
            where: filters.length > 1 ? { type: "op", table: props.table, op: "and", exprs: filters } : filters[0],
            orderBy: props.orderBy,
            limit: 50
        };
        // Add label exprs
        for (let i = 0; i < props.labelEmbeddedExprs.length; i++) {
            query.select[`label${i}`] = props.labelEmbeddedExprs[i];
        }
        const results = props.database.query(query, props.contextVars, props.contextVarValues);
        results.then((rows) => {
            // If not stale, set options
            if (inputValueRef.current == input) {
                setOptions(rows.map((r) => rowToOption(r)));
            }
        });
    }, [props.table, props.filterExpr]);
    (0, react_1.useEffect)(() => {
        loadOptions(inputValue);
    }, [inputValue, refreshTrigger]);
    const handleChange = (0, react_1.useCallback)((option) => {
        if (!props.onChange) {
            return;
        }
        if (props.multi) {
            props.onChange(option && option.length > 0 ? option.map((v) => v.id) : null);
        }
        else {
            props.onChange(option ? option.id : null);
        }
    }, [props.onChange]);
    const getOptionLabel = (0, react_1.useCallback)((option) => {
        return props.formatLabel(option.labelValues);
    }, [props.formatLabel]);
    const getOptionValue = (0, react_1.useCallback)((option) => {
        return option.id + "";
    }, []);
    // Filtering is done by query
    const filterOption = (0, react_1.useCallback)(() => true, []);
    return (react_2.default.createElement("div", { style: { width: "100%", minWidth: 160 } },
        react_2.default.createElement(react_select_1.default, { inputValue: inputValue, onInputChange: setInputValue, value: currentValue, placeholder: props.placeholder, isMulti: props.multi, isClearable: true, isLoading: loading, onChange: props.onChange ? handleChange : undefined, options: loading ? [] : options, filterOption: filterOption, isDisabled: !props.onChange, noOptionsMessage: () => "...", closeMenuOnScroll: true, menuPortalTarget: document.body, getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, classNamePrefix: "react-select-short", styles: props.styles })));
}
/** Escape a regex */
const escapeRegex = (str) => str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
// Memoize for speed
const MemoIdDropdownComponent = (0, react_1.memo)(IdDropdownComponent);
exports.IdDropdownComponent = MemoIdDropdownComponent;
