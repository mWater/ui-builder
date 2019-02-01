"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var blocks_1 = require("./blocks");
/* Block which contains other blocks */
var CompoundBlock = /** @class */ (function (_super) {
    __extends(CompoundBlock, _super);
    function CompoundBlock(blockDef, createBlock) {
        var _this = _super.call(this, blockDef) || this;
        _this.createBlock = createBlock;
        return _this;
    }
    return CompoundBlock;
}(blocks_1.Block));
exports.default = CompoundBlock;
//# sourceMappingURL=CompoundBlock.js.map