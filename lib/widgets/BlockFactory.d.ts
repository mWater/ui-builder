import { BlockDef, Block } from './blocks';
export default class BlockFactory {
    customBlocks: {
        [type: string]: (blockDef: BlockDef) => Block<BlockDef>;
    };
    constructor();
    registerCustomBlock(type: string, factory: (blockDef: BlockDef) => Block<BlockDef>): void;
    createBlock: (blockDef: BlockDef) => Block<BlockDef>;
}
