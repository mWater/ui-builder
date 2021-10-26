"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDateFilterExpr = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_onclickout_1 = __importDefault(require("react-onclickout"));
const react_datepicker_1 = __importDefault(require("react-datepicker"));
const moment_1 = __importDefault(require("moment"));
const react_1 = __importDefault(require("react"));
require("react-datepicker/dist/react-datepicker.css");
require("./datepicker-tweaks.css");
const localization_1 = require("../../localization");
const presets = [
    {
        id: "thisyear",
        name: {
            _base: "en",
            en: "This Year",
            es: "Este año"
        }
    },
    {
        id: "lastyear",
        name: {
            _base: "en",
            en: "Last Year",
            es: "El año pasado"
        }
    },
    {
        id: "thismonth",
        name: {
            _base: "en",
            en: "This Month",
            es: "Este mes"
        }
    },
    {
        id: "lastmonth",
        name: {
            _base: "en",
            en: "Last Month",
            es: "Último Mes"
        }
    },
    {
        id: "today",
        name: {
            _base: "en",
            en: "Today",
            es: "Hoy"
        }
    },
    {
        id: "yesterday",
        name: {
            _base: "en",
            en: "Yesterday",
            es: "Ayer"
        }
    },
    {
        id: "last24hours",
        name: {
            _base: "en",
            en: "In Last 24 Hours",
            es: "En las últimas 24 horas"
        }
    },
    {
        id: "last7days",
        name: {
            _base: "en",
            en: "In Last 7 Days",
            es: "En los últimos 7 días"
        }
    },
    {
        id: "last30days",
        name: {
            _base: "en",
            en: "In Last 30 Days",
            es: "En los últimos 30 días"
        }
    },
    {
        id: "last365days",
        name: {
            _base: "en",
            en: "In Last 365 Days",
            es: "En los últimos 365 días"
        }
    }
];
const toLiteral = (datetime, value) => {
    if (!value) {
        return null;
    }
    if (datetime) {
        return { type: "literal", valueType: "datetime", value: value };
    }
    else {
        return { type: "literal", valueType: "date", value: value };
    }
};
/** Convert a filter value to an expression */
const createDateFilterExpr = (table, expr, datetime, value) => {
    if (!value) {
        return null;
    }
    if (Array.isArray(value)) {
        return {
            type: "op",
            op: "between",
            table: table,
            exprs: [expr, toLiteral(datetime, value[0]), toLiteral(datetime, value[1])]
        };
    }
    // Preset
    return {
        type: "op",
        op: value,
        table: table,
        exprs: [expr]
    };
};
exports.createDateFilterExpr = createDateFilterExpr;
/** Allows selection of a date range including presets */
class DateExprComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleClickOut = () => {
            this.setState({ dropdownOpen: false });
        };
        this.handleCustom = () => {
            this.setState({ custom: true });
        };
        this.handleStartChange = (value) => {
            // Clear end if after
            if (lodash_1.default.isArray(this.props.value) && this.props.value[1] && this.fromMoment(value) > this.props.value[1]) {
                this.props.onChange([this.fromMoment(value), null]);
            }
            else {
                this.props.onChange([this.fromMoment(value), lodash_1.default.isArray(this.props.value) ? this.props.value[1] : null]);
            }
        };
        this.handleEndChange = (value) => {
            // Go to end of day if datetime
            if (this.props.datetime) {
                value = (0, moment_1.default)(value);
                value.endOf("day");
            }
            // Clear start if before
            if (lodash_1.default.isArray(this.props.value) && this.props.value[0] && this.fromMoment(value) < this.props.value[0]) {
                this.props.onChange([null, this.fromMoment(value)]);
            }
            else {
                this.props.onChange([lodash_1.default.isArray(this.props.value) ? this.props.value[0] : null, this.fromMoment(value)]);
            }
            this.setState({ dropdownOpen: false });
        };
        this.handlePreset = (preset) => {
            this.props.onChange(preset.id);
            this.setState({ dropdownOpen: false });
        };
        this.handleOpen = () => {
            this.setState({ dropdownOpen: true, custom: false });
        };
        this.state = {
            dropdownOpen: false,
            custom: false
        };
    }
    toMoment(value) {
        if (!value) {
            return null;
        }
        if (this.props.datetime) {
            return (0, moment_1.default)(value, moment_1.default.ISO_8601);
        }
        else {
            return (0, moment_1.default)(value, "YYYY-MM-DD");
        }
    }
    fromMoment(value) {
        if (!value) {
            return null;
        }
        if (this.props.datetime) {
            return value.toISOString();
        }
        else {
            return value.format("YYYY-MM-DD");
        }
    }
    renderClear() {
        return (react_1.default.createElement("div", { style: { position: "absolute", right: 10, top: 7, color: "#AAA" }, onClick: this.props.onChange.bind(null, null) },
            react_1.default.createElement("i", { className: "fa fa-remove" })));
    }
    renderSummary() {
        if (!this.props.value) {
            return react_1.default.createElement("span", { className: "text-muted" }, this.props.placeholder || "");
        }
        const preset = presets.find((p) => p.id === this.props.value);
        if (preset) {
            return (0, localization_1.localize)(preset.name, this.props.locale);
        }
        if (Array.isArray(this.props.value)) {
            const startDate = this.toMoment(this.props.value[0]);
            const endDate = this.toMoment(this.props.value[1]);
            // Add/subtract hours to work around https://github.com/moment/moment/issues/2749
            if (this.props.datetime) {
                return ((startDate ? startDate.add("hours", 3).format("ll") : "") +
                    " - " +
                    (endDate ? endDate.subtract("hours", 3).format("ll") : ""));
            }
            else {
                return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
            }
        }
        return "???";
    }
    renderPresets() {
        return (react_1.default.createElement("div", { style: {
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 4000,
                padding: 5,
                border: "solid 1px #AAA",
                backgroundColor: "white",
                borderRadius: 4
            } },
            react_1.default.createElement("ul", { className: "nav nav-pills nav-stacked" },
                presets.map((preset) => {
                    return (react_1.default.createElement("li", { key: preset.id },
                        react_1.default.createElement("a", { style: { padding: 5 }, onClick: this.handlePreset.bind(null, preset) }, (0, localization_1.localize)(preset.name, this.props.locale))));
                }),
                react_1.default.createElement("li", null,
                    react_1.default.createElement("a", { style: { padding: 5 }, onClick: this.handleCustom }, (0, localization_1.localize)({
                        _base: "en",
                        en: "Custom Date Range...",
                        es: "Rango de fechas personalizado...."
                    }, this.props.locale))))));
    }
    renderDropdown() {
        if (this.state.custom) {
            return this.renderCustomDropdown();
        }
        else {
            return this.renderPresets();
        }
    }
    renderCustomDropdown() {
        const startDate = this.toMoment(lodash_1.default.isArray(this.props.value) ? this.props.value[0] : null) || undefined;
        const endDate = this.toMoment(lodash_1.default.isArray(this.props.value) ? this.props.value[1] : null) || undefined;
        return (react_1.default.createElement("div", { style: {
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 4000,
                padding: 5,
                border: "solid 1px #AAA",
                backgroundColor: "white",
                borderRadius: 4
            } },
            react_1.default.createElement("div", { style: { whiteSpace: "nowrap" } },
                react_1.default.createElement("div", { style: { display: "inline-block", verticalAlign: "top" } },
                    react_1.default.createElement(react_datepicker_1.default, { inline: true, selectsStart: true, selected: startDate, startDate: startDate, endDate: endDate, showYearDropdown: true, onChange: this.handleStartChange })),
                react_1.default.createElement("div", { style: { display: "inline-block", verticalAlign: "top" } },
                    react_1.default.createElement(react_datepicker_1.default, { inline: true, selectsEnd: true, selected: endDate, startDate: startDate, endDate: endDate, showYearDropdown: true, onChange: this.handleEndChange })))));
    }
    render() {
        return (react_1.default.createElement(react_onclickout_1.default, { onClickOut: this.handleClickOut },
            react_1.default.createElement("div", { style: { display: "inline-block", position: "relative" } },
                react_1.default.createElement("div", { className: "form-control", style: { width: 220, height: 34 }, onClick: this.handleOpen }, this.renderSummary()),
                this.props.value && this.props.onChange ? this.renderClear() : null,
                this.state.dropdownOpen ? this.renderDropdown() : null)));
    }
}
exports.default = DateExprComponent;
