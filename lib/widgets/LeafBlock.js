import { Block } from './blocks';
// Block which doesn't contain any other blocks
export default class LeafBlock extends Block {
    getChildren() { return []; }
    processChildren(action) { return this.blockDef; }
}
//# sourceMappingURL=LeafBlock.js.map