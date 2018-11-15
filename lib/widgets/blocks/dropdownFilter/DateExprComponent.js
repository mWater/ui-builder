import ClickOutHandler from 'react-onclickout';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import React from 'react';
import "react-datepicker/dist/react-datepicker.css";
import './datepicker-tweaks.css';
const presets = [
    { id: "thisyear", name: "This Year" },
    { id: "lastyear", name: "Last Year" },
    { id: "thismonth", name: "This Month" },
    { id: "lastmonth", name: "Last Month" },
    { id: "today", name: "Today" },
    { id: "yesterday", name: "Yesterday" },
    { id: "last24hours", name: "In Last 24 Hours" },
    { id: "last7days", name: "In Last 7 Days" },
    { id: "last30days", name: "In Last 30 Days" },
    { id: "last365days", name: "In Last 365 Days" }
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
export const toExpr = (table, expr, datetime, value) => {
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
/** Allows selection of a date expressions for quickfilters */
export default class DateExprComponent extends React.Component {
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
            if (_.isArray(this.props.value) && this.props.value[1] && this.fromMoment(value) > this.props.value[1]) {
                this.props.onChange([this.fromMoment(value), null]);
            }
            else {
                this.props.onChange([this.fromMoment(value), _.isArray(this.props.value) ? this.props.value[1] : null]);
            }
        };
        this.handleEndChange = (value) => {
            // Go to end of day if datetime
            if (this.props.datetime) {
                value = moment(value);
                value.endOf("day");
            }
            // Clear start if before
            if (_.isArray(this.props.value) && this.props.value[0] && this.fromMoment(value) < this.props.value[0]) {
                this.props.onChange([null, this.fromMoment(value)]);
            }
            else {
                this.props.onChange([_.isArray(this.props.value) ? this.props.value[0] : null, this.fromMoment(value)]);
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
            return moment(value, moment.ISO_8601);
        }
        else {
            return moment(value, "YYYY-MM-DD");
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
        return (React.createElement("div", { style: { position: "absolute", right: 10, top: 7, color: "#AAA" }, onClick: this.props.onChange.bind(null, null) },
            React.createElement("i", { className: "fa fa-remove" })));
    }
    renderSummary() {
        if (!this.props.value) {
            return React.createElement("span", { className: "text-muted" }, this.props.placeholder || "All");
        }
        const preset = presets.find(p => p.id === this.props.value);
        if (preset) {
            return preset.name;
        }
        if (Array.isArray(this.props.value)) {
            const startDate = this.toMoment(this.props.value[0]);
            const endDate = this.toMoment(this.props.value[1]);
            // Add/subtract hours to work around https://github.com/moment/moment/issues/2749
            if (this.props.datetime) {
                return (startDate ? startDate.add("hours", 3).format("ll") : "") + " - " + (endDate ? endDate.subtract("hours", 3).format("ll") : "");
            }
            else {
                return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
            }
        }
        return "???";
    }
    renderPresets() {
        return (React.createElement("div", { style: { position: "absolute", top: "100%", left: 0, zIndex: 4000, padding: 5, border: "solid 1px #AAA", backgroundColor: "white", borderRadius: 4 } },
            React.createElement("ul", { className: "nav nav-pills nav-stacked" },
                presets.map(preset => {
                    return (React.createElement("li", { key: preset.id },
                        React.createElement("a", { style: { padding: 5 }, onClick: this.handlePreset.bind(null, preset) }, preset.name)));
                }),
                React.createElement("li", null,
                    React.createElement("a", { style: { padding: 5 }, onClick: this.handleCustom }, "Custom Date Range...")))));
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
        const startDate = this.toMoment(_.isArray(this.props.value) ? this.props.value[0] : null) || undefined;
        const endDate = this.toMoment(_.isArray(this.props.value) ? this.props.value[1] : null) || undefined;
        return (React.createElement("div", { style: { position: "absolute", top: "100%", left: 0, zIndex: 4000, padding: 5, border: "solid 1px #AAA", backgroundColor: "white", borderRadius: 4 } },
            React.createElement("div", { style: { whiteSpace: "nowrap" } },
                React.createElement("div", { style: { display: "inline-block", verticalAlign: "top" } },
                    React.createElement(DatePicker, { inline: true, selectsStart: true, selected: startDate, startDate: startDate, endDate: endDate, showYearDropdown: true, onChange: this.handleStartChange })),
                React.createElement("div", { style: { display: "inline-block", verticalAlign: "top" } },
                    React.createElement(DatePicker, { inline: true, selectsEnd: true, selected: endDate, startDate: startDate, endDate: endDate, showYearDropdown: true, onChange: this.handleEndChange })))));
    }
    render() {
        return (React.createElement(ClickOutHandler, { onClickOut: this.handleClickOut },
            React.createElement("div", { style: { display: "inline-block", position: "relative" } },
                React.createElement("div", { className: "form-control", style: { width: 220, height: 36 }, onClick: this.handleOpen }, this.renderSummary()),
                this.props.value && this.props.onChange ?
                    this.renderClear()
                    : null,
                this.state.dropdownOpen ?
                    this.renderDropdown()
                    : null)));
    }
}
//# sourceMappingURL=DateExprComponent.js.map