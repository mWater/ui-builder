"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blocks_1 = require("./blocks");
// Block which doesn't contain any other blocks
class LeafBlock extends blocks_1.Block {
    getChildren() { return []; }
    processChildren(action) { return this.blockDef; }
}
exports.default = LeafBlock;
//# sourceMappingURL=LeafBlock.js.map