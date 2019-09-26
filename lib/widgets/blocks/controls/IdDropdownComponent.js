"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Async_1 = __importDefault(require("react-select/lib/Async"));
var react_1 = require("react");
var react_2 = __importDefault(require("react"));
/** Displays a combo box that allows selecting one text values from an expression */
function IdDropdownComponent(props) {
    var _a = react_1.useState(), currentValue = _a[0], setCurrentValue = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    // Load current value
    react_1.useEffect(function () {
        if (props.value) {
            setLoading(true);
            var where = props.multi ?
                { type: "op", op: "= any", table: props.table, exprs: [
                        { type: "id", table: props.table },
                        { type: "literal", idTable: props.table, valueType: "id[]", value: props.value }
                    ] }
                :
                    { type: "op", op: "=", table: props.table, exprs: [
                            { type: "id", table: props.table },
                            { type: "literal", idTable: props.table, valueType: "id", value: props.value }
                        ] };
            var results = props.database.query({
                select: {
                    value: { type: "id", table: props.table },
                    label: props.labelExpr
                },
                from: props.table,
                where: where
            }, props.contextVars, props.contextVarValues);
            results.then(function (rows) {
                if (props.multi) {
                    if (rows[0]) {
                        setCurrentValue(rows);
                    }
                    else {
                        setCurrentValue(undefined);
                    }
                }
                else {
                    if (rows[0]) {
                        setCurrentValue(rows[0]);
                    }
                    else {
                        setCurrentValue(undefined);
                    }
                }
                setLoading(false);
            }).catch(function (err) { throw err; });
        }
        else {
            setCurrentValue(undefined);
        }
    }, [props.value, props.table, props.multi]);
    // Callback that react-select uses to get values
    var loadOptions = react_1.useCallback(function (input, callback) {
        // Determine filter expressions
        var filters = [];
        if (input) {
            filters.push({
                type: "op", table: props.table, op: "~*", exprs: [
                    props.labelExpr,
                    { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
                ]
            });
        }
        if (props.filterExpr) {
            filters.push(props.filterExpr);
        }
        // Perform query to get options
        var results = props.database.query({
            select: {
                value: { type: "id", table: props.table },
                label: props.labelExpr
            },
            from: props.table,
            where: filters.length > 1 ? { type: "op", table: props.table, op: "and", exprs: filters } : filters[0],
            orderBy: [{ expr: props.labelExpr, dir: "asc" }],
            limit: 50
        }, props.contextVars, props.contextVarValues);
        results.then(function (rows) {
            callback(rows);
        });
    }, [props.table, props.labelExpr, props.filterExpr]);
    var handleChange = react_1.useCallback(function (value) {
        if (props.multi) {
            props.onChange(value && value.length > 0 ? value.map(function (v) { return v.value; }) : null);
        }
        else {
            props.onChange(value ? value.value : null);
        }
    }, [props.onChange]);
    return react_2.default.createElement("div", { style: { width: "100%" } },
        react_2.default.createElement(Async_1.default, { value: currentValue, placeholder: props.placeholder, loadOptions: loadOptions, isMulti: props.multi, isClearable: true, isLoading: loading, onChange: handleChange, noOptionsMessage: function () { return "Type to search"; }, defaultOptions: true, closeMenuOnScroll: true, menuPortalTarget: document.body, styles: {
                // Keep menu above fixed data table headers and map
                menu: function (style) {
                    return _.extend({}, style, {
                        zIndex: 2000
                    });
                },
                menuPortal: function (style) {
                    return _.extend({}, style, {
                        zIndex: 2000
                    });
                }
            } }));
}
exports.IdDropdownComponent = IdDropdownComponent;
/** Escape a regex */
var escapeRegex = function (str) { return str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&"); };
