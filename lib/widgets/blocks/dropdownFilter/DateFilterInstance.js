"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFilterInstance = void 0;
const react_1 = __importDefault(require("react"));
const react_select_1 = __importDefault(require("react-select"));
/** Simple date filter that is year, month or year-month */
const DateFilterInstance = (props) => {
    let options = [];
    const months = [
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
        const year = new Date().getFullYear();
        for (let y = year; y >= year - 10; y--) {
            options.push({ value: `${y}-01-01`, label: `${y}` });
        }
    }
    else if (props.mode == "yearmonth") {
        const year = new Date().getFullYear();
        for (let y = year; y >= year - 10; y--) {
            for (let m = y == year ? new Date().getMonth() : 11; m >= 0; m--) {
                options.push({ value: `${y}-${months[m].value}-01`, label: `${months[m].label} ${y}` });
            }
        }
    }
    const styles = {
        // control: (style: CSSProperties) => ({ ...style, minWidth: minWidth }),
        menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
    };
    const handleChange = (ev) => props.onChange(ev ? ev.value : null);
    // Find option
    const option = options.find((opt) => opt.value == props.value);
    return (react_1.default.createElement(react_select_1.default, { value: option, onChange: handleChange, options: options, placeholder: props.placeholder, isClearable: true, styles: styles, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short" }));
};
exports.DateFilterInstance = DateFilterInstance;
