"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWidget = void 0;
const contextVarValues_1 = require("../contextVarValues");
const blocks_1 = require("./blocks");
/** Validate a widget, optionally also validating all children */
function validateWidget(widgetDef, ctx, includeChildren) {
    if (!widgetDef.blockDef) {
        return null;
    }
    const globalContextVars = ctx.globalContextVars || [];
    // Validate context var values
    for (const cv of widgetDef.contextVars) {
        const error = (0, contextVarValues_1.validateContextVarValue)(ctx.schema, cv, globalContextVars.concat(widgetDef.contextVars), widgetDef.contextVarPreviewValues[cv.id]);
        if (error) {
            return error;
        }
    }
    // Validate private context var values
    const privateContextVars = widgetDef.privateContextVars || [];
    for (const cv of privateContextVars) {
        const error = (0, contextVarValues_1.validateContextVarValue)(ctx.schema, cv, globalContextVars.concat(widgetDef.contextVars.concat(privateContextVars)), (widgetDef.privateContextVarValues || {})[cv.id]);
        if (error) {
            return error;
        }
    }
    if (includeChildren) {
        const contextVars = globalContextVars.concat(widgetDef.contextVars).concat(privateContextVars);
        for (const childBlock of (0, blocks_1.getBlockTree)(widgetDef.blockDef, ctx.createBlock, contextVars)) {
            const block = ctx.createBlock(childBlock.blockDef);
            // Create design context for validating block
            const blockDesignCtx = Object.assign(Object.assign({}, ctx), { dataSource: ctx.dataSource, contextVars: childBlock.contextVars, store: new blocks_1.NullBlockStore(), blockPaletteEntries: [], selectedId: null, renderChildBlock: () => { throw new Error("Not implemented"); } });
            const error = block.validate(blockDesignCtx);
            if (error) {
                return error;
            }
        }
    }
    return null;
}
exports.validateWidget = validateWidget;
