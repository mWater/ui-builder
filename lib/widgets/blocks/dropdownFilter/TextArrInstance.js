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
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importDefault(require("react"));
var localization_1 = require("../../localization");
var async_1 = __importDefault(require("react-select/async"));
/** Dropdown filter that is a text[]. Should search in database for matches, returning value to match */
var TextArrInstance = /** @class */ (function (_super) {
    __extends(TextArrInstance, _super);
    function TextArrInstance() {
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
        _this.handleChange = function (option) {
            var value = option ? (option.value || null) : null; // Blank is null
            _this.props.onChange(value);
        };
        return _this;
    }
    TextArrInstance.prototype.loadOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contextVar, table, whereExprs, cvValue, queryOptions, rows, values, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contextVar = this.props.contextVars.find(function (cv) { return cv.id === _this.props.blockDef.rowsetContextVarId; });
                        table = contextVar.table;
                        whereExprs = [];
                        cvValue = this.props.instanceCtx.contextVarValues[contextVar.id];
                        if (cvValue) {
                            whereExprs.push(cvValue);
                        }
                        // Filter out blanks
                        whereExprs.push({
                            type: "op",
                            op: "is not null",
                            table: table,
                            exprs: [this.props.blockDef.filterExpr]
                        });
                        queryOptions = {
                            select: { value: this.props.blockDef.filterExpr },
                            distinct: true,
                            from: table,
                            where: {
                                type: "op",
                                op: "and",
                                table: table,
                                exprs: whereExprs
                            },
                            limit: 250
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.props.database.query(queryOptions, this.props.contextVars, {})
                            // Flatten and keep distinct
                        ];
                    case 2:
                        rows = _a.sent();
                        values = lodash_1.default.uniq(lodash_1.default.flatten(rows.map(function (r) { return r.value; }))).sort();
                        return [2 /*return*/, values.map(function (v) { return ({ value: v, label: v }); })];
                    case 3:
                        err_1 = _a.sent();
                        // TODO localize
                        alert("Unable to load options");
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TextArrInstance.prototype.render = function () {
        var currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null;
        // Make minimum size to fit text
        var minWidth = Math.min(300, Math.max(this.props.value ? this.props.value.length * 8 + 90 : 0, 150));
        var noOptionsMessage = function () { return "Type to search"; };
        var styles = {
            control: function (style) { return (__assign(__assign({}, style), { minWidth: minWidth })); },
            menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        };
        return react_1.default.createElement(async_1.default, { placeholder: localization_1.localize(this.props.blockDef.placeholder, this.props.locale), value: currentValue, defaultOptions: true, loadOptions: this.getOptions, onChange: this.handleChange, isClearable: true, noOptionsMessage: noOptionsMessage, styles: styles, classNamePrefix: "react-select-short", menuPortalTarget: document.body });
    };
    return TextArrInstance;
}(react_1.default.Component));
exports.default = TextArrInstance;
