import { Block, BlockDef } from './blocks';
export default abstract class LeafBlock<T extends BlockDef> extends Block<T> {
    getChildren(): never[];
    processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef;
}
