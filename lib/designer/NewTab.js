"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewTab = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = require("react");
const uuid = require("uuid");
const SearchBlockInstance_1 = require("../widgets/blocks/search/SearchBlockInstance");
const react_2 = __importDefault(require("react"));
/** Tab which lists existing tabs and offers a button to create a new tab */
const NewTab = (props) => {
    /** Search state */
    const [search, setSearch] = (0, react_1.useState)("");
    // Which widgets have errors
    const [errors, setErrors] = (0, react_1.useState)([]);
    /** Collapsed groups (persisted to local storage) */
    const [collapsedGroups, setCollapsedGroups] = (0, react_1.useState)(JSON.parse(window.localStorage.getItem("UIBuilder.collapsedWidgetGroups") || "[]"));
    // Check each widget for errors
    (0, react_1.useEffect)(() => {
        // For each widget
        const widgetErrors = [];
        for (const widgetDef of Object.values(props.widgetLibrary.widgets)) {
            const error = props.validateWidget(widgetDef);
            if (error) {
                widgetErrors.push(widgetDef.id);
            }
        }
        setErrors(widgetErrors);
    }, []);
    // Focus on load
    const searchControl = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
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
            const newCollapsedGroups = collapsedGroups.filter((g) => g != group);
            setCollapsedGroups(newCollapsedGroups);
            window.localStorage.setItem("UIBuilder.collapsedWidgetGroups", JSON.stringify(newCollapsedGroups));
        }
        else {
            const newCollapsedGroups = collapsedGroups.concat([group]);
            setCollapsedGroups(newCollapsedGroups);
            window.localStorage.setItem("UIBuilder.collapsedWidgetGroups", JSON.stringify(newCollapsedGroups));
        }
    }
    function renderWidgetGroupHeader(group) {
        return (react_2.default.createElement("h5", { style: { cursor: "pointer" }, onClick: () => toggleGroup(group) },
            react_2.default.createElement("span", { style: { color: "var(--bs-primary)" } },
                collapsedGroups.includes(group) ? (react_2.default.createElement("i", { className: "fa fa-fw fa-caret-right" })) : (react_2.default.createElement("i", { className: "fa fa-fw fa-caret-down" })),
                "\u00A0"),
            group || "No Group"));
    }
    function renderWidgetGroup(group, widgets, hasGroups) {
        return (react_2.default.createElement("div", null,
            hasGroups ? renderWidgetGroupHeader(group) : null,
            !collapsedGroups.includes(group) ? (react_2.default.createElement("ul", { className: "list-group mb-3" }, widgets.map((widget) => (react_2.default.createElement("li", { className: "list-group-item", style: { cursor: "pointer" }, key: widget.id, onClick: props.onOpenWidget.bind(null, widget.id) },
                react_2.default.createElement("span", { className: "text-primary", style: { float: "right", cursor: "pointer" }, onClick: handleRemoveWidget.bind(null, widget.id) },
                    react_2.default.createElement("i", { className: "fa fa-fw fa-remove" })),
                react_2.default.createElement("span", { className: "text-primary", style: { float: "right", cursor: "pointer" }, onClick: handleDuplicateWidget.bind(null, widget) },
                    react_2.default.createElement("i", { className: "fa fa-fw fa-files-o" })),
                errors.includes(widget.id) ? (react_2.default.createElement("span", null,
                    react_2.default.createElement("i", { className: "fa fa-fw fa-exclamation-circle text-danger" }))) : null,
                widget.name,
                widget.description ? react_2.default.createElement("span", { className: "text-muted" },
                    " - ",
                    widget.description) : null))))) : null));
    }
    function renderExistingWidgets() {
        let widgets = Object.values(props.widgetLibrary.widgets);
        // Filter by search
        widgets = widgets.filter((widget) => {
            if (!search) {
                return true;
            }
            // Search by name
            if (widget.name.toLowerCase().includes(search.toLowerCase())) {
                return true;
            }
            // Search by id
            if (widget.id.toLowerCase().includes(search.toLowerCase())) {
                return true;
            }
            // Search by json
            if (search.startsWith("json:")) {
                return JSON.stringify(widget).includes(search.substr(5));
            }
            return false;
        });
        // Get groups and sort
        const groups = lodash_1.default.uniq(widgets.map((w) => w.group));
        groups.sort();
        // Render each group
        return groups.map((group) => {
            const groupWidgets = lodash_1.default.sortBy(widgets.filter((w) => w.group == group), "name");
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
exports.NewTab = NewTab;
