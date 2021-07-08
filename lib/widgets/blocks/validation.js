"use strict";
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
exports.ValidationBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const react_1 = __importStar(require("react"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const ListEditor_1 = __importDefault(require("../ListEditor"));
const localization_1 = require("../localization");
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const scrolling_1 = require("../scrolling");
class ValidationBlock extends LeafBlock_1.default {
    validate(options) {
        let error;
        for (const validation of this.blockDef.validations) {
            error = blocks_1.validateContextVarExpr({
                schema: options.schema,
                contextVars: options.contextVars,
                contextVarId: validation.contextVarId,
                expr: validation.condition,
                types: ["boolean"]
            });
            if (error) {
                return error;
            }
            // Check message
            if (!validation.message) {
                return "Message required";
            }
        }
        return null;
    }
    /** Get context variable expressions needed */
    getContextVarExprs(contextVar) {
        return this.blockDef.validations.filter(v => v.contextVarId == contextVar.id).map(v => v.condition);
    }
    renderDesign(props) {
        return react_1.default.createElement("div", { className: "text-muted" },
            react_1.default.createElement("i", { className: "fa fa-check" }),
            " Validation");
    }
    renderInstance(props) {
        return react_1.default.createElement(ValidationBlockInstance, { renderProps: props, blockDef: this.blockDef });
    }
    renderEditor(props) {
        const handleAdd = () => {
            props.store.replaceBlock(immer_1.default(this.blockDef, (bd) => {
                bd.validations.push({ contextVarId: null, condition: null, message: null });
            }));
        };
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h3", null, "Validation"),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Validations" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "validations" }, (validations, onValidationsChange) => react_1.default.createElement(ListEditor_1.default, { items: validations, onItemsChange: onValidationsChange }, (validation, onValidationChange) => react_1.default.createElement(ValidationEditor, { validation: validation, onValidationChange: onValidationChange, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, locale: props.locale }))),
                react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAdd },
                    react_1.default.createElement("i", { className: "fa fa-plus" }),
                    " Add Validation")),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "immediate" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Validate Immediately"))));
    }
}
exports.ValidationBlock = ValidationBlock;
/** Editor for a single validation */
const ValidationEditor = (props) => {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Condition that must be not be false" },
            react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], types: ["boolean"], contextVarId: props.validation.contextVarId, expr: props.validation.condition, onChange: (contextVarId, condition) => {
                    props.onValidationChange({ ...props.validation, contextVarId, condition });
                } })),
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Error Message" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.validation, onChange: props.onValidationChange, property: "message" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
};
const getValidationErrors = (blockDef, renderProps) => {
    const errors = [];
    // Check validations
    for (const validation of blockDef.validations) {
        // Get value of condition
        const value = renderProps.getContextVarExprValue(validation.contextVarId, validation.condition);
        if (value === false) {
            errors.push(localization_1.localize(validation.message, renderProps.locale));
        }
    }
    return errors;
};
const ValidationBlockInstance = (props) => {
    // True if validating
    const [validating, setValidating] = react_1.useState(props.blockDef.immediate || false);
    const controlRef = react_1.useRef(null);
    const validate = (isFirstError) => {
        // Now validating
        setValidating(true);
        const errors = getValidationErrors(props.blockDef, props.renderProps);
        if (errors.length > 0) {
            // Scroll into view if first error (check scrollIntoView for test environments without that function)
            if (isFirstError && controlRef.current && controlRef.current.scrollIntoView) {
                controlRef.current.scrollIntoView(true);
                // Add some padding
                const scrollParent = scrolling_1.getScrollParent(controlRef.current);
                if (scrollParent) {
                    scrollParent.scrollBy(0, -30);
                }
            }
            return "";
        }
        return null;
    };
    // Register for validation
    react_1.useEffect(() => {
        return props.renderProps.registerForValidation(validate);
    }, []);
    // If not validating, null
    if (!validating) {
        return null;
    }
    // Get errors
    const errors = getValidationErrors(props.blockDef, props.renderProps);
    if (errors.length == 0) {
        return null;
    }
    return react_1.default.createElement("div", { className: "alert alert-danger", ref: controlRef }, errors.map((e, index) => react_1.default.createElement("div", { key: index },
        react_1.default.createElement("i", { className: "fa fa-exclamation-triangle" }),
        " ",
        e)));
};
