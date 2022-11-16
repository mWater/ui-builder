"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveCancelBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = __importDefault(require("uuid"));
const react_1 = __importDefault(require("react"));
const immer_1 = __importDefault(require("immer"));
const blocks_1 = require("../blocks");
const localization_1 = require("../localization");
const propertyEditors_1 = require("../propertyEditors");
const VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const __1 = require("../..");
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed. Has optional delete button too.
 */
class SaveCancelBlock extends blocks_1.Block {
    getChildren(contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    }
    validate(ctx) {
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
            const deleteCV = ctx.contextVars.find((cv) => cv.id == this.blockDef.deleteContextVarId);
            if (!deleteCV) {
                return "Delete context variable not found";
            }
            if (deleteCV.type !== "row") {
                return "Delete context variable wrong type";
            }
        }
        // Check extras
        if (this.blockDef.deleteContextVarId && this.blockDef.extraDeleteContextVarIds) {
            for (const cvId of this.blockDef.extraDeleteContextVarIds) {
                const deleteCV = ctx.contextVars.find((cv) => cv.id == cvId);
                if (!deleteCV) {
                    return "Delete context variable not found";
                }
                if (deleteCV.type !== "row") {
                    return "Delete context variable wrong type";
                }
            }
        }
        if (this.blockDef.deleteCondition) {
            const error = (0, __1.validateContextVarExpr)({
                schema: ctx.schema,
                contextVars: ctx.contextVars,
                contextVarId: this.blockDef.deleteCondition.contextVarId,
                expr: this.blockDef.deleteCondition.expr,
                aggrStatuses: ["individual", "literal"],
                types: ["boolean"]
            });
            if (error) {
                return error;
            }
        }
        return null;
    }
    /** Get any context variables expressions that this block needs (not including child blocks) */
    getContextVarExprs(contextVar, ctx) {
        return this.blockDef.deleteCondition != null &&
            contextVar.id === this.blockDef.deleteCondition.contextVarId &&
            this.blockDef.deleteCondition.expr
            ? [this.blockDef.deleteCondition.expr]
            : [];
    }
    processChildren(action) {
        const child = action(this.blockDef.child);
        return (0, immer_1.default)(this.blockDef, (draft) => {
            draft.child = child;
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        const saveLabelText = (0, localization_1.localize)(this.blockDef.saveLabel, props.locale);
        const cancelLabelText = (0, localization_1.localize)(this.blockDef.cancelLabel, props.locale);
        const deleteLabelText = (0, localization_1.localize)(this.blockDef.deleteLabel, props.locale);
        return (react_1.default.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child, handleAdd),
            react_1.default.createElement("div", { className: "save-cancel-footer" },
                this.blockDef.deleteContextVarId ? (react_1.default.createElement("button", { type: "button", className: "btn btn-outline-danger", style: { float: "left" } },
                    react_1.default.createElement("i", { className: "fa fa-remove" }),
                    " ",
                    deleteLabelText)) : null,
                react_1.default.createElement("button", { type: "button", className: "btn btn-primary" }, saveLabelText),
                "\u00A0",
                react_1.default.createElement("button", { type: "button", className: "btn btn-secondary" }, cancelLabelText))));
    }
    /** Special case as the inner block will have a virtual database and its own expression evaluator */
    getSubtreeContextVarExprs(contextVar, ctx) {
        return this.getContextVarExprs(contextVar, ctx);
    }
    renderInstance(props) {
        return react_1.default.createElement(SaveCancelInstance, { instanceCtx: props, blockDef: this.blockDef });
    }
    renderEditor(props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Save Label" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "saveLabel" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Cancel Label" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "cancelLabel" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm Discard Message" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "confirmDiscardMessage" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Optional Delete Target" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "deleteContextVarId" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] })))),
            this.blockDef.deleteContextVarId ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Delete Label" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "deleteLabel" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))))) : null,
            this.blockDef.deleteContextVarId ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Optional Confirm Delete Message" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "confirmDeleteMessage" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))))) : null,
            this.blockDef.deleteContextVarId ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Delete condition", hint: "optional expression that must be true to show delete button" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "deleteCondition" }, (value, onChange) => (react_1.default.createElement(__1.ContextVarExprPropertyEditor, { schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, contextVarExpr: value, onChange: onChange, types: ["boolean"] }))))) : null,
            this.blockDef.deleteContextVarId ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Optional Additional Delete Targets" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "extraDeleteContextVarIds" }, (value, onChange) => {
                    function renderItem(item, index, onItemChange) {
                        return (react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: item, onChange: onItemChange, contextVars: props.contextVars, types: ["row"] }));
                    }
                    return (react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value || [], onItemsChange: onChange, renderItem: renderItem, addLabel: "Add", createNew: () => null }));
                }))) : null));
    }
}
exports.SaveCancelBlock = SaveCancelBlock;
/** Instance swaps out the database for a virtual database */
class SaveCancelInstance extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.validate = () => {
            // Confirm if changes present
            if (this.state.virtualDatabase.mutations.length > 0) {
                if (!confirm((0, localization_1.localize)(this.props.blockDef.confirmDiscardMessage, this.props.instanceCtx.locale))) {
                    // Return empty string to block without message
                    return "";
                }
            }
            return null;
        };
        this.handleSave = () => __awaiter(this, void 0, void 0, function* () {
            // Validate all instances that have registered
            const validationMessages = [];
            for (const validator of Object.values(this.validationRegistrations)) {
                const msg = yield validator(validationMessages.length == 0);
                if (msg != null) {
                    validationMessages.push(msg);
                }
            }
            if (validationMessages.length > 0) {
                // "" just blocks
                if (lodash_1.default.compact(validationMessages).length > 0) {
                    alert(lodash_1.default.compact(validationMessages).join("\n"));
                }
                return;
            }
            this.setState({ saving: true });
            try {
                yield this.state.virtualDatabase.commit();
            }
            catch (err) {
                // TODO localize
                alert("Unable to save changes: " + err.message);
                this.setState({ saving: false });
                return;
            }
            this.setState({ saving: false, destroyed: true });
            this.props.instanceCtx.pageStack.closePage();
        });
        this.handleCancel = () => {
            this.state.virtualDatabase.rollback();
            this.setState({ destroyed: true });
            this.props.instanceCtx.pageStack.closePage();
        };
        this.handleDelete = () => __awaiter(this, void 0, void 0, function* () {
            const blockDef = this.props.blockDef;
            // Confirm deletion
            if (blockDef.confirmDeleteMessage &&
                !confirm((0, localization_1.localize)(blockDef.confirmDeleteMessage, this.props.instanceCtx.locale))) {
                return;
            }
            // Do actual deletion
            const db = this.props.instanceCtx.database;
            const deleteRow = (tx, contextVarId) => __awaiter(this, void 0, void 0, function* () {
                const deleteCV = this.props.instanceCtx.contextVars.find((cv) => cv.id == contextVarId);
                if (!deleteCV) {
                    throw new Error("Missing delete CV");
                }
                const rowId = this.props.instanceCtx.contextVarValues[deleteCV.id];
                if (!rowId) {
                    return;
                }
                yield tx.removeRow(deleteCV.table, rowId);
            });
            try {
                const txn = db.transaction();
                deleteRow(txn, blockDef.deleteContextVarId);
                if (blockDef.extraDeleteContextVarIds) {
                    for (const cvId of blockDef.extraDeleteContextVarIds) {
                        deleteRow(txn, cvId);
                    }
                }
                yield txn.commit();
            }
            catch (err) {
                // TODO localize
                alert("Unable to delete row: " + err.message);
                return;
            }
            this.state.virtualDatabase.rollback();
            this.setState({ destroyed: true });
            this.props.instanceCtx.pageStack.closePage();
        });
        /** Stores the registration for validation of a child block and returns an unregister function */
        this.registerChildForValidation = (validate) => {
            const key = (0, uuid_1.default)();
            this.validationRegistrations[key] = validate;
            return () => {
                delete this.validationRegistrations[key];
            };
        };
        this.validationRegistrations = {};
        this.state = {
            virtualDatabase: new VirtualDatabase_1.default(props.instanceCtx.database, props.instanceCtx.schema, props.instanceCtx.locale),
            destroyed: false,
            saving: false
        };
    }
    componentDidMount() {
        this.unregisterValidation = this.props.instanceCtx.registerForValidation(this.validate);
    }
    componentWillUnmount() {
        this.unregisterValidation();
    }
    render() {
        if (this.state.destroyed) {
            return null;
        }
        const saveLabelText = (0, localization_1.localize)(this.props.blockDef.saveLabel, this.props.instanceCtx.locale);
        const cancelLabelText = (0, localization_1.localize)(this.props.blockDef.cancelLabel, this.props.instanceCtx.locale);
        const deleteLabelText = (0, localization_1.localize)(this.props.blockDef.deleteLabel, this.props.instanceCtx.locale);
        // Replace renderChildBlock with function that keeps all instances for validation
        const instanceCtx = Object.assign(Object.assign({}, this.props.instanceCtx), { registerForValidation: this.registerChildForValidation });
        // Determine if row to delete
        let canDelete = this.props.blockDef.deleteContextVarId != null &&
            this.props.instanceCtx.contextVarValues[this.props.blockDef.deleteContextVarId] != null &&
            (this.props.blockDef.deleteCondition == null ||
                this.props.blockDef.deleteCondition.expr == null ||
                this.props.instanceCtx.getContextVarExprValue(this.props.blockDef.deleteCondition.contextVarId, this.props.blockDef.deleteCondition.expr) == true);
        if (this.props.blockDef.extraDeleteContextVarIds) {
            for (const cvId of this.props.blockDef.extraDeleteContextVarIds) {
                canDelete = canDelete || (cvId != null && this.props.instanceCtx.contextVarValues[cvId] != null);
            }
        }
        // Inject new database and re-inject all context variables. This is needed to allow computed expressions
        // to come from the virtual database
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(ContextVarsInjector_1.default, { injectedContextVars: instanceCtx.contextVars, injectedContextVarValues: instanceCtx.contextVarValues, innerBlock: this.props.blockDef.child, instanceCtx: Object.assign(Object.assign({}, instanceCtx), { database: this.state.virtualDatabase }) }, (innerInstanceCtx, loading, refreshing) => {
                if (loading) {
                    return (react_1.default.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                        react_1.default.createElement("i", { className: "fa fa-circle-o-notch fa-spin" })));
                }
                return innerInstanceCtx.renderChildBlock(innerInstanceCtx, this.props.blockDef.child);
            }),
            react_1.default.createElement("div", { className: "save-cancel-footer" },
                canDelete ? (react_1.default.createElement("button", { type: "button", className: "btn btn-outline-danger", onClick: this.handleDelete, style: { float: "left" } },
                    react_1.default.createElement("i", { className: "fa fa-remove" }),
                    " ",
                    deleteLabelText)) : null,
                react_1.default.createElement("button", { type: "button", className: "btn btn-primary", onClick: this.handleSave, disabled: this.state.saving },
                    this.state.saving ? react_1.default.createElement("i", { className: "fa fa-fw fa-spinner fa-spin" }) : null,
                    saveLabelText),
                "\u00A0",
                react_1.default.createElement("button", { type: "button", className: "btn btn-secondary", onClick: this.handleCancel, disabled: this.state.saving }, cancelLabelText))));
    }
}
