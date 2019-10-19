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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
var _ = __importStar(require("lodash"));
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var CollapsibleBlock = /** @class */ (function (_super) {
    __extends(CollapsibleBlock, _super);
    function CollapsibleBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CollapsibleBlock.prototype.getChildren = function (contextVars) {
        return _.compact([this.blockDef.label, this.blockDef.content]).map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
    };
    CollapsibleBlock.prototype.validate = function () { return null; };
    CollapsibleBlock.prototype.processChildren = function (action) {
        var label = action(this.blockDef.label);
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.label = label;
            draft.content = content;
        });
    };
    CollapsibleBlock.prototype.renderDesign = function (props) {
        var _this = this;
        // Allow dropping
        var handleSetLabel = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.label = blockDef;
                return b;
            }), blockDef.id);
        };
        var handleSetContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        var labelNode = props.renderChildBlock(props, this.blockDef.label, handleSetLabel);
        var contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(Collapsible, { label: labelNode, forceOpen: true }, contentNode)));
    };
    CollapsibleBlock.prototype.renderInstance = function (props) {
        var labelNode = this.blockDef.label ?
            this.createBlock(this.blockDef.label).renderInstance(props) : null;
        var contentNode = this.blockDef.content ?
            this.createBlock(this.blockDef.content).renderInstance(props) : null;
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(Collapsible, { label: labelNode, initialCollapsed: this.blockDef.initialCollapsed }, contentNode)));
    };
    CollapsibleBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "initialCollapsed" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Initially Collapsed"); })));
    };
    return CollapsibleBlock;
}(CompoundBlock_1.default));
exports.CollapsibleBlock = CollapsibleBlock;
var Collapsible = /** @class */ (function (_super) {
    __extends(Collapsible, _super);
    function Collapsible(props) {
        var _this = _super.call(this, props) || this;
        _this.handleToggle = function () {
            if (!_this.props.forceOpen) {
                _this.setState({ collapsed: !_this.state.collapsed });
            }
        };
        _this.state = {
            // Collapse if not forced open and initialCollapsed
            collapsed: !(_this.props.forceOpen || false) && (_this.props.initialCollapsed || false)
        };
        return _this;
    }
    Collapsible.prototype.render = function () {
        if (this.state.collapsed) {
            return (React.createElement("div", { onClick: this.handleToggle },
                React.createElement("div", { style: { float: "left", marginRight: 5, fontSize: 18, color: "#3bd" } },
                    React.createElement("i", { className: "fa fa-caret-right" })),
                this.props.label));
        }
        return (React.createElement("div", null,
            React.createElement("div", { onClick: this.handleToggle },
                React.createElement("div", { style: { float: "left", marginRight: 5, fontSize: 18, color: "#3bd" } },
                    React.createElement("i", { className: "fa fa-caret-down" })),
                this.props.label),
            this.props.children));
    };
    return Collapsible;
}(React.Component));
