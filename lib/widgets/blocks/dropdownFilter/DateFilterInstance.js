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
var react_1 = __importDefault(require("react"));
var react_select_1 = __importDefault(require("react-select"));
/** Simple date filter that is year, month or year-month */
exports.DateFilterInstance = function (props) {
    var options = [];
    var months = [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" }
    ];
    if (props.mode == "month") {
        options = months;
    }
    else if (props.mode == "year") {
        var year = new Date().getFullYear();
        for (var y = year; y >= year - 10; y--) {
            options.push({ value: y + "-01-01", label: "" + y });
        }
    }
    else if (props.mode == "yearmonth") {
        var year = new Date().getFullYear();
        for (var y = year; y >= year - 10; y--) {
            for (var m = (y == year) ? new Date().getMonth() : 11; m >= 0; m--) {
                options.push({ value: y + "-" + months[m].value + "-01", label: months[m].label + " " + y });
            }
        }
    }
    var styles = {
        // control: (style: CSSProperties) => ({ ...style, minWidth: minWidth }),
        menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
    };
    var handleChange = function (ev) { return props.onChange(ev ? ev.value : null); };
    // Find option
    var option = options.find(function (opt) { return opt.value == props.value; });
    return react_1.default.createElement(react_select_1.default, { value: option, onChange: handleChange, options: options, placeholder: props.placeholder, isClearable: true, styles: styles, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short" });
};
