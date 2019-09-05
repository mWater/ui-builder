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
var react_1 = __importDefault(require("react"));
var mwater_expressions_1 = require("mwater-expressions");
var blocks_1 = require("../../blocks");
var localization_1 = require("../../localization");
var Async_1 = __importDefault(require("react-select/lib/Async"));
/** Dropdown filter that is a text string. Should search in database for matches */
var TextInstance = /** @class */ (function (_super) {
    __extends(TextInstance, _super);
    function TextInstance() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getOptions = function (input) { return __awaiter(_this, void 0, void 0, function () {
            var exprUtils, contextVar, table, escapeRegex, queryOptions, rows, values;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr);
                        contextVar = this.props.contextVars.find(function (cv) { return cv.id === _this.props.blockDef.rowsetContextVarId; });
                        table = contextVar.table;
                        escapeRegex = function (s) { return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };
                        queryOptions = {
                            select: { value: this.props.blockDef.filterExpr },
                            distinct: true,
                            from: table,
                            where: {
                                type: "op",
                                op: "~*",
                                table: table,
                                exprs: [
                                    this.props.blockDef.filterExpr,
                                    { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
                                ]
                            },
                            orderBy: [{ expr: this.props.blockDef.filterExpr, dir: "asc" }],
                            limit: 250
                        };
                        return [4 /*yield*/, this.props.database.query(queryOptions, this.props.contextVars, {})
                            // Filter null and blank
                        ];
                    case 1:
                        rows = _a.sent();
                        values = rows.map(function (r) { return r.value; }).filter(function (v) { return v; });
                        return [2 /*return*/, values.map(function (v) { return ({ value: v, label: v }); })];
                }
            });
        }); };
        _this.handleChange = function (option) {
            var value = option ? (option.value || null) : null; // Blank is null
            _this.props.onChange(value);
        };
        return _this;
    }
    TextInstance.prototype.render = function () {
        var currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null;
        var noOptionsMessage = function () { return "Type to search"; };
        var styles = {
            control: function (base) { return (__assign(__assign({}, base), { height: 34, minHeight: 34, minWidth: 150 })); },
            // Keep menu above other controls
            menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        };
        // TODO key: JSON.stringify(@props.filters)  # Include to force a change when filters change
        return react_1.default.createElement(Async_1.default, { placeholder: localization_1.localize(this.props.blockDef.placeholder, this.props.locale), value: currentValue, defaultOptions: true, cacheOptions: null, loadOptions: this.getOptions, onChange: this.handleChange, isClearable: true, noOptionsMessage: noOptionsMessage, styles: styles });
        // styles: { 
        //   # Keep menu above fixed data table headers
        //   menu: (style) => _.extend({}, style, zIndex: 2)
        // }
    };
    return TextInstance;
}(react_1.default.Component));
exports.default = TextInstance;
