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
Object.defineProperty(exports, "__esModule", { value: true });
var blocks_1 = require("./blocks");
// Block which doesn't contain any other blocks
var LeafBlock = /** @class */ (function (_super) {
    __extends(LeafBlock, _super);
    function LeafBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LeafBlock.prototype.getChildren = function () { return []; };
    LeafBlock.prototype.processChildren = function (action) { return this.blockDef; };
    return LeafBlock;
}(blocks_1.Block));
exports.default = LeafBlock;
