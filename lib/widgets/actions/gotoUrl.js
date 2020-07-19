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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GotoUrlAction = void 0;
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var actions_1 = require("../actions");
var propertyEditors_1 = require("../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var embeddedExprs_1 = require("../../embeddedExprs");
/** Opens a URL optionally in a new tab */
var GotoUrlAction = /** @class */ (function (_super) {
    __extends(GotoUrlAction, _super);
    function GotoUrlAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GotoUrlAction.prototype.validate = function (designCtx) {
        // Check that url is present
        if (!this.actionDef.url) {
            return "URL required";
        }
        // Validate expressions
        var err = embeddedExprs_1.validateEmbeddedExprs({
            embeddedExprs: this.actionDef.urlEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (err) {
            return err;
        }
        return null;
    };
    /** Get any context variables expressions that this action needs */
    GotoUrlAction.prototype.getContextVarExprs = function (contextVar) {
        if (this.actionDef.urlEmbeddedExprs) {
            return _.compact(_.map(this.actionDef.urlEmbeddedExprs, function (ee) { return ee.contextVarId === contextVar.id ? ee.expr : null; }));
        }
        return [];
    };
    GotoUrlAction.prototype.renderEditor = function (props) {
        var onChange = props.onChange;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "URL" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "url" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "URL embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "urlEmbeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "newTab" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Open in new tab"); })));
    };
    GotoUrlAction.prototype.performAction = function (instanceCtx) {
        return __awaiter(this, void 0, void 0, function () {
            var url, exprValues;
            return __generator(this, function (_a) {
                url = this.actionDef.url;
                exprValues = _.map(this.actionDef.urlEmbeddedExprs || [], function (ee) { return instanceCtx.getContextVarExprValue(ee.contextVarId, ee.expr); });
                // Format and replace
                url = embeddedExprs_1.formatEmbeddedExprString({
                    text: url,
                    embeddedExprs: this.actionDef.urlEmbeddedExprs || [],
                    exprValues: exprValues,
                    schema: instanceCtx.schema,
                    contextVars: instanceCtx.contextVars,
                    locale: instanceCtx.locale,
                    formatLocale: instanceCtx.formatLocale
                });
                window.open(url, this.actionDef.newTab ? "_blank" : "_self");
                return [2 /*return*/];
            });
        });
    };
    return GotoUrlAction;
}(actions_1.Action));
exports.GotoUrlAction = GotoUrlAction;
