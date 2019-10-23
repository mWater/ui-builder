import { Block, BlockDef } from './blocks';

/* Block which contains other blocks */
export default abstract class CompoundBlock<T extends BlockDef> extends Block<T> {
}