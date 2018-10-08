import { v4 as uuid } from 'uuid';
import "./blocks.css";
/** Side on which another block is dropped on a block */
export var DropSide;
(function (DropSide) {
    DropSide["top"] = "Top";
    DropSide["bottom"] = "Bottom";
    DropSide["left"] = "Left";
    DropSide["right"] = "Right";
})(DropSide || (DropSide = {}));
/** Store which throws on any operation */
export class NullBlockStore {
    alterBlock(blockId, action) {
        throw new Error("Not allowed");
    }
}
export class Block {
    constructor(blockDef) {
        this.blockDef = blockDef;
    }
    get id() { return this.blockDef.id; }
    /** Render an optional property editor for the block. This may use bootstrap */
    renderEditor(props) { return null; }
    /** Get any context variables expressions that this block needs (not including child blocks) */
    getContextVarExprs(contextVar) { return []; }
    /**
     * Processes entire tree, starting at bottom. Allows
     * easy mutation of the tree
     */
    process(createBlock, action) {
        const blockDef = this.processChildren((childBlockDef) => {
            // Recursively process, starting at bottom
            if (childBlockDef !== null) {
                return createBlock(childBlockDef).process(createBlock, action);
            }
            else {
                return null;
            }
        });
        return action(blockDef);
    }
    /** Get initial filters generated by this block. Does not include child blocks */
    getInitialFilters(contextVarId) { return []; }
    /** Canonicalize the block definition. Should be done after operations on the block are completed. Only alter self, not children */
    canonicalize() {
        return this.blockDef;
    }
}
// Handles logic of a simple dropping of a block on another
export function dropBlock(droppedBlockDef, targetBlockDef, dropSide) {
    if (dropSide === DropSide.left) {
        return {
            id: uuid(),
            items: [droppedBlockDef, targetBlockDef],
            type: "horizontal",
            align: "justify"
        };
    }
    if (dropSide === DropSide.right) {
        return {
            id: uuid(),
            items: [targetBlockDef, droppedBlockDef],
            type: "horizontal",
            align: "justify"
        };
    }
    if (dropSide === DropSide.top) {
        return {
            id: uuid(),
            items: [droppedBlockDef, targetBlockDef],
            type: "vertical"
        };
    }
    if (dropSide === DropSide.bottom) {
        return {
            id: uuid(),
            items: [targetBlockDef, droppedBlockDef],
            type: "vertical"
        };
    }
    throw new Error("Unknown side");
}
/**
 * Find the entire ancestry (root first) of a block with the specified id
 *
 * @param rootBlockDef root block to search in
 * @param createBlock
 * @param blockId block to find
 * @returns array of child blocks, each with information about which context variables were injected by their parent
 */
export function findBlockAncestry(rootBlockDef, createBlock, contextVars, blockId) {
    const rootBlock = createBlock(rootBlockDef);
    // Return self if true
    if (rootBlock.id === blockId) {
        return [{ blockDef: rootBlockDef, contextVars: contextVars }];
    }
    // For each child
    for (const childBlock of rootBlock.getChildren(contextVars)) {
        if (childBlock.blockDef) {
            const childAncestry = findBlockAncestry(childBlock.blockDef, createBlock, childBlock.contextVars, blockId);
            if (childAncestry) {
                return [{ blockDef: rootBlockDef, contextVars: contextVars }].concat(childAncestry);
            }
        }
    }
    return null;
}
/** Get the entire tree of blocks from a root, including context variables for each */
export function getBlockTree(rootBlockDef, createBlock, contextVars) {
    const rootChildBlock = { blockDef: rootBlockDef, contextVars: contextVars };
    // Create list including children
    let list = [rootChildBlock];
    // For each child
    for (const childBlock of createBlock(rootBlockDef).getChildren(contextVars)) {
        if (childBlock.blockDef) {
            const childTree = getBlockTree(childBlock.blockDef, createBlock, childBlock.contextVars);
            list = list.concat(childTree);
        }
    }
    return list;
}
//# sourceMappingURL=blocks.js.map