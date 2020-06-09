"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var react_1 = require("react");
var uuid = require("uuid");
var SearchBlockInstance_1 = require("../widgets/blocks/search/SearchBlockInstance");
var react_2 = __importDefault(require("react"));
/** Tab which lists existing tabs and offers a button to create a new tab */
exports.NewTab = function (props) {
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    // Which widgets have errors
    var _b = react_1.useState([]), errors = _b[0], setErrors = _b[1];
    // Check each widget for errors
    react_1.useEffect(function () {
        // For each widget
        var widgetErrors = [];
        for (var _i = 0, _a = Object.values(props.widgetLibrary.widgets); _i < _a.length; _i++) {
            var widgetDef = _a[_i];
            var error = props.validateWidget(widgetDef);
            if (error) {
                widgetErrors.push(widgetDef.id);
            }
        }
        setErrors(widgetErrors);
    }, []);
    // Focus on load
    var searchControl = react_1.useRef(null);
    react_1.useEffect(function () {
        if (searchControl.current) {
            searchControl.current.focus();
        }
    }, []);
    /** Add a new blank widget */
    var handleAdd = function () {
        props.onAddWidget({
            id: uuid(),
            name: "Untitled",
            description: "",
            blockDef: null,
            contextVars: [],
            contextVarPreviewValues: {},
            privateContextVars: [],
            privateContextVarValues: {}
        });
    };
    var handleDuplicateWidget = function (widgetDef, ev) {
        ev.stopPropagation();
        props.onDuplicateWidget(widgetDef);
    };
    var handleRemoveWidget = function (widgetId, ev) {
        ev.stopPropagation();
        props.onRemoveWidget(widgetId);
    };
    var renderExistingWidgets = function () {
        var widgets = lodash_1.default.sortBy(Object.values(props.widgetLibrary.widgets), "name");
        widgets = widgets.filter(function (widget) {
            return search ? widget.name.toLowerCase().includes(search.toLowerCase()) : true;
        });
        return (react_2.default.createElement("ul", { className: "list-group" }, widgets.map(function (widget) { return (react_2.default.createElement("li", { className: "list-group-item", style: { cursor: "pointer" }, key: widget.id, onClick: props.onOpenWidget.bind(null, widget.id) },
            react_2.default.createElement("span", { style: { float: "right" }, onClick: handleRemoveWidget.bind(null, widget.id) },
                react_2.default.createElement("i", { className: "fa fa-fw fa-remove" })),
            react_2.default.createElement("span", { style: { float: "right" }, onClick: handleDuplicateWidget.bind(null, widget) },
                react_2.default.createElement("i", { className: "fa fa-fw fa-files-o" })),
            errors.includes(widget.id) ?
                react_2.default.createElement("span", null,
                    react_2.default.createElement("i", { className: "fa fa-fw fa-exclamation-circle text-danger" }))
                : null,
            widget.name,
            widget.description ? react_2.default.createElement("span", { className: "text-muted" },
                " - ",
                widget.description) : null)); })));
    };
    return (react_2.default.createElement("div", { style: { padding: 10 } },
        react_2.default.createElement("div", { style: { paddingBottom: 10 } },
            react_2.default.createElement(SearchBlockInstance_1.SearchControl, { value: search, onChange: setSearch, ref: searchControl, placeholder: "Search widgets..." }),
            react_2.default.createElement("button", { type: "button", className: "btn btn-primary", onClick: handleAdd },
                react_2.default.createElement("i", { className: "fa fa-plus" }),
                " New Widget")),
        renderExistingWidgets()));
};
