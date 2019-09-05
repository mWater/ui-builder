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
var localization_1 = require("../localization");
var propertyEditors_1 = require("../propertyEditors");
var VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
var ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
var _ = __importStar(require("lodash"));
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed.
 */
var SaveCancelBlock = /** @class */ (function (_super) {
    __extends(SaveCancelBlock, _super);
    function SaveCancelBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SaveCancelBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    };
    SaveCancelBlock.prototype.validate = function () {
        if (!this.blockDef.child) {
            return "Contents required";
        }
        if (!this.blockDef.saveLabel) {
            return "Save label required";
        }
        if (!this.blockDef.cancelLabel) {
            return "Cancel label required";
        }
        if (!this.blockDef.confirmDiscardMessage) {
            return "Confirm discard message required";
        }
        return null;
    };
    SaveCancelBlock.prototype.processChildren = function (action) {
        return immer_1.default(this.blockDef, function (draft) {
            draft.child = action(draft.child);
        });
    };
    SaveCancelBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleAdd = function (addedBlockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        var saveLabelText = localization_1.localize(this.blockDef.saveLabel, props.locale);
        var cancelLabelText = localization_1.localize(this.blockDef.cancelLabel, props.locale);
        return (React.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child, handleAdd),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary" }, saveLabelText),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default" }, cancelLabelText))));
    };
    SaveCancelBlock.prototype.renderInstance = function (props) {
        return React.createElement(SaveCancelInstance, { renderInstanceProps: props, blockDef: this.blockDef, createBlock: this.createBlock });
    };
    SaveCancelBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Save Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "saveLabel" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Cancel Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "cancelLabel" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm Discard Message" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "confirmDiscardMessage" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))));
    };
    return SaveCancelBlock;
}(CompoundBlock_1.default));
exports.SaveCancelBlock = SaveCancelBlock;
/** Instance swaps out the database for a virtual database */
var SaveCancelInstance = /** @class */ (function (_super) {
    __extends(SaveCancelInstance, _super);
    function SaveCancelInstance(props) {
        var _this = _super.call(this, props) || this;
        _this.validate = function () {
            // Confirm if changes present
            if (_this.state.virtualDatabase.mutations.length > 0) {
                if (!confirm(localization_1.localize(_this.props.blockDef.confirmDiscardMessage, _this.props.renderInstanceProps.locale))) {
                    // Return empty string to block without message
                    return "";
                }
            }
            return null;
        };
        _this.handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
            var validationMessages, _i, _a, key, component, msg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validationMessages = [];
                        for (_i = 0, _a = Object.keys(this.instanceRefs); _i < _a.length; _i++) {
                            key = _a[_i];
                            component = this.instanceRefs[key];
                            if (component.validate) {
                                msg = component.validate();
                                if (msg !== null) {
                                    validationMessages.push(msg);
                                }
                            }
                        }
                        if (validationMessages.length > 0) {
                            // "" just blocks
                            if (_.compact(validationMessages).length > 0) {
                                alert(_.compact(validationMessages).join("\n"));
                            }
                            return [2 /*return*/];
                        }
                        this.setState({ saving: true });
                        return [4 /*yield*/, this.state.virtualDatabase.commit()];
                    case 1:
                        _b.sent();
                        this.setState({ saving: false, destroyed: true });
                        this.props.renderInstanceProps.pageStack.closePage();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.handleCancel = function () {
            _this.state.virtualDatabase.rollback();
            _this.setState({ destroyed: true });
            _this.props.renderInstanceProps.pageStack.closePage();
        };
        _this.refHandler = function (key, component) {
            if (component) {
                _this.instanceRefs[key] = component;
            }
            else {
                delete _this.instanceRefs[key];
            }
        };
        /** All sub-block elements must rendered using this function.
         * @param instanceId if more than one child element with the same id will be rendered, instanceId must be a unique string
         * per instance
         */
        _this.renderChildBlock = function (props, childBlockDef, instanceId) {
            // Create block
            if (childBlockDef) {
                var block = _this.props.createBlock(childBlockDef);
                var elem = block.renderInstance(props);
                // Add ref to element
                var key = instanceId ? childBlockDef.id + ":" + instanceId : childBlockDef.id;
                var refedElem = React.cloneElement(elem, __assign(__assign({}, elem.props), { ref: _this.refHandler.bind(null, key) }));
                return refedElem;
            }
            else {
                return null;
            }
        };
        _this.state = {
            virtualDatabase: new VirtualDatabase_1.default(props.renderInstanceProps.database, props.renderInstanceProps.schema, props.renderInstanceProps.locale),
            destroyed: false,
            saving: false
        };
        _this.instanceRefs = {};
        return _this;
    }
    SaveCancelInstance.prototype.render = function () {
        var _this = this;
        if (this.state.destroyed) {
            return null;
        }
        var saveLabelText = localization_1.localize(this.props.blockDef.saveLabel, this.props.renderInstanceProps.locale);
        var cancelLabelText = localization_1.localize(this.props.blockDef.cancelLabel, this.props.renderInstanceProps.locale);
        // Replace renderChildBlock with function that keeps all instances for validation
        var renderInstanceProps = __assign(__assign({}, this.props.renderInstanceProps), { renderChildBlock: this.renderChildBlock });
        // Inject new database and re-inject all context variables. This is needed to allow computed expressions
        // to come from the virtual database
        return (React.createElement("div", null,
            React.createElement(ContextVarsInjector_1.default, { createBlock: this.props.createBlock, database: this.state.virtualDatabase, injectedContextVars: renderInstanceProps.contextVars, injectedContextVarValues: renderInstanceProps.contextVarValues, innerBlock: this.props.blockDef.child, renderInstanceProps: renderInstanceProps, schema: renderInstanceProps.schema }, function (innerRenderInstanceProps, loading, refreshing) {
                if (loading) {
                    return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                        React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
                }
                return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, innerRenderInstanceProps.renderChildBlock(innerRenderInstanceProps, _this.props.blockDef.child)));
            }),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary", onClick: this.handleSave, disabled: this.state.saving }, saveLabelText),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default", onClick: this.handleCancel, disabled: this.state.saving }, cancelLabelText))));
    };
    return SaveCancelInstance;
}(React.Component));
