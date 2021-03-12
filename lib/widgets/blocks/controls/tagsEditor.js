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
exports.TagsEditorBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importDefault(require("react"));
var ControlBlock_1 = require("./ControlBlock");
var async_creatable_1 = __importDefault(require("react-select/async-creatable"));
var react_select_1 = __importDefault(require("react-select"));
/** Block which shows a dropdown control to select existing or create new tags */
var TagsEditorBlock = /** @class */ (function (_super) {
    __extends(TagsEditorBlock, _super);
    function TagsEditorBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TagsEditorBlock.prototype.renderControl = function (props) {
        var styles = {
            control: function (base) { return (__assign(__assign({}, base), { minWidth: 150 })); },
            // Keep menu above other controls
            menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        };
        // If can't be displayed properly
        var defaultControl = react_1.default.createElement("div", { style: { padding: 5 } },
            react_1.default.createElement(react_select_1.default, { classNamePrefix: "react-select-short", styles: styles, menuPortalTarget: document.body }));
        // If can't be rendered due to missing context variable, just show error
        if (!props.rowContextVar || !this.blockDef.column) {
            return defaultControl;
        }
        // Get column
        var column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        if (!column) {
            return defaultControl;
        }
        return react_1.default.createElement(TagEditorInstance, { table: props.rowContextVar.table, disabled: props.disabled, column: column.id, database: props.database, value: props.value, onChange: props.onChange });
    };
    /** Filter the columns that this control is for. Must be text[] */
    TagsEditorBlock.prototype.filterColumn = function (column) {
        return (!column.expr && column.type == "text[]");
    };
    return TagsEditorBlock;
}(ControlBlock_1.ControlBlock));
exports.TagsEditorBlock = TagsEditorBlock;
/** Allows editing of a series of tags, allowing selecting existing or creating new */
var TagEditorInstance = /** @class */ (function (_super) {
    __extends(TagEditorInstance, _super);
    function TagEditorInstance() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getOptions = function (input) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.options) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.loadOptions()];
                    case 1:
                        _a.options = _b.sent();
                        _b.label = 2;
                    case 2:
                        // Filter by input string
                        if (input) {
                            return [2 /*return*/, this.options.filter(function (o) { return o.label.toLowerCase().startsWith(input.toLowerCase()); })];
                        }
                        else {
                            return [2 /*return*/, this.options];
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        _this.handleChange = function (value) {
            if (value) {
                _this.props.onChange(value.map(function (v) { return v.value; }));
            }
            else {
                _this.props.onChange(null);
            }
        };
        return _this;
    }
    TagEditorInstance.prototype.loadOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, table, column, queryOptions, rows, values, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.props, table = _a.table, column = _a.column;
                        queryOptions = {
                            select: { value: { type: "field", table: table, column: column } },
                            distinct: true,
                            from: table,
                            where: {
                                type: "op",
                                op: "is not null",
                                table: table,
                                exprs: [{ type: "field", table: table, column: column }]
                            },
                            limit: 250
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.props.database.query(queryOptions, [], {})
                            // Flatten and keep distinct
                        ];
                    case 2:
                        rows = _b.sent();
                        values = lodash_1.default.uniq(lodash_1.default.flatten(rows.map(function (r) { return r.value; }))).sort();
                        return [2 /*return*/, values.map(function (v) { return ({ value: v, label: v }); })];
                    case 3:
                        err_1 = _b.sent();
                        // TODO localize
                        alert("Unable to load options");
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TagEditorInstance.prototype.render = function () {
        var styles = {
            control: function (style) { return (__assign({}, style)); },
            menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        };
        return react_1.default.createElement(async_creatable_1.default, { cacheOptions: true, defaultOptions: true, loadOptions: this.getOptions, styles: styles, value: this.props.value ? this.props.value.map(function (v) { return ({ value: v, label: v }); }) : null, classNamePrefix: "react-select-short", menuPortalTarget: document.body, isMulti: true, onChange: this.handleChange, isDisabled: this.props.disabled });
    };
    return TagEditorInstance;
}(react_1.default.Component));
