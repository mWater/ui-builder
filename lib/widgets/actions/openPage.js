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
exports.OpenPageAction = void 0;
var _ = __importStar(require("lodash"));
var React = __importStar(require("react"));
var actions_1 = require("../actions");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var immer_1 = __importDefault(require("immer"));
var mwater_expressions_1 = require("mwater-expressions");
var embeddedExprs_1 = require("../../embeddedExprs");
var blocks_1 = require("../blocks");
var localization_1 = require("../localization");
var evalContextVarExpr_1 = require("../evalContextVarExpr");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var OpenPageAction = /** @class */ (function (_super) {
    __extends(OpenPageAction, _super);
    function OpenPageAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OpenPageAction.prototype.validate = function (designCtx) {
        // Find widget
        if (!this.actionDef.widgetId) {
            return "Widget required";
        }
        // Ensure that widget exists 
        var widget = designCtx.widgetLibrary.widgets[this.actionDef.widgetId];
        if (!widget) {
            return "Invalid widget";
        }
        var _loop_1 = function (widgetCV) {
            // Don't allow unmapped variables
            if (!this_1.actionDef.contextVarValues[widgetCV.id]) {
                return { value: "Missing variable mapping" };
            }
            // Ensure that mapping is to available context var
            var contextVarValue = this_1.actionDef.contextVarValues[widgetCV.id];
            if (contextVarValue.type == "ref") {
                var srcCV = designCtx.contextVars.find(function (cv) { return cv.id === contextVarValue.contextVarId; });
                if (!srcCV || !areContextVarCompatible(srcCV, widgetCV)) {
                    return { value: "Invalid context variable" };
                }
            }
        };
        var this_1 = this;
        // Ensure that all context variables are correctly mapped
        for (var _i = 0, _a = widget.contextVars; _i < _a.length; _i++) {
            var widgetCV = _a[_i];
            var state_1 = _loop_1(widgetCV);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        // Validate expressions
        var err = embeddedExprs_1.validateEmbeddedExprs({
            embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (err) {
            return err;
        }
        return null;
    };
    OpenPageAction.prototype.performAction = function (instanceCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var contextVarValues, _loop_2, this_2, _i, _a, cvid, _b, _c, globalContextVar, title, exprValues, _loop_3, _d, _e, ee, page;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        contextVarValues = {};
                        _loop_2 = function (cvid) {
                            var contextVarValue = this_2.actionDef.contextVarValues[cvid];
                            if (contextVarValue.type == "ref") {
                                // Look up outer context variable
                                var outerCV = instanceCtx.contextVars.find(function (cv) { return cv.id == contextVarValue.contextVarId; });
                                if (!outerCV) {
                                    throw new Error("Outer context variable not found");
                                }
                                // Get value 
                                var outerCVValue = instanceCtx.contextVarValues[outerCV.id];
                                // Add filters if rowset
                                if (outerCV.type == "rowset") {
                                    outerCVValue = {
                                        type: "op",
                                        op: "and",
                                        table: outerCV.table,
                                        exprs: _.compact([outerCVValue].concat(_.map(instanceCtx.getFilters(outerCV.id), function (f) { return f.expr; })))
                                    };
                                }
                                // Inline variables used in rowsets as they may depend on context variables that aren't present in new page
                                if (outerCV.type == "rowset") {
                                    outerCVValue = new mwater_expressions_1.ExprUtils(instanceCtx.schema, blocks_1.createExprVariables(instanceCtx.contextVars)).inlineVariableValues(outerCVValue, blocks_1.createExprVariableValues(instanceCtx.contextVars, instanceCtx.contextVarValues));
                                }
                                contextVarValues[cvid] = outerCVValue;
                            }
                            else if (contextVarValue.type == "null") {
                                contextVarValues[cvid] = null;
                            }
                            else if (contextVarValue.type == "literal") {
                                contextVarValues[cvid] = contextVarValue.value;
                            }
                        };
                        this_2 = this;
                        // Perform mappings 
                        for (_i = 0, _a = Object.keys(this.actionDef.contextVarValues); _i < _a.length; _i++) {
                            cvid = _a[_i];
                            _loop_2(cvid);
                        }
                        // Include global context variables
                        for (_b = 0, _c = instanceCtx.globalContextVars || []; _b < _c.length; _b++) {
                            globalContextVar = _c[_b];
                            contextVarValues[globalContextVar.id] = instanceCtx.contextVarValues[globalContextVar.id];
                        }
                        title = localization_1.localize(this.actionDef.title, instanceCtx.locale);
                        if (!title) return [3 /*break*/, 5];
                        exprValues = [];
                        _loop_3 = function (ee) {
                            var contextVar, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        contextVar = ee.contextVarId ? instanceCtx.contextVars.find(function (cv) { return cv.id == ee.contextVarId; }) : null;
                                        _b = (_a = exprValues).push;
                                        return [4 /*yield*/, evalContextVarExpr_1.evalContextVarExpr({
                                                contextVar: contextVar,
                                                contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
                                                ctx: instanceCtx,
                                                expr: ee.expr
                                            })];
                                    case 1:
                                        _b.apply(_a, [_c.sent()]);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _d = 0, _e = this.actionDef.titleEmbeddedExprs || [];
                        _f.label = 1;
                    case 1:
                        if (!(_d < _e.length)) return [3 /*break*/, 4];
                        ee = _e[_d];
                        return [5 /*yield**/, _loop_3(ee)];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        _d++;
                        return [3 /*break*/, 1];
                    case 4:
                        // Format and replace
                        title = embeddedExprs_1.formatEmbeddedExprString({
                            text: title,
                            embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
                            exprValues: exprValues,
                            schema: instanceCtx.schema,
                            contextVars: instanceCtx.contextVars,
                            locale: instanceCtx.locale,
                            formatLocale: instanceCtx.formatLocale
                        });
                        _f.label = 5;
                    case 5:
                        page = {
                            type: this.actionDef.pageType,
                            modalSize: this.actionDef.modalSize || "large",
                            database: instanceCtx.database,
                            widgetId: this.actionDef.widgetId,
                            contextVarValues: contextVarValues,
                            title: title
                        };
                        if (this.actionDef.replacePage) {
                            instanceCtx.pageStack.replacePage(page);
                        }
                        else {
                            instanceCtx.pageStack.openPage(page);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Render an optional property editor for the action. This may use bootstrap */
    OpenPageAction.prototype.renderEditor = function (props) {
        // Create widget options 
        var widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(function (w) { return ({ label: w.name, value: w.id }); }), "label");
        var actionDef = this.actionDef;
        var onChange = props.onChange;
        var handleWidgetIdChange = function (widgetId) {
            onChange(__assign(__assign({}, actionDef), { widgetId: widgetId, contextVarValues: {} }));
        };
        var widgetDef = actionDef.widgetId ? props.widgetLibrary.widgets[actionDef.widgetId] : null;
        var renderContextVarValue = function (contextVar) {
            var cvr = actionDef.contextVarValues[contextVar.id];
            var handleCVRChange = function (cvr) {
                props.onChange(immer_1.default(actionDef, function (draft) {
                    draft.contextVarValues[contextVar.id] = cvr;
                }));
            };
            // Create options list
            var options = [
                { value: { type: "null" }, label: "No Value" },
                { value: { type: "literal", value: null }, label: "Literal Value" }
            ];
            for (var _i = 0, _a = props.contextVars; _i < _a.length; _i++) {
                var cv = _a[_i];
                if (areContextVarCompatible(cv, contextVar)) {
                    options.push({ value: { type: "ref", contextVarId: cv.id }, label: cv.name });
                }
            }
            return (React.createElement("tr", { key: contextVar.id },
                React.createElement("td", { key: "name" }, contextVar.name),
                React.createElement("td", { key: "value" },
                    React.createElement(bootstrap_1.Select, { options: options, value: cvr && cvr.type == "literal" ? { type: "literal", value: null } : cvr, onChange: handleCVRChange, nullLabel: "Select..." }),
                    !cvr ? React.createElement("span", { className: "text-warning" }, "Value not set") : null,
                    cvr && cvr.type == "literal" ?
                        React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: props.schema, dataSource: props.dataSource, table: contextVar.table || null, value: cvr.value, onChange: function (expr) { handleCVRChange(__assign(__assign({}, cvr), { value: expr })); } })
                        : null)));
        };
        var renderContextVarValues = function () {
            if (!widgetDef) {
                return null;
            }
            return (React.createElement("table", { className: "table table-bordered table-condensed" },
                React.createElement("tbody", null, widgetDef.contextVars.map(renderContextVarValue))));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Type" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "pageType" }, function (value, onChange) { return React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }] }); })),
            this.actionDef.pageType == "modal" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Modal Size" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "modalSize" }, function (value, onChange) {
                        return React.createElement(bootstrap_1.Toggle, { value: value || "large", onChange: onChange, options: [
                                { value: "small", label: "Small" },
                                { value: "normal", label: "Normal" },
                                { value: "large", label: "Large" },
                                { value: "full", label: "Full-screen" }
                            ] });
                    }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Widget" },
                React.createElement(bootstrap_1.Select, { value: actionDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "replacePage" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Replace current page"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" }, renderContextVarValues()),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "title" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "titleEmbeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); }))));
    };
    return OpenPageAction;
}(actions_1.Action));
exports.OpenPageAction = OpenPageAction;
/**
 * Determine if context variables are compatible to be passed in.
 */
function areContextVarCompatible(cv1, cv2) {
    if (cv1.type != cv2.type) {
        return false;
    }
    if (cv1.table != cv2.table) {
        return false;
    }
    if (cv1.idTable != cv2.idTable) {
        return false;
    }
    if (cv1.enumValues && !cv2.enumValues) {
        return false;
    }
    if (!cv1.enumValues && cv2.enumValues) {
        return false;
    }
    if (cv1.enumValues && cv2.enumValues) {
        if (!_.isEqual(cv1.enumValues.map(function (ev) { return ev.id; }), cv2.enumValues.map(function (ev) { return ev.id; }))) {
            return false;
        }
    }
    return true;
}
