"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blocks_1 = require("./blocks");
/* Block which contains other blocks */
class CompoundBlock extends blocks_1.Block {
    constructor(blockDef, createBlock) {
        super(blockDef);
        this.createBlock = createBlock;
    }
}
exports.default = CompoundBlock;
//# sourceMappingURL=CompoundBlock.js.map