import { Block, BlockDef, CreateBlock, Filter } from './blocks';

/* Block which contains other blocks */
export default abstract class CompoundBlock<T extends BlockDef> extends Block<T> {
  createBlock: CreateBlock

  constructor(blockDef: T, createBlock: CreateBlock) {
    super(blockDef)
    this.createBlock = createBlock;
  }
}