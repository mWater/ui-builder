"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
const localization_1 = require("../localization");
const propertyEditors_1 = require("../propertyEditors");
const VirtualDatabase_1 = __importDefault(require("../../database/VirtualDatabase"));
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const _ = __importStar(require("lodash"));
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed.
 */
class SaveCancelBlock extends CompoundBlock_1.default {
    getChildren(contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    }
    validate() {
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
    }
    processChildren(action) {
        return immer_1.default(this.blockDef, draft => {
            draft.child = action(draft.child);
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        const saveLabelText = localization_1.localize(this.blockDef.saveLabel, props.locale);
        const cancelLabelText = localization_1.localize(this.blockDef.cancelLabel, props.locale);
        return (React.createElement("div", null,
            props.renderChildBlock(props, this.blockDef.child, handleAdd),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary" }, saveLabelText),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default" }, cancelLabelText))));
    }
    renderInstance(props) {
        return React.createElement(SaveCancelInstance, { renderInstanceProps: props, blockDef: this.blockDef, createBlock: this.createBlock });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Save Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "saveLabel" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Cancel Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "cancelLabel" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm Discard Message" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "confirmDiscardMessage" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
exports.SaveCancelBlock = SaveCancelBlock;
/** Instance swaps out the database for a virtual database */
class SaveCancelInstance extends React.Component {
    constructor(props) {
        super(props);
        this.validate = () => {
            // Confirm if changes present
            if (this.state.virtualDatabase.mutations.length > 0) {
                if (!confirm(localization_1.localize(this.props.blockDef.confirmDiscardMessage, this.props.renderInstanceProps.locale))) {
                    // Return empty string to block without message
                    return "";
                }
            }
            return null;
        };
        this.handleSave = () => __awaiter(this, void 0, void 0, function* () {
            // Validate all instances
            const validationMessages = [];
            for (const key of Object.keys(this.instanceRefs)) {
                const component = this.instanceRefs[key];
                if (component.validate) {
                    const msg = component.validate();
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
                return;
            }
            this.setState({ saving: true });
            yield this.state.virtualDatabase.commit();
            this.setState({ saving: false, destroyed: true });
            this.props.renderInstanceProps.pageStack.closePage();
        });
        this.handleCancel = () => {
            this.state.virtualDatabase.rollback();
            this.setState({ destroyed: true });
            this.props.renderInstanceProps.pageStack.closePage();
        };
        this.refHandler = (key, component) => {
            if (component) {
                this.instanceRefs[key] = component;
            }
            else {
                delete this.instanceRefs[key];
            }
        };
        /** All sub-block elements must rendered using this function.
         * @param instanceId if more than one child element with the same id will be rendered, instanceId must be a unique string
         * per instance
         */
        this.renderChildBlock = (props, childBlockDef, instanceId) => {
            // Create block
            if (childBlockDef) {
                const block = this.props.createBlock(childBlockDef);
                const elem = block.renderInstance(props);
                // Add ref to element
                const key = instanceId ? childBlockDef.id + ":" + instanceId : childBlockDef.id;
                const refedElem = React.cloneElement(elem, Object.assign({}, elem.props, { ref: this.refHandler.bind(null, key) }));
                return refedElem;
            }
            else {
                return null;
            }
        };
        this.state = {
            virtualDatabase: new VirtualDatabase_1.default(props.renderInstanceProps.database, props.renderInstanceProps.schema, props.renderInstanceProps.locale),
            destroyed: false,
            saving: false
        };
        this.instanceRefs = {};
    }
    render() {
        if (this.state.destroyed) {
            return null;
        }
        const saveLabelText = localization_1.localize(this.props.blockDef.saveLabel, this.props.renderInstanceProps.locale);
        const cancelLabelText = localization_1.localize(this.props.blockDef.cancelLabel, this.props.renderInstanceProps.locale);
        // Replace renderChildBlock with function that keeps all instances for validation
        const renderInstanceProps = Object.assign({}, this.props.renderInstanceProps, { renderChildBlock: this.renderChildBlock });
        // Inject new database and re-inject all context variables. This is needed to allow computed expressions
        // to come from the virtual database
        return (React.createElement("div", null,
            React.createElement(ContextVarsInjector_1.default, { createBlock: this.props.createBlock, database: this.state.virtualDatabase, injectedContextVars: renderInstanceProps.contextVars, injectedContextVarValues: renderInstanceProps.contextVarValues, innerBlock: this.props.blockDef.child, renderInstanceProps: renderInstanceProps, schema: renderInstanceProps.schema }, (innerRenderInstanceProps, loading, refreshing) => {
                if (loading) {
                    return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                        React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
                }
                return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, innerRenderInstanceProps.renderChildBlock(innerRenderInstanceProps, this.props.blockDef.child)));
            }),
            React.createElement("div", { className: "save-cancel-footer" },
                React.createElement("button", { type: "button", className: "btn btn-primary", onClick: this.handleSave, disabled: this.state.saving }, saveLabelText),
                "\u00A0",
                React.createElement("button", { type: "button", className: "btn btn-default", onClick: this.handleCancel, disabled: this.state.saving }, cancelLabelText))));
    }
}
//# sourceMappingURL=saveCancel.js.map