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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveCancelBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var uuid_1 = __importDefault(require("uuid"));
var react_1 = __importDefault(require("react"));
var immer_1 = __importDefault(require("immer"));
var blocks_1 = require("../blocks");
var localization_1 = require("../localization");
var propertyEditors_1 = require("../propertyEditors");
var VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
var ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
var ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed. Has optional delete button too.
 */
var SaveCancelBlock = /** @class */ (function (_super) {
    __extends(SaveCancelBlock, _super);
    function SaveCancelBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SaveCancelBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    };
    SaveCancelBlock.prototype.validate = function (options) {
        var _this = this;
        if (!this.blockDef.saveLabel) {
            return "Save label required";
        }
        if (!this.blockDef.cancelLabel) {
            return "Cancel label required";
        }
        if (!this.blockDef.confirmDiscardMessage) {
            return "Confirm discard message required";
        }
        if (this.blockDef.deleteContextVarId) {
            if (!this.blockDef.deleteLabel) {
                return "Delete label required";
            }
            var deleteCV = options.contextVars.find(function (cv) { return cv.id == _this.blockDef.deleteContextVarId; });
            if (!deleteCV) {
                return "Delete context variable not found";
            }
            if (deleteCV.type !== "row") {
                return "Delete context variable wrong type";
            }
        }
        // Check extras
        if (this.blockDef.deleteContextVarId && this.blockDef.extraDeleteContextVarIds) {
            var _loop_1 = function (cvId) {
                var deleteCV = options.contextVars.find(function (cv) { return cv.id == cvId; });
                if (!deleteCV) {
                    return { value: "Delete context variable not found" };
                }
                if (deleteCV.type !== "row") {
                    return { value: "Delete context variable wrong type" };
                }
            };
            for (var _i = 0, _a = this.blockDef.extraDeleteContextVarIds; _i < _a.length; _i++) {
                var cvId = _a[_i];
                var state_1 = _loop_1(cvId);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        return null;
    };
    SaveCancelBlock.prototype.processChildren = function (action) {
        var child = action(this.blockDef.child);
        return immer_1.default(this.blockDef, function (draft) {
            draft.child = child;
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
        var deleteLabelText = localization_1.localize(this.blockDef.deleteLabel, props.locale);
        return (react_1.default.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child, handleAdd),
            react_1.default.createElement("div", { className: "save-cancel-footer" },
                this.blockDef.deleteContextVarId ?
                    react_1.default.createElement("button", { type: "button", className: "btn btn-danger", style: { float: "left" } },
                        react_1.default.createElement("i", { className: "fa fa-remove" }),
                        " ",
                        deleteLabelText)
                    : null,
                react_1.default.createElement("button", { type: "button", className: "btn btn-primary" }, saveLabelText),
                "\u00A0",
                react_1.default.createElement("button", { type: "button", className: "btn btn-default" }, cancelLabelText))));
    };
    /** Special case as the inner block will have a virtual database and its own expression evaluator */
    SaveCancelBlock.prototype.getSubtreeContextVarExprs = function (contextVar, ctx) {
        return [];
    };
    SaveCancelBlock.prototype.renderInstance = function (props) {
        return react_1.default.createElement(SaveCancelInstance, { instanceCtx: props, blockDef: this.blockDef });
    };
    SaveCancelBlock.prototype.renderEditor = function (props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Save Label" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "saveLabel" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Cancel Label" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "cancelLabel" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm Discard Message" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "confirmDiscardMessage" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Optional Delete Target" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "deleteContextVarId" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] }); })),
            this.blockDef.deleteContextVarId ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Delete Label" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "deleteLabel" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))
                : null,
            this.blockDef.deleteContextVarId ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Optional Confirm Delete Message" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "confirmDeleteMessage" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))
                : null,
            this.blockDef.deleteContextVarId ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Optional Additional Delete Targets" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "extraDeleteContextVarIds" }, function (value, onChange) {
                        function renderItem(item, index, onItemChange) {
                            return react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: item, onChange: onItemChange, contextVars: props.contextVars, types: ["row"] });
                        }
                        return react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value || [], onItemsChange: onChange, renderItem: renderItem, addLabel: "Add", createNew: function () { return null; } });
                    }))
                : null));
    };
    return SaveCancelBlock;
}(blocks_1.Block));
exports.SaveCancelBlock = SaveCancelBlock;
/** Instance swaps out the database for a virtual database */
var SaveCancelInstance = /** @class */ (function (_super) {
    __extends(SaveCancelInstance, _super);
    function SaveCancelInstance(props) {
        var _this = _super.call(this, props) || this;
        _this.validate = function () {
            // Confirm if changes present
            if (_this.state.virtualDatabase.mutations.length > 0) {
                if (!confirm(localization_1.localize(_this.props.blockDef.confirmDiscardMessage, _this.props.instanceCtx.locale))) {
                    // Return empty string to block without message
                    return "";
                }
            }
            return null;
        };
        _this.handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
            var validationMessages, _i, _a, key, msg, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validationMessages = [];
                        _i = 0, _a = Object.keys(this.validationRegistrations);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        key = _a[_i];
                        return [4 /*yield*/, this.validationRegistrations[key](validationMessages.length == 0)];
                    case 2:
                        msg = _b.sent();
                        if (msg != null) {
                            validationMessages.push(msg);
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (validationMessages.length > 0) {
                            // "" just blocks
                            if (lodash_1.default.compact(validationMessages).length > 0) {
                                alert(lodash_1.default.compact(validationMessages).join("\n"));
                            }
                            return [2 /*return*/];
                        }
                        this.setState({ saving: true });
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.state.virtualDatabase.commit()];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_1 = _b.sent();
                        // TODO localize
                        alert("Unable to save changes: " + err_1.message);
                        this.setState({ saving: false });
                        return [2 /*return*/];
                    case 8:
                        this.setState({ saving: false, destroyed: true });
                        this.props.instanceCtx.pageStack.closePage();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.handleCancel = function () {
            _this.state.virtualDatabase.rollback();
            _this.setState({ destroyed: true });
            _this.props.instanceCtx.pageStack.closePage();
        };
        _this.handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
            var blockDef, db, deleteRow, txn, _i, _a, cvId, err_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        blockDef = this.props.blockDef;
                        // Confirm deletion
                        if (blockDef.confirmDeleteMessage && !confirm(localization_1.localize(blockDef.confirmDeleteMessage, this.props.instanceCtx.locale))) {
                            return [2 /*return*/];
                        }
                        db = this.props.instanceCtx.database;
                        deleteRow = function (tx, contextVarId) { return __awaiter(_this, void 0, void 0, function () {
                            var deleteCV, rowId;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        deleteCV = this.props.instanceCtx.contextVars.find(function (cv) { return cv.id == contextVarId; });
                                        if (!deleteCV) {
                                            throw new Error("Missing delete CV");
                                        }
                                        rowId = this.props.instanceCtx.contextVarValues[deleteCV.id];
                                        if (!rowId) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, tx.removeRow(deleteCV.table, rowId)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        txn = db.transaction();
                        deleteRow(txn, blockDef.deleteContextVarId);
                        if (blockDef.extraDeleteContextVarIds) {
                            for (_i = 0, _a = blockDef.extraDeleteContextVarIds; _i < _a.length; _i++) {
                                cvId = _a[_i];
                                deleteRow(txn, cvId);
                            }
                        }
                        return [4 /*yield*/, txn.commit()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _b.sent();
                        // TODO localize
                        alert("Unable to delete row: " + err_2.message);
                        return [2 /*return*/];
                    case 4:
                        this.state.virtualDatabase.rollback();
                        this.setState({ destroyed: true });
                        this.props.instanceCtx.pageStack.closePage();
                        return [2 /*return*/];
                }
            });
        }); };
        /** Stores the registration for validation of a child block and returns an unregister function */
        _this.registerChildForValidation = function (validate) {
            var key = uuid_1.default();
            _this.validationRegistrations[key] = validate;
            return function () {
                delete _this.validationRegistrations[key];
            };
        };
        _this.validationRegistrations = {};
        _this.state = {
            virtualDatabase: new VirtualDatabase_1.default(props.instanceCtx.database, props.instanceCtx.schema, props.instanceCtx.locale),
            destroyed: false,
            saving: false
        };
        return _this;
    }
    SaveCancelInstance.prototype.componentDidMount = function () {
        this.unregisterValidation = this.props.instanceCtx.registerForValidation(this.validate);
    };
    SaveCancelInstance.prototype.componentWillUnmount = function () {
        this.unregisterValidation();
    };
    SaveCancelInstance.prototype.render = function () {
        var _this = this;
        if (this.state.destroyed) {
            return null;
        }
        var saveLabelText = localization_1.localize(this.props.blockDef.saveLabel, this.props.instanceCtx.locale);
        var cancelLabelText = localization_1.localize(this.props.blockDef.cancelLabel, this.props.instanceCtx.locale);
        var deleteLabelText = localization_1.localize(this.props.blockDef.deleteLabel, this.props.instanceCtx.locale);
        // Replace renderChildBlock with function that keeps all instances for validation
        var instanceCtx = __assign(__assign({}, this.props.instanceCtx), { registerForValidation: this.registerChildForValidation });
        // Determine if row to delete
        var canDelete = this.props.blockDef.deleteContextVarId != null && this.props.instanceCtx.contextVarValues[this.props.blockDef.deleteContextVarId] != null;
        if (this.props.blockDef.extraDeleteContextVarIds) {
            for (var _i = 0, _a = this.props.blockDef.extraDeleteContextVarIds; _i < _a.length; _i++) {
                var cvId = _a[_i];
                canDelete = canDelete || (cvId != null && this.props.instanceCtx.contextVarValues[cvId] != null);
            }
        }
        // Inject new database and re-inject all context variables. This is needed to allow computed expressions
        // to come from the virtual database
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(ContextVarsInjector_1.default, { injectedContextVars: instanceCtx.contextVars, injectedContextVarValues: instanceCtx.contextVarValues, innerBlock: this.props.blockDef.child, instanceCtx: __assign(__assign({}, instanceCtx), { database: this.state.virtualDatabase }) }, function (innerInstanceCtx, loading, refreshing) {
                if (loading) {
                    return react_1.default.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                        react_1.default.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
                }
                return (react_1.default.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, innerInstanceCtx.renderChildBlock(innerInstanceCtx, _this.props.blockDef.child)));
            }),
            react_1.default.createElement("div", { className: "save-cancel-footer" },
                canDelete ?
                    react_1.default.createElement("button", { type: "button", className: "btn btn-danger", onClick: this.handleDelete, style: { float: "left" } },
                        react_1.default.createElement("i", { className: "fa fa-remove" }),
                        " ",
                        deleteLabelText)
                    : null,
                react_1.default.createElement("button", { type: "button", className: "btn btn-primary", onClick: this.handleSave, disabled: this.state.saving },
                    this.state.saving ? react_1.default.createElement("i", { className: "fa fa-fw fa-spinner fa-spin" }) : null,
                    saveLabelText),
                "\u00A0",
                react_1.default.createElement("button", { type: "button", className: "btn btn-default", onClick: this.handleCancel, disabled: this.state.saving }, cancelLabelText))));
    };
    return SaveCancelInstance;
}(react_1.default.Component));
