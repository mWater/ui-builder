import { Block, BlockDef, BlockFactory, Filter } from './blocks';

/* Block which contains other blocks in an array called items */
export default abstract class CompoundBlock extends Block {
  blockFactory: BlockFactory

  constructor(blockDef: BlockDef, blockFactory: BlockFactory) {
    super(blockDef)
    this.blockFactory = blockFactory;
  }

  async getInitialFilters(contextVarId: string): Promise<Filter[]> {
    let filters = [] as Filter[];
    const block = this.blockFactory(this.blockDef)

    for (const item of block.getChildBlockDefs()) {
      const subblock = this.blockFactory(item);
      const subfilters = await subblock.getInitialFilters(contextVarId);
      filters = filters.concat(subfilters);
    }
    return filters;
  }
}