import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { localize } from '../localization';
import { LocalizedTextPropertyEditor, PropertyEditor, LabeledProperty } from '../propertyEditors';
import VirtualDatabase from '../../database/VirtualDatabase';
import ContextVarsInjector from '../ContextVarsInjector';
import * as _ from 'lodash';
/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed.
 */
export class SaveCancelBlock extends CompoundBlock {
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
        return produce(this.blockDef, draft => {
            draft.child = action(draft.child);
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, produce((b) => {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        const saveLabelText = localize(this.blockDef.saveLabel, props.locale);
        const cancelLabelText = localize(this.blockDef.cancelLabel, props.locale);
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
            React.createElement(LabeledProperty, { label: "Save Label" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "saveLabel" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(LabeledProperty, { label: "Cancel Label" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "cancelLabel" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(LabeledProperty, { label: "Confirm Discard Message" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "confirmDiscardMessage" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
/** Instance swaps out the database for a virtual database */
class SaveCancelInstance extends React.Component {
    constructor(props) {
        super(props);
        this.validate = () => {
            // Confirm if changes present
            if (this.state.virtualDatabase.mutations.length > 0) {
                if (!confirm(localize(this.props.blockDef.confirmDiscardMessage, this.props.renderInstanceProps.locale))) {
                    // Return empty string to block without message
                    return "";
                }
            }
            return null;
        };
        this.handleSave = async () => {
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
            await this.state.virtualDatabase.commit();
            this.setState({ saving: false, destroyed: true });
            this.props.renderInstanceProps.pageStack.closePage();
        };
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
            virtualDatabase: new VirtualDatabase(props.renderInstanceProps.database, props.renderInstanceProps.schema, props.renderInstanceProps.locale),
            destroyed: false,
            saving: false
        };
        this.instanceRefs = {};
    }
    render() {
        if (this.state.destroyed) {
            return null;
        }
        const saveLabelText = localize(this.props.blockDef.saveLabel, this.props.renderInstanceProps.locale);
        const cancelLabelText = localize(this.props.blockDef.cancelLabel, this.props.renderInstanceProps.locale);
        // Replace renderChildBlock with function that keeps all instances for validation
        const renderInstanceProps = Object.assign({}, this.props.renderInstanceProps, { renderChildBlock: this.renderChildBlock });
        // Inject new database and re-inject all context variables. This is needed to allow computed expressions
        // to come from the virtual database
        return (React.createElement("div", null,
            React.createElement(ContextVarsInjector, { createBlock: this.props.createBlock, database: this.state.virtualDatabase, injectedContextVars: renderInstanceProps.contextVars, injectedContextVarValues: renderInstanceProps.contextVarValues, innerBlock: this.props.blockDef.child, renderInstanceProps: renderInstanceProps, schema: renderInstanceProps.schema }, (innerRenderInstanceProps, loading, refreshing) => {
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