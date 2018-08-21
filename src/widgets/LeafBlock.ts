import * as uuid from 'uuid/v4'
import { DropSide, dropBlock, Filter, Block, BlockDef, RenderEditorProps } from './blocks';

// Block which doesn't contain any other blocks
export default abstract class LeafBlock extends Block {
  getChildBlockDefs() { return [] }

  async getInitialFilters(contextVarId: string): Promise<Filter[]> { return [] }

  clone() { 
    return Object.assign({}, this.blockDef, { id: uuid() }) 
  }

  renderEditor(props: RenderEditorProps) { return null }

  getContextVarExprs(contextVarId: string) { return [] }

  canonicalize() { return this.blockDef }

  addBlock(): BlockDef {
    throw new Error("Cannot add to leaf block")
  }

  replaceBlock(blockId: string, replacementBlockDef: BlockDef | null) {
    return (blockId === this.id) ? replacementBlockDef : this.blockDef
  }

  dropBlock(droppedBlockDef: BlockDef, targetBlockId: string, dropSide: DropSide): BlockDef {
    if (targetBlockId === this.id) {
      return dropBlock(droppedBlockDef, this.blockDef, dropSide)
    }
    return this.blockDef
  }
}
