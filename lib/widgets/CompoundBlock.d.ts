import { Block, BlockDef, CreateBlock } from './blocks';
export default abstract class CompoundBlock<T extends BlockDef> extends Block<T> {
    createBlock: CreateBlock;
    constructor(blockDef: T, createBlock: CreateBlock);
}
