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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var propertyEditors_1 = require("../propertyEditors");
var localization_1 = require("../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var embeddedExprs_1 = require("../../embeddedExprs");
var ButtonBlock = /** @class */ (function (_super) {
    __extends(ButtonBlock, _super);
    function ButtonBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonBlock.prototype.validate = function (designCtx) {
        var error;
        // Validate expressions
        error = embeddedExprs_1.validateEmbeddedExprs({
            embeddedExprs: this.blockDef.labelEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (error) {
            return error;
        }
        // Validate action
        if (this.blockDef.actionDef) {
            var action = designCtx.actionLibrary.createAction(this.blockDef.actionDef);
            error = action.validate(designCtx);
            if (error) {
                return error;
            }
        }
        return null;
    };
    ButtonBlock.prototype.getContextVarExprs = function (contextVar, ctx) {
        var exprs = [];
        if (this.blockDef.labelEmbeddedExprs) {
            exprs = exprs.concat(lodash_1.default.compact(lodash_1.default.map(this.blockDef.labelEmbeddedExprs, function (ee) { return ee.contextVarId === contextVar.id ? ee.expr : null; })));
        }
        return exprs;
    };
    ButtonBlock.prototype.renderDesign = function (props) {
        var label = localization_1.localize(this.blockDef.label, props.locale);
        return react_1.default.createElement(ButtonComponent, { label: label, blockDef: this.blockDef });
    };
    ButtonBlock.prototype.renderInstance = function (instanceCtx) {
        return react_1.default.createElement(ButtonInstance, { blockDef: this.blockDef, instanceCtx: instanceCtx });
    };
    ButtonBlock.prototype.renderEditor = function (props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "label" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "labelEmbeddedExprs" }, function (value, onChange) { return (react_1.default.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "style" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                            { value: "default", label: "Default" },
                            { value: "primary", label: "Primary" },
                            { value: "link", label: "Link" },
                            { value: "plainlink", label: "Plain Link" },
                        ] });
                })),
            this.blockDef.style != "plainlink" ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "size" }, function (value, onChange) {
                        return react_1.default.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                                { value: "normal", label: "Default" },
                                { value: "small", label: "Small" },
                                { value: "extrasmall", label: "Extra-small" },
                                { value: "large", label: "Large" }
                            ] });
                    }))
                : null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Icon" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "icon" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "None", options: [
                            { value: "plus", label: "Add" },
                            { value: "pencil", label: "Edit" },
                            { value: "times", label: "Remove" },
                            { value: "print", label: "Print" },
                            { value: "upload", label: "Upload" },
                            { value: "download", label: "Download" },
                            { value: "info-circle", label: "Information" },
                            { value: "link", label: "Link" },
                            { value: "external-link", label: "External Link" },
                            { value: "search", label: "Search" },
                            { value: "question-circle", label: "Help" },
                            { value: "folder-open", label: "Open" },
                            { value: "refresh", label: "Refresh" },
                            { value: "arrow-right", label: "Right Arrow" }
                        ] });
                })),
            this.blockDef.style != "plainlink" ?
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "block" }, function (value, onChange) { return react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Block-style"); })
                : null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "When button clicked" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "actionDef" }, function (value, onChange) { return (react_1.default.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: props })); })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm message" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "confirmMessage" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))));
    };
    return ButtonBlock;
}(LeafBlock_1.default));
exports.ButtonBlock = ButtonBlock;
function ButtonInstance(props) {
    var _this = this;
    var instanceCtx = props.instanceCtx, blockDef = props.blockDef;
    // Track when action in process
    var _a = react_1.useState(false), busy = _a[0], setBusy = _a[1];
    var handleClick = function (ev) { return __awaiter(_this, void 0, void 0, function () {
        var action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Ensure button doesn't trigger other actions
                    ev.stopPropagation();
                    // Confirm if confirm message
                    if (blockDef.confirmMessage) {
                        if (!confirm(localization_1.localize(blockDef.confirmMessage, instanceCtx.locale))) {
                            return [2 /*return*/];
                        }
                    }
                    if (!blockDef.actionDef) return [3 /*break*/, 4];
                    action = instanceCtx.actionLibrary.createAction(blockDef.actionDef);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    setBusy(true);
                    return [4 /*yield*/, action.performAction(instanceCtx)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Get label
    var label = localization_1.localize(blockDef.label, instanceCtx.locale);
    if (label) {
        // Get any embedded expression values
        var exprValues = lodash_1.default.map(blockDef.labelEmbeddedExprs || [], function (ee) { return instanceCtx.getContextVarExprValue(ee.contextVarId, ee.expr); });
        // Format and replace
        label = embeddedExprs_1.formatEmbeddedExprString({
            text: label,
            embeddedExprs: blockDef.labelEmbeddedExprs || [],
            exprValues: exprValues,
            schema: instanceCtx.schema,
            contextVars: instanceCtx.contextVars,
            locale: instanceCtx.locale,
            formatLocale: instanceCtx.formatLocale
        });
    }
    return react_1.default.createElement(ButtonComponent, { blockDef: blockDef, label: label, onClick: handleClick, busy: busy });
}
/** Draws the button */
function ButtonComponent(props) {
    var label = props.label, onClick = props.onClick, blockDef = props.blockDef;
    var icon = blockDef.icon ? react_1.default.createElement("i", { className: "fa fa-fw fa-" + blockDef.icon }) : null;
    // Special case of plain link
    if (blockDef.style == "plainlink") {
        return react_1.default.createElement("div", null,
            react_1.default.createElement("a", { onClick: props.onClick, style: { cursor: "pointer" } },
                icon,
                icon && label ? "\u00A0" : null,
                label));
    }
    var className = "btn btn-" + blockDef.style;
    switch (blockDef.size) {
        case "normal":
            break;
        case "small":
            className += " btn-sm";
            break;
        case "extrasmall":
            className += " btn-xs";
            break;
        case "large":
            className += " btn-lg";
            break;
    }
    if (blockDef.block) {
        className += " btn-block";
    }
    var style = {};
    if (!blockDef.block) {
        style.margin = 5;
    }
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("button", { type: "button", className: className, onClick: props.onClick, style: style, disabled: props.busy },
            props.busy && icon ? react_1.default.createElement("i", { className: "fa fa-spinner fa-spin fa-fw" }) : icon,
            icon && label ? "\u00A0" : null,
            label)));
}
