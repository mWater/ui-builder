import { BlockDef, Block } from './blocks';
export default class BlockFactory {
    createBlock: (blockDef: BlockDef) => Block<BlockDef>;
}
