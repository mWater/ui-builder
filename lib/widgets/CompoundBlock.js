import { Block } from './blocks';
/* Block which contains other blocks */
export default class CompoundBlock extends Block {
    constructor(blockDef, createBlock) {
        super(blockDef);
        this.createBlock = createBlock;
    }
}
//# sourceMappingURL=CompoundBlock.js.map