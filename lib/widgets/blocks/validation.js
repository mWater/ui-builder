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
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var react_1 = __importStar(require("react"));
var mwater_expressions_1 = require("mwater-expressions");
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var ListEditor_1 = __importDefault(require("../ListEditor"));
var localization_1 = require("../localization");
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var ValidationBlock = /** @class */ (function (_super) {
    __extends(ValidationBlock, _super);
    function ValidationBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidationBlock.prototype.validate = function (options) {
        var error;
        var _loop_1 = function (validation) {
            // Validate cv
            var contextVar = options.contextVars.find(function (cv) { return cv.id === validation.contextVarId && (cv.type === "rowset" || cv.type === "row"); });
            if (!contextVar) {
                return { value: "Context variable required" };
            }
            var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
            // Validate expr
            error = exprValidator.validateExpr(this_1.blockDef.expr, { table: contextVar.table, types: ["boolean"] });
            if (error) {
                return { value: error };
            }
            // Check message
            if (!validation.message) {
                return { value: "Message required" };
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.blockDef.validations; _i < _a.length; _i++) {
            var validation = _a[_i];
            var state_1 = _loop_1(validation);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return null;
    };
    /** Get context variable expressions needed */
    ValidationBlock.prototype.getContextVarExprs = function (contextVar) {
        return this.blockDef.validations.filter(function (v) { return v.contextVarId == contextVar.id; }).map(function (v) { return v.condition; });
    };
    ValidationBlock.prototype.renderDesign = function (props) {
        return react_1.default.createElement("div", { className: "text-muted" },
            react_1.default.createElement("i", { className: "fa fa-check" }),
            " Validation");
    };
    ValidationBlock.prototype.renderInstance = function (props) {
        return react_1.default.createElement(ValidationBlockInstance, { renderProps: props, blockDef: this.blockDef });
    };
    ValidationBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var handleAdd = function () {
            props.store.replaceBlock(immer_1.default(_this.blockDef, function (bd) {
                bd.validations.push({ contextVarId: null, condition: null, message: null });
            }));
        };
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h3", null, "Validation"),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Validations" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "validations" }, function (validations, onValidationsChange) {
                    return react_1.default.createElement(ListEditor_1.default, { items: validations, onItemsChange: onValidationsChange }, function (validation, onValidationChange) {
                        return react_1.default.createElement(ValidationEditor, { validation: validation, onValidationsChange: onValidationChange, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, locale: props.locale });
                    });
                }),
                react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAdd },
                    react_1.default.createElement("i", { className: "fa fa-plus" }),
                    " Add Validation")),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "immediate" }, function (value, onChange) { return react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Validate Immediately"); })));
    };
    return ValidationBlock;
}(LeafBlock_1.default));
exports.ValidationBlock = ValidationBlock;
/** Editor for a single validation */
var ValidationEditor = function (props) {
    var contextVar = props.contextVars.find(function (cv) { return cv.id === props.validation.contextVarId; });
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Row/Rowset Variable" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.validation, onChange: props.onValidationsChange, property: "contextVarId" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }); })),
        contextVar && contextVar.table ?
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Condition that must be not be false" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.validation, onChange: props.onValidationsChange, property: "condition" }, function (value, onChange) {
                    return react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["boolean"], aggrStatuses: ["aggregate", "individual", "literal"], variables: blocks_1.createExprVariables(props.contextVars), table: contextVar.table });
                }))
            : null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Error Message" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.validation, onChange: props.onValidationsChange, property: "message" }, function (value, onChange) {
                return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale });
            }))));
};
var getValidationErrors = function (blockDef, renderProps) {
    var errors = [];
    // Check validations
    for (var _i = 0, _a = blockDef.validations; _i < _a.length; _i++) {
        var validation = _a[_i];
        // Get value of condition
        var value = renderProps.getContextVarExprValue(validation.contextVarId, validation.condition);
        if (value === false) {
            errors.push(localization_1.localize(validation.message, renderProps.locale));
        }
    }
    return errors;
};
var ValidationBlockInstance = function (props) {
    // True if validating
    var _a = react_1.useState(props.blockDef.immediate || false), validating = _a[0], setValidating = _a[1];
    var validate = function () {
        // Now validating
        setValidating(true);
        var errors = getValidationErrors(props.blockDef, props.renderProps);
        if (errors.length > 0) {
            return errors[0];
        }
        return null;
    };
    // Register for validation
    react_1.useEffect(function () {
        return props.renderProps.registerForValidation(validate);
    }, []);
    // If not validating, null
    if (!validating) {
        return null;
    }
    // Get errors
    var errors = getValidationErrors(props.blockDef, props.renderProps);
    if (errors.length == 0) {
        return null;
    }
    return react_1.default.createElement("div", { className: "alert alert-danger" }, errors.map(function (e, index) { return react_1.default.createElement("div", { key: index },
        react_1.default.createElement("i", { className: "fa fa-exclamation-triangle" }),
        " ",
        e); }));
};
