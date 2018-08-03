import { Block, BlockDef, BlockFactory, Filter } from './blocks';

/* Block which contains other blocks */
export default abstract class CompoundBlock extends Block {
  blockFactory: BlockFactory

  constructor(blockDef: BlockDef, blockFactory: BlockFactory) {
    super(blockDef)
    this.blockFactory = blockFactory;
  }

  async getInitialFilters(contextVarId: string): Promise<Filter[]> {
    let filters = [] as Filter[];
    for (const item of this.blockDef.items) {
      const block = this.blockFactory(item);
      const subfilters = await block.getInitialFilters(contextVarId);
      filters = filters.concat(subfilters);
    }
    return filters;
  }
}