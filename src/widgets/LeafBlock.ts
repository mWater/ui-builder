import { Block, BlockDef } from './blocks';

// Block which doesn't contain any other blocks
export default abstract class LeafBlock<T extends BlockDef> extends Block<T> {
  getChildren() { return [] }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef { return this.blockDef }
}
