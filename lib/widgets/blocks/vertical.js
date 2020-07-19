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
exports.VerticalBlock = void 0;
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var VerticalBlock = /** @class */ (function (_super) {
    __extends(VerticalBlock, _super);
    function VerticalBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(VerticalBlock.prototype, "id", {
        get: function () { return this.blockDef.id; },
        enumerable: false,
        configurable: true
    });
    VerticalBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.items.map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
    };
    VerticalBlock.prototype.validate = function () { return null; };
    VerticalBlock.prototype.processChildren = function (action) {
        // Apply action to all children, discarding null ones
        var newItems = [];
        for (var _i = 0, _a = this.blockDef.items; _i < _a.length; _i++) {
            var item = _a[_i];
            var newItem = action(item);
            if (newItem) {
                newItems.push(newItem);
            }
        }
        return immer_1.default(this.blockDef, function (draft) { draft.items = newItems; });
    };
    VerticalBlock.prototype.canonicalize = function () {
        // Remove if zero items
        if (this.blockDef.items.length === 0) {
            return null;
        }
        // Collapse if one item
        if (this.blockDef.items.length === 1) {
            return this.blockDef.items[0];
        }
        // Flatten out nested vertical blocks
        return immer_1.default(this.blockDef, function (draft) {
            var items = draft.items.map(function (item) { return item.type === "vertical" ? item.items : item; });
            draft.items = items.reduce(function (a, b) { return a.concat(b); }, []);
        });
    };
    VerticalBlock.prototype.renderDesign = function (props) {
        // Add keys
        return (React.createElement("div", { style: { paddingLeft: 5, paddingRight: 5 } }, this.blockDef.items.map(function (childBlockDef, index) { return React.cloneElement(props.renderChildBlock(props, childBlockDef), { key: index }); })));
    };
    VerticalBlock.prototype.renderInstance = function (props) {
        return (React.createElement("div", null, this.blockDef.items.map(function (childBlockDef, index) {
            var childElem = props.renderChildBlock(props, childBlockDef);
            return childElem ? React.cloneElement(childElem, { key: index }) : null;
        })));
    };
    VerticalBlock.prototype.getLabel = function () { return ""; };
    return VerticalBlock;
}(blocks_1.Block));
exports.VerticalBlock = VerticalBlock;
