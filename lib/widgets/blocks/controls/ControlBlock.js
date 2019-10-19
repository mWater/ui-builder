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
var LeafBlock_1 = __importDefault(require("../../LeafBlock"));
var React = __importStar(require("react"));
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var localization_1 = require("../../localization");
var DataSourceDatabase_1 = require("../../../database/DataSourceDatabase");
/** Abstract class for a control such as a dropdown, text field, etc that operates on a single column */
var ControlBlock = /** @class */ (function (_super) {
    __extends(ControlBlock, _super);
    function ControlBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ControlBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var renderControlProps = {
            value: null,
            rowContextVar: props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId; }),
            onChange: function () { return; },
            locale: props.locale,
            database: new DataSourceDatabase_1.DataSourceDatabase(props.schema, props.dataSource),
            schema: props.schema,
            dataSource: props.dataSource,
            disabled: false,
            contextVars: props.contextVars,
            contextVarValues: {}
        };
        return (React.createElement("div", null,
            this.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null,
            this.renderControl(renderControlProps)));
    };
    ControlBlock.prototype.renderInstance = function (props) {
        return React.createElement(ControlInstance, { instanceCtx: props, block: this });
    };
    /** Allow subclasses to clear/update other fields on the column changing */
    ControlBlock.prototype.processColumnChanged = function (blockDef) {
        // Default does nothing
        return blockDef;
    };
    ControlBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId; });
        var handleColumnChanged = function (blockDef) {
            props.store.replaceBlock(_this.processColumnChanged(blockDef));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Context Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] }); })),
            contextVar ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Column" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: handleColumnChanged, property: "column" }, function (value, onChange) {
                        var columnOptions = props.schema.getColumns(contextVar.table)
                            .filter(function (c) { return _this.filterColumn(c); })
                            .map(function (c) { return ({ value: c.id, label: localization_1.localize(c.name) }); });
                        return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "Select column", options: columnOptions });
                    }))
                : null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "required" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Required"); }),
            this.blockDef.required ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Required Message" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "requiredMessage" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))
                : null,
            this.renderControlEditor(props)));
    };
    ControlBlock.prototype.getContextVarExprs = function (contextVar) {
        if (this.blockDef.rowContextVarId && this.blockDef.rowContextVarId === contextVar.id && this.blockDef.column) {
            return [
                { type: "id", table: contextVar.table },
                { type: "field", table: contextVar.table, column: this.blockDef.column },
            ];
        }
        else {
            return [];
        }
    };
    /** Determine if block is valid. null means valid, string is error message. Does not validate children */
    ControlBlock.prototype.validate = function (options) {
        var _this = this;
        // Validate row
        var rowCV = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId && cv.type === "row"; });
        if (!rowCV) {
            return "Row required";
        }
        if (!this.blockDef.column || !options.schema.getColumn(rowCV.table, this.blockDef.column)) {
            return "Column required";
        }
        if (!this.filterColumn(options.schema.getColumn(rowCV.table, this.blockDef.column))) {
            return "Valid column required";
        }
        if (this.blockDef.required && !this.blockDef.requiredMessage) {
            return "Required message required";
        }
        return null;
    };
    return ControlBlock;
}(LeafBlock_1.default));
exports.ControlBlock = ControlBlock;
var ControlInstance = /** @class */ (function (_super) {
    __extends(ControlInstance, _super);
    function ControlInstance(props) {
        var _this = _super.call(this, props) || this;
        /** Validate the instance. Returns null if correct, message if not */
        _this.validate = function () {
            // Check for null
            if (_this.getValue() == null && _this.props.block.blockDef.required) {
                return localization_1.localize(_this.props.block.blockDef.requiredMessage, _this.props.instanceCtx.locale);
            }
            return null;
        };
        _this.handleChange = function (newValue) { return __awaiter(_this, void 0, void 0, function () {
            var instanceCtx, blockDef, contextVar, id, txn, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        instanceCtx = this.props.instanceCtx;
                        blockDef = this.props.block.blockDef;
                        contextVar = instanceCtx.contextVars.find(function (cv) { return cv.id === blockDef.rowContextVarId; });
                        id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
                        // Update database
                        this.setState({ updating: true });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        txn = this.props.instanceCtx.database.transaction();
                        return [4 /*yield*/, txn.updateRow(contextVar.table, id, (_a = {}, _a[blockDef.column] = newValue, _a))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, txn.commit()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _b.sent();
                        // TODO localize
                        alert("Unable to save changes");
                        console.error(err_1.message);
                        return [3 /*break*/, 6];
                    case 5:
                        this.setState({ updating: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        _this.state = {
            updating: false
        };
        return _this;
    }
    ControlInstance.prototype.componentDidMount = function () {
        this.unregisterValidation = this.props.instanceCtx.registerForValidation(this.validate);
    };
    ControlInstance.prototype.componentWillUnmount = function () {
        this.unregisterValidation();
    };
    ControlInstance.prototype.getValue = function () {
        var instanceCtx = this.props.instanceCtx;
        var blockDef = this.props.block.blockDef;
        var contextVar = instanceCtx.contextVars.find(function (cv) { return cv.id === blockDef.rowContextVarId; });
        // Get current value
        return instanceCtx.getContextVarExprValue(blockDef.rowContextVarId, { type: "field", table: contextVar.table, column: blockDef.column });
    };
    ControlInstance.prototype.renderRequired = function () {
        return this.props.block.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null;
    };
    ControlInstance.prototype.render = function () {
        var instanceCtx = this.props.instanceCtx;
        var blockDef = this.props.block.blockDef;
        var contextVar = instanceCtx.contextVars.find(function (cv) { return cv.id === blockDef.rowContextVarId; });
        var id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
        var renderControlProps = {
            value: this.getValue(),
            onChange: this.handleChange,
            schema: this.props.instanceCtx.schema,
            dataSource: this.props.instanceCtx.dataSource,
            database: this.props.instanceCtx.database,
            locale: this.props.instanceCtx.locale,
            rowContextVar: contextVar,
            disabled: id == null,
            contextVars: this.props.instanceCtx.contextVars,
            contextVarValues: this.props.instanceCtx.contextVarValues
        };
        return (React.createElement("div", { style: { opacity: this.state.updating ? 0.6 : undefined } },
            this.renderRequired(),
            this.props.block.renderControl(renderControlProps)));
    };
    return ControlInstance;
}(React.Component));
