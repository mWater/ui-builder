"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsibleComponent = exports.CollapsibleBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const _ = __importStar(require("lodash"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class CollapsibleBlock extends blocks_1.Block {
    getChildren(contextVars) {
        return _.compact([this.blockDef.label, this.blockDef.content]).map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        const label = action(this.blockDef.label);
        const content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, draft => {
            draft.label = label;
            draft.content = content;
        });
    }
    renderDesign(props) {
        // Allow dropping
        const handleSetLabel = (blockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.label = blockDef;
                return b;
            }), blockDef.id);
        };
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        const labelNode = props.renderChildBlock(props, this.blockDef.label, handleSetLabel);
        const contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(CollapsibleComponent, { label: labelNode, forceOpen: true }, contentNode)));
    }
    renderInstance(props) {
        const labelNode = this.blockDef.label ?
            props.createBlock(this.blockDef.label).renderInstance(props) : null;
        const contentNode = this.blockDef.content ?
            props.createBlock(this.blockDef.content).renderInstance(props) : null;
        // Determine if initially collapsed
        const initialCollapsed = this.blockDef.initialCollapsed || (this.blockDef.collapseWidth != null && window.innerWidth <= this.blockDef.collapseWidth);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(CollapsibleComponent, { label: labelNode, initialCollapsed: initialCollapsed }, contentNode)));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "initialCollapsed" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Initially Collapsed")),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Collapse Below Width" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "collapseWidth" }, (value, onChange) => React.createElement(propertyEditors_1.ResponsiveWidthSelector, { value: value, onChange: onChange })))));
    }
}
exports.CollapsibleBlock = CollapsibleBlock;
/** Collapsible UI control */
class CollapsibleComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handleToggle = () => {
            if (!this.props.forceOpen) {
                this.setState({ collapsed: !this.state.collapsed });
            }
        };
        this.state = {
            // Collapse if not forced open and initialCollapsed
            collapsed: !(this.props.forceOpen || false) && (this.props.initialCollapsed || false)
        };
    }
    render() {
        return React.createElement("div", null,
            React.createElement("table", { style: { width: "100%" } },
                React.createElement("tbody", null,
                    React.createElement("tr", { key: "float", onClick: this.handleToggle, style: { cursor: "pointer" } },
                        React.createElement("td", { key: "left", style: { verticalAlign: "middle", paddingRight: 5, fontSize: 18, color: "#3bd" } }, this.state.collapsed ? React.createElement("i", { className: "fa fa-caret-right" }) : React.createElement("i", { className: "fa fa-caret-down" })),
                        React.createElement("td", { key: "main", style: { width: "100%", verticalAlign: "middle" } }, this.props.label)))),
            !this.state.collapsed ? this.props.children : null);
    }
}
exports.CollapsibleComponent = CollapsibleComponent;
