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
exports.DateInjectBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var react_datepicker_1 = __importDefault(require("react-datepicker"));
var moment_1 = __importDefault(require("moment"));
var ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
var react_1 = require("react");
var DateInjectBlock = /** @class */ (function (_super) {
    __extends(DateInjectBlock, _super);
    function DateInjectBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateInjectBlock.prototype.getChildren = function (contextVars) {
        if (this.blockDef.content) {
            return [{ blockDef: this.blockDef.content, contextVars: contextVars.concat([this.createContextVar()]) }];
        }
        return [];
    };
    DateInjectBlock.prototype.createContextVar = function () {
        return { type: "date", id: this.blockDef.id, name: "Date" };
    };
    DateInjectBlock.prototype.validate = function (options) {
        if (!this.blockDef.content) {
            return "Content required";
        }
        return null;
    };
    DateInjectBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.content = content;
        });
    };
    DateInjectBlock.prototype.renderDesign = function (designCtx) {
        var _this = this;
        var handleSetContent = function (blockDef) {
            designCtx.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        // Create ctx for child
        var contextVar = this.createContextVar();
        var contentDesignCtx = designCtx;
        // Add context variable if knowable
        if (contextVar) {
            contentDesignCtx = __assign(__assign({}, contentDesignCtx), { contextVars: designCtx.contextVars.concat([contextVar]) });
        }
        var contentNode = designCtx.renderChildBlock(contentDesignCtx, this.blockDef.content, handleSetContent);
        return (React.createElement("div", null,
            React.createElement("div", null,
                React.createElement(react_datepicker_1.default, { selected: moment_1.default(), onChange: function () { }, dateFormat: "ll", className: "form-control" })),
            contentNode));
    };
    DateInjectBlock.prototype.renderInstance = function (instanceCtx) {
        return React.createElement(DateInjectInstance, { instanceCtx: instanceCtx, block: this });
    };
    DateInjectBlock.prototype.renderEditor = function (designCtx) {
        return (React.createElement("div", null));
    };
    return DateInjectBlock;
}(blocks_1.Block));
exports.DateInjectBlock = DateInjectBlock;
var DateInjectInstance = function (props) {
    var _a;
    var _b = react_1.useState(moment_1.default().format("YYYY-MM-DD")), date = _b[0], setDate = _b[1];
    var instanceCtx = props.instanceCtx, block = props.block;
    var dateContextVar = block.createContextVar();
    return (React.createElement("div", null,
        React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(react_datepicker_1.default, { selected: moment_1.default(date, "YYYY-MM-DD"), onChange: function (momentDate) { setDate(momentDate.format("YYYY-MM-DD")); }, dateFormat: "ll", isClearable: false, className: "form-control" })),
        React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [dateContextVar], injectedContextVarValues: (_a = {}, _a[dateContextVar.id] = date, _a), innerBlock: block.blockDef.content, instanceCtx: instanceCtx }, function (innerInstanceCtx, loading, refreshing) {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, innerInstanceCtx.renderChildBlock(innerInstanceCtx, block.blockDef.content)));
        })));
};
