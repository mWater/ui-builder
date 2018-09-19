import { DropSide, dropBlock, Filter, Block, BlockDef, RenderEditorProps, ContextVar } from './blocks';

// Block which doesn't contain any other blocks
export default abstract class LeafBlock<T extends BlockDef> extends Block<T> {
  getChildren() { return [] }

  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef { return this.blockDef }
}
