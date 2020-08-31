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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var blocks_1 = require("../../blocks");
var immer_1 = __importDefault(require("immer"));
var TOCDesignComp_1 = __importDefault(require("./TOCDesignComp"));
var TOCInstanceComp_1 = __importDefault(require("./TOCInstanceComp"));
require("./toc.css");
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Create a flat list of all items */
exports.iterateItems = function (items) {
    var flatItems = [];
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        flatItems.push(item);
        flatItems = flatItems.concat(exports.iterateItems(item.children));
    }
    return flatItems;
};
/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
exports.alterItems = function (items, action) {
    var newItems = _.flatten(_.compact(items.map(function (item) { return action(item); })));
    for (var _i = 0, newItems_1 = newItems; _i < newItems_1.length; _i++) {
        var ni = newItems_1[_i];
        ni.children = exports.alterItems(ni.children, action);
    }
    return newItems;
};
var TOCBlock = /** @class */ (function (_super) {
    __extends(TOCBlock, _super);
    function TOCBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Get child blocks */
    TOCBlock.prototype.getChildren = function (contextVars) {
        // Iterate all 
        return _.compact([this.blockDef.header, this.blockDef.footer])
            .map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
    };
    TOCBlock.prototype.validate = function (designCtx) {
        var validateItem = function (tocItem) {
            if (!tocItem.widgetId) {
                return null;
            }
            // Check that widget exists
            var widget = designCtx.widgetLibrary.widgets[tocItem.widgetId];
            if (!widget) {
                return "Widget does not exist";
            }
            var _loop_1 = function (innerContextVar) {
                // If mapped, check that outer context var exists
                if (tocItem.contextVarMap && tocItem.contextVarMap[innerContextVar.id]) {
                    var outerContextVarId_1 = tocItem.contextVarMap[innerContextVar.id];
                    if (!designCtx.contextVars.find(function (cv) { return cv.id == outerContextVarId_1; })) {
                        return { value: "Context variable not found. Please check mapping" };
                    }
                }
            };
            // For each inner context variable
            for (var _i = 0, _a = widget.contextVars; _i < _a.length; _i++) {
                var innerContextVar = _a[_i];
                var state_1 = _loop_1(innerContextVar);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return null;
        };
        // Validate all items
        for (var _i = 0, _a = exports.iterateItems(this.blockDef.items); _i < _a.length; _i++) {
            var tocItem = _a[_i];
            var error = validateItem(tocItem);
            if (error) {
                return error;
            }
        }
        return null;
    };
    TOCBlock.prototype.processChildren = function (action) {
        var _this = this;
        // For header and footer
        return immer_1.default(this.blockDef, function (draft) {
            draft.header = action(_this.blockDef.header);
            draft.footer = action(_this.blockDef.footer);
        });
    };
    TOCBlock.prototype.renderDesign = function (props) {
        return React.createElement(TOCDesignComp_1.default, { renderProps: props, blockDef: this.blockDef });
    };
    TOCBlock.prototype.renderInstance = function (props) {
        return React.createElement(TOCInstanceComp_1.default, { instanceCtx: props, blockDef: this.blockDef, createBlock: props.createBlock });
    };
    TOCBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "removePadding" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Remove Padding (for top-level TOCs)"); })));
    };
    return TOCBlock;
}(blocks_1.Block));
exports.TOCBlock = TOCBlock;
