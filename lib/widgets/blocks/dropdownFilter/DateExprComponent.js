"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var react_onclickout_1 = __importDefault(require("react-onclickout"));
var react_datepicker_1 = __importDefault(require("react-datepicker"));
var moment_1 = __importDefault(require("moment"));
var react_1 = __importDefault(require("react"));
require("react-datepicker/dist/react-datepicker.css");
require("./datepicker-tweaks.css");
var localization_1 = require("../../localization");
var presets = [
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
var toLiteral = function (datetime, value) {
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
exports.createDateFilterExpr = function (table, expr, datetime, value) {
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
/** Allows selection of a date range including presets */
var DateExprComponent = /** @class */ (function (_super) {
    __extends(DateExprComponent, _super);
    function DateExprComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClickOut = function () {
            _this.setState({ dropdownOpen: false });
        };
        _this.handleCustom = function () {
            _this.setState({ custom: true });
        };
        _this.handleStartChange = function (value) {
            // Clear end if after
            if (lodash_1.default.isArray(_this.props.value) && _this.props.value[1] && _this.fromMoment(value) > _this.props.value[1]) {
                _this.props.onChange([_this.fromMoment(value), null]);
            }
            else {
                _this.props.onChange([_this.fromMoment(value), lodash_1.default.isArray(_this.props.value) ? _this.props.value[1] : null]);
            }
        };
        _this.handleEndChange = function (value) {
            // Go to end of day if datetime
            if (_this.props.datetime) {
                value = moment_1.default(value);
                value.endOf("day");
            }
            // Clear start if before
            if (lodash_1.default.isArray(_this.props.value) && _this.props.value[0] && _this.fromMoment(value) < _this.props.value[0]) {
                _this.props.onChange([null, _this.fromMoment(value)]);
            }
            else {
                _this.props.onChange([lodash_1.default.isArray(_this.props.value) ? _this.props.value[0] : null, _this.fromMoment(value)]);
            }
            _this.setState({ dropdownOpen: false });
        };
        _this.handlePreset = function (preset) {
            _this.props.onChange(preset.id);
            _this.setState({ dropdownOpen: false });
        };
        _this.handleOpen = function () {
            _this.setState({ dropdownOpen: true, custom: false });
        };
        _this.state = {
            dropdownOpen: false,
            custom: false
        };
        return _this;
    }
    DateExprComponent.prototype.toMoment = function (value) {
        if (!value) {
            return null;
        }
        if (this.props.datetime) {
            return moment_1.default(value, moment_1.default.ISO_8601);
        }
        else {
            return moment_1.default(value, "YYYY-MM-DD");
        }
    };
    DateExprComponent.prototype.fromMoment = function (value) {
        if (!value) {
            return null;
        }
        if (this.props.datetime) {
            return value.toISOString();
        }
        else {
            return value.format("YYYY-MM-DD");
        }
    };
    DateExprComponent.prototype.renderClear = function () {
        return (react_1.default.createElement("div", { style: { position: "absolute", right: 10, top: 7, color: "#AAA" }, onClick: this.props.onChange.bind(null, null) },
            react_1.default.createElement("i", { className: "fa fa-remove" })));
    };
    DateExprComponent.prototype.renderSummary = function () {
        var _this = this;
        if (!this.props.value) {
            return react_1.default.createElement("span", { className: "text-muted" }, this.props.placeholder || "");
        }
        var preset = presets.find(function (p) { return p.id === _this.props.value; });
        if (preset) {
            return localization_1.localize(preset.name, this.props.locale);
        }
        if (Array.isArray(this.props.value)) {
            var startDate = this.toMoment(this.props.value[0]);
            var endDate = this.toMoment(this.props.value[1]);
            // Add/subtract hours to work around https://github.com/moment/moment/issues/2749
            if (this.props.datetime) {
                return (startDate ? startDate.add("hours", 3).format("ll") : "") + " - " + (endDate ? endDate.subtract("hours", 3).format("ll") : "");
            }
            else {
                return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
            }
        }
        return "???";
    };
    DateExprComponent.prototype.renderPresets = function () {
        var _this = this;
        return (react_1.default.createElement("div", { style: { position: "absolute", top: "100%", left: 0, zIndex: 4000, padding: 5, border: "solid 1px #AAA", backgroundColor: "white", borderRadius: 4 } },
            react_1.default.createElement("ul", { className: "nav nav-pills nav-stacked" },
                presets.map(function (preset) {
                    return (react_1.default.createElement("li", { key: preset.id },
                        react_1.default.createElement("a", { style: { padding: 5 }, onClick: _this.handlePreset.bind(null, preset) }, localization_1.localize(preset.name, _this.props.locale))));
                }),
                react_1.default.createElement("li", null,
                    react_1.default.createElement("a", { style: { padding: 5 }, onClick: this.handleCustom }, localization_1.localize({
                        _base: "en",
                        en: "Custom Date Range...",
                        es: "Rango de fechas personalizado...."
                    }, this.props.locale))))));
    };
    DateExprComponent.prototype.renderDropdown = function () {
        if (this.state.custom) {
            return this.renderCustomDropdown();
        }
        else {
            return this.renderPresets();
        }
    };
    DateExprComponent.prototype.renderCustomDropdown = function () {
        var startDate = this.toMoment(lodash_1.default.isArray(this.props.value) ? this.props.value[0] : null) || undefined;
        var endDate = this.toMoment(lodash_1.default.isArray(this.props.value) ? this.props.value[1] : null) || undefined;
        return (react_1.default.createElement("div", { style: { position: "absolute", top: "100%", left: 0, zIndex: 4000, padding: 5, border: "solid 1px #AAA", backgroundColor: "white", borderRadius: 4 } },
            react_1.default.createElement("div", { style: { whiteSpace: "nowrap" } },
                react_1.default.createElement("div", { style: { display: "inline-block", verticalAlign: "top" } },
                    react_1.default.createElement(react_datepicker_1.default, { inline: true, selectsStart: true, selected: startDate, startDate: startDate, endDate: endDate, showYearDropdown: true, onChange: this.handleStartChange })),
                react_1.default.createElement("div", { style: { display: "inline-block", verticalAlign: "top" } },
                    react_1.default.createElement(react_datepicker_1.default, { inline: true, selectsEnd: true, selected: endDate, startDate: startDate, endDate: endDate, showYearDropdown: true, onChange: this.handleEndChange })))));
    };
    DateExprComponent.prototype.render = function () {
        return (react_1.default.createElement(react_onclickout_1.default, { onClickOut: this.handleClickOut },
            react_1.default.createElement("div", { style: { display: "inline-block", position: "relative" } },
                react_1.default.createElement("div", { className: "form-control", style: { width: 220, height: 34 }, onClick: this.handleOpen }, this.renderSummary()),
                this.props.value && this.props.onChange ?
                    this.renderClear()
                    : null,
                this.state.dropdownOpen ?
                    this.renderDropdown()
                    : null)));
    };
    return DateExprComponent;
}(react_1.default.Component));
exports.default = DateExprComponent;
