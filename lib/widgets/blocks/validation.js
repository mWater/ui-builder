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
var react_1 = __importStar(require("react"));
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var ListEditor_1 = __importDefault(require("../ListEditor"));
var localization_1 = require("../localization");
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var scrolling_1 = require("../scrolling");
var ValidationBlock = /** @class */ (function (_super) {
    __extends(ValidationBlock, _super);
    function ValidationBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidationBlock.prototype.validate = function (options) {
        var error;
        for (var _i = 0, _a = this.blockDef.validations; _i < _a.length; _i++) {
            var validation = _a[_i];
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
                        return react_1.default.createElement(ValidationEditor, { validation: validation, onValidationChange: onValidationChange, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, locale: props.locale });
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
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Condition that must be not be false" },
            react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], types: ["boolean"], contextVarId: props.validation.contextVarId, expr: props.validation.condition, onChange: function (contextVarId, condition) {
                    props.onValidationChange(__assign(__assign({}, props.validation), { contextVarId: contextVarId, condition: condition }));
                } })),
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Error Message" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.validation, onChange: props.onValidationChange, property: "message" }, function (value, onChange) {
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
    var controlRef = react_1.useRef(null);
    var validate = function (isFirstError) {
        // Now validating
        setValidating(true);
        var errors = getValidationErrors(props.blockDef, props.renderProps);
        if (errors.length > 0) {
            // Scroll into view if first error (check scrollIntoView for test environments without that function)
            if (isFirstError && controlRef.current && controlRef.current.scrollIntoView) {
                controlRef.current.scrollIntoView(true);
                // Add some padding
                var scrollParent = scrolling_1.getScrollParent(controlRef.current);
                if (scrollParent) {
                    scrollParent.scrollBy(0, -30);
                }
            }
            return "";
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
    return react_1.default.createElement("div", { className: "alert alert-danger", ref: controlRef }, errors.map(function (e, index) { return react_1.default.createElement("div", { key: index },
        react_1.default.createElement("i", { className: "fa fa-exclamation-triangle" }),
        " ",
        e); }));
};
