"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdDropdownComponent = void 0;
var async_1 = __importDefault(require("react-select/async"));
var react_1 = require("react");
var react_2 = __importDefault(require("react"));
/** Displays a combo box that allows selecting one text values from an expression */
function IdDropdownComponent(props) {
    var _a = react_1.useState(), currentValue = _a[0], setCurrentValue = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    /** Creates an option from a query row that is in form { id:, label0:, label1:, ...} */
    var rowToOption = function (row) {
        var value = { id: row.id, labelValues: [] };
        for (var i = 0; i < props.labelEmbeddedExprs.length; i++) {
            value.labelValues[i] = row["label" + i];
        }
        return value;
    };
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
            var query = {
                select: {
                    id: { type: "id", table: props.table }
                },
                from: props.table,
                where: where
            };
            // Add label exprs
            for (var i = 0; i < props.labelEmbeddedExprs.length; i++) {
                query.select["label" + i] = props.labelEmbeddedExprs[i];
            }
            var results = props.database.query(query, props.contextVars, props.contextVarValues);
            results.then(function (rows) {
                if (props.multi) {
                    if (rows[0]) {
                        setCurrentValue(rows.map(function (r) { return rowToOption(r); }));
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
            var orFilter = {
                type: "op", table: props.table, op: "or",
                exprs: props.searchExprs.map(function (se) { return ({ type: "op", table: props.table, op: "~*", exprs: [
                        se,
                        { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
                    ] }); })
            };
            filters.push(orFilter);
        }
        if (props.filterExpr) {
            filters.push(props.filterExpr);
        }
        // Perform query to get options
        var query = {
            select: {
                id: { type: "id", table: props.table }
            },
            from: props.table,
            where: filters.length > 1 ? { type: "op", table: props.table, op: "and", exprs: filters } : filters[0],
            orderBy: props.orderBy,
            limit: 50
        };
        // Add label exprs
        for (var i = 0; i < props.labelEmbeddedExprs.length; i++) {
            query.select["label" + i] = props.labelEmbeddedExprs[i];
        }
        var results = props.database.query(query, props.contextVars, props.contextVarValues);
        results.then(function (rows) {
            callback(rows.map(function (r) { return rowToOption(r); }));
        });
    }, [props.table, props.filterExpr]);
    var handleChange = react_1.useCallback(function (option) {
        if (props.multi) {
            props.onChange(option && option.length > 0 ? option.map(function (v) { return v.id; }) : null);
        }
        else {
            props.onChange(option ? option.id : null);
        }
    }, [props.onChange]);
    var getOptionLabel = react_1.useCallback(function (option) {
        return props.formatLabel(option.labelValues);
    }, [props.formatLabel]);
    var getOptionValue = react_1.useCallback(function (option) {
        return option.id + "";
    }, []);
    return react_2.default.createElement("div", { style: { width: "100%", minWidth: 160 } },
        react_2.default.createElement(async_1.default, { value: currentValue, placeholder: props.placeholder, loadOptions: loadOptions, isMulti: props.multi, isClearable: true, isLoading: loading, onChange: handleChange, noOptionsMessage: function () { return "..."; }, defaultOptions: true, closeMenuOnScroll: true, menuPortalTarget: document.body, getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, classNamePrefix: "react-select-short", styles: props.styles }));
}
exports.IdDropdownComponent = IdDropdownComponent;
/** Escape a regex */
var escapeRegex = function (str) { return str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&"); };
