import { Block, BlockDef, CreateBlock, Filter } from './blocks';

/* Block which contains other blocks */
export default abstract class CompoundBlock extends Block {
  createBlock: CreateBlock

  constructor(blockDef: BlockDef, createBlock: CreateBlock) {
    super(blockDef)
    this.createBlock = createBlock;
  }

  async getInitialFilters(contextVarId: string): Promise<Filter[]> {
    let filters = [] as Filter[];
    const block = this.createBlock(this.blockDef)

    for (const item of block.getChildBlockDefs()) {
      const subblock = this.createBlock(item);
      const subfilters = await subblock.getInitialFilters(contextVarId);
      filters = filters.concat(subfilters);
    }
    return filters;
  }
}