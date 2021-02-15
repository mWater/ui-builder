"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewTab = void 0;
var lodash_1 = __importDefault(require("lodash"));
var react_1 = require("react");
var uuid = require("uuid");
var SearchBlockInstance_1 = require("../widgets/blocks/search/SearchBlockInstance");
var react_2 = __importDefault(require("react"));
/** Tab which lists existing tabs and offers a button to create a new tab */
exports.NewTab = function (props) {
    /** Search state */
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    // Which widgets have errors
    var _b = react_1.useState([]), errors = _b[0], setErrors = _b[1];
    /** Collapsed groups (persisted to local storage) */
    var _c = react_1.useState(JSON.parse(window.localStorage.getItem("UIBuilder.collapsedWidgetGroups") || "[]")), collapsedGroups = _c[0], setCollapsedGroups = _c[1];
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
    function handleAdd() {
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
    }
    function handleDuplicateWidget(widgetDef, ev) {
        ev.stopPropagation();
        props.onDuplicateWidget(widgetDef);
    }
    function handleRemoveWidget(widgetId, ev) {
        ev.stopPropagation();
        props.onRemoveWidget(widgetId);
    }
    function toggleGroup(group) {
        if (collapsedGroups.includes(group)) {
            var newCollapsedGroups = collapsedGroups.filter(function (g) { return g != group; });
            setCollapsedGroups(newCollapsedGroups);
            window.localStorage.setItem("UIBuilder.collapsedWidgetGroups", JSON.stringify(newCollapsedGroups));
        }
        else {
            var newCollapsedGroups = collapsedGroups.concat([group]);
            setCollapsedGroups(newCollapsedGroups);
            window.localStorage.setItem("UIBuilder.collapsedWidgetGroups", JSON.stringify(newCollapsedGroups));
        }
    }
    function renderWidgetGroupHeader(group) {
        return react_2.default.createElement("h4", { style: { cursor: "pointer" }, onClick: function () { return toggleGroup(group); } },
            react_2.default.createElement("span", { style: { color: "#38D" } },
                collapsedGroups.includes(group) ? react_2.default.createElement("i", { className: "fa fa-fw fa-caret-right" }) : react_2.default.createElement("i", { className: "fa fa-fw fa-caret-down" }),
                "\u00A0"),
            group || "No Group");
    }
    function renderWidgetGroup(group, widgets, hasGroups) {
        return (react_2.default.createElement("div", null,
            hasGroups ? renderWidgetGroupHeader(group) : null,
            !collapsedGroups.includes(group) ?
                react_2.default.createElement("ul", { className: "list-group" }, widgets.map(function (widget) { return (react_2.default.createElement("li", { className: "list-group-item", style: { cursor: "pointer" }, key: widget.id, onClick: props.onOpenWidget.bind(null, widget.id) },
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
                        widget.description) : null)); }))
                : null));
    }
    function renderExistingWidgets() {
        var widgets = Object.values(props.widgetLibrary.widgets);
        // Filter by search
        widgets = widgets.filter(function (widget) {
            return search ? widget.name.toLowerCase().includes(search.toLowerCase()) : true;
        });
        // Get groups and sort
        var groups = lodash_1.default.uniq(widgets.map(function (w) { return w.group; }));
        groups.sort();
        // Render each group
        return groups.map(function (group) {
            var groupWidgets = lodash_1.default.sortBy(widgets.filter(function (w) { return w.group == group; }), "name");
            return renderWidgetGroup(group, groupWidgets, !(groups.length == 1 && groups[0] == undefined));
        });
    }
    return (react_2.default.createElement("div", { style: { padding: 10 } },
        react_2.default.createElement("div", { style: { paddingBottom: 10 } },
            react_2.default.createElement(SearchBlockInstance_1.SearchControl, { value: search, onChange: setSearch, ref: searchControl, placeholder: "Search widgets..." }),
            react_2.default.createElement("button", { type: "button", className: "btn btn-primary", onClick: handleAdd },
                react_2.default.createElement("i", { className: "fa fa-plus" }),
                " New Widget")),
        renderExistingWidgets()));
};
