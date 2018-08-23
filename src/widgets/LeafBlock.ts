import { DropSide, dropBlock, Filter, Block, BlockDef, RenderEditorProps, ContextVar } from './blocks';

// Block which doesn't contain any other blocks
export default abstract class LeafBlock extends Block {
  getChildBlockDefs() { return [] }

  async getInitialFilters(contextVarId: string): Promise<Filter[]> { return [] }

  renderEditor(props: RenderEditorProps): React.ReactElement<any> | null { return null }

  getCreatedContextVars(): ContextVar[] { return [] }

  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef { return this.blockDef }

  getContextVarExprs(contextVarId: string) { return [] }

  addBlock(): BlockDef {
    return this.blockDef
  }
}
