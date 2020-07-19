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
exports.CollapsibleBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
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
            props.createBlock(this.blockDef.label).renderInstance(props) : null;
        var contentNode = this.blockDef.content ?
            props.createBlock(this.blockDef.content).renderInstance(props) : null;
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(Collapsible, { label: labelNode, initialCollapsed: this.blockDef.initialCollapsed }, contentNode)));
    };
    CollapsibleBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "initialCollapsed" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Initially Collapsed"); })));
    };
    return CollapsibleBlock;
}(blocks_1.Block));
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
        return React.createElement("div", null,
            React.createElement("table", { style: { width: "100%" } },
                React.createElement("tbody", null,
                    React.createElement("tr", { key: "float", onClick: this.handleToggle, style: { cursor: "pointer" } },
                        React.createElement("td", { key: "left", style: { verticalAlign: "middle", paddingRight: 5, fontSize: 18, color: "#3bd" } }, this.state.collapsed ? React.createElement("i", { className: "fa fa-caret-right" }) : React.createElement("i", { className: "fa fa-caret-down" })),
                        React.createElement("td", { key: "main", style: { width: "100%", verticalAlign: "middle" } }, this.props.label)))),
            !this.state.collapsed ? this.props.children : null);
    };
    return Collapsible;
}(React.Component));
