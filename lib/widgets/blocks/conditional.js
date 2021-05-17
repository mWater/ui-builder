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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ConditionalBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var ConditionalBlock = /** @class */ (function (_super) {
    __extends(ConditionalBlock, _super);
    function ConditionalBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConditionalBlock.prototype.getChildren = function (contextVars) {
        if (this.blockDef.content) {
            return [{ blockDef: this.blockDef.content, contextVars: contextVars }];
        }
        return [];
    };
    ConditionalBlock.prototype.validate = function (ctx) {
        return blocks_1.validateContextVarExpr({
            schema: ctx.schema,
            contextVars: ctx.contextVars,
            contextVarId: this.blockDef.contextVarId,
            expr: this.blockDef.expr,
            types: ["boolean"]
        });
    };
    ConditionalBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.content = content;
        });
    };
    /** Get context variable expressions needed to add */
    ConditionalBlock.prototype.getContextVarExprs = function (contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    };
    ConditionalBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleSetContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        var contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    };
    ConditionalBlock.prototype.renderInstance = function (props) {
        // Check expression value
        var value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        if (!value) {
            return React.createElement("div", null);
        }
        return React.createElement("div", null, props.renderChildBlock(props, this.blockDef.content));
    };
    ConditionalBlock.prototype.renderEditor = function (props) {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement("h3", null, "Conditional"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Conditional Expression" },
                React.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], types: ["boolean"], contextVarId: this.blockDef.contextVarId, expr: this.blockDef.expr, onChange: function (contextVarId, expr) {
                        props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { contextVarId: contextVarId, expr: expr }));
                    } }))));
    };
    return ConditionalBlock;
}(blocks_1.Block));
exports.ConditionalBlock = ConditionalBlock;
