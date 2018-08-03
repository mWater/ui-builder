import * as uuid from 'uuid/v4'
import { DropSide, dropBlock, Filter, Block, BlockDef } from './Blocks';

export default abstract class LeafBlock extends Block {
  getChildBlockDefs() { return [] }

  async getInitialFilters(): Promise<Filter[]> { return [] }

  clone() { 
    return Object.assign({}, this.blockDef, { id: uuid() }) 
  }

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
