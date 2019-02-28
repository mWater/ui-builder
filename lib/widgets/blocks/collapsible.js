"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
const _ = __importStar(require("lodash"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class CollapsibleBlock extends CompoundBlock_1.default {
    getChildren(contextVars) {
        return _.compact([this.blockDef.label, this.blockDef.content]).map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() { return null; }
    processChildren(action) {
        return immer_1.default(this.blockDef, draft => {
            if (draft.label) {
                draft.label = action(draft.label);
            }
            if (draft.content) {
                draft.content = action(draft.content);
            }
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
            React.createElement(Collapsible, { label: labelNode, forceOpen: true }, contentNode)));
    }
    renderInstance(props) {
        const labelNode = this.blockDef.label ?
            this.createBlock(this.blockDef.label).renderInstance(props) : null;
        const contentNode = this.blockDef.content ?
            this.createBlock(this.blockDef.content).renderInstance(props) : null;
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(Collapsible, { label: labelNode, initialCollapsed: this.blockDef.initialCollapsed }, contentNode)));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "initialCollapsed" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Initially Collapsed"))));
    }
}
exports.CollapsibleBlock = CollapsibleBlock;
class Collapsible extends React.Component {
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
        if (this.state.collapsed) {
            return (React.createElement("div", { onClick: this.handleToggle },
                React.createElement("div", { style: { float: "left", marginRight: 5, fontSize: 18, color: "#3bd" } },
                    React.createElement("i", { className: "fa fa-caret-right" })),
                this.props.label));
        }
        return (React.createElement("div", { onClick: this.handleToggle },
            React.createElement("div", null,
                React.createElement("div", { style: { float: "left", marginRight: 5, fontSize: 18, color: "#3bd" } },
                    React.createElement("i", { className: "fa fa-caret-down" })),
                this.props.label),
            this.props.children));
    }
}
//# sourceMappingURL=collapsible.js.map