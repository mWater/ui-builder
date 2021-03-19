"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWidget = void 0;
var contextVarValues_1 = require("../contextVarValues");
var blocks_1 = require("./blocks");
/** Validate a widget, optionally also validating all children */
function validateWidget(widgetDef, ctx, includeChildren) {
    if (!widgetDef.blockDef) {
        return null;
    }
    var globalContextVars = ctx.globalContextVars || [];
    // Validate context var values
    for (var _i = 0, _a = widgetDef.contextVars; _i < _a.length; _i++) {
        var cv = _a[_i];
        var error = contextVarValues_1.validateContextVarValue(ctx.schema, cv, globalContextVars.concat(widgetDef.contextVars), widgetDef.contextVarPreviewValues[cv.id]);
        if (error) {
            return error;
        }
    }
    // Validate private context var values
    var privateContextVars = widgetDef.privateContextVars || [];
    for (var _b = 0, privateContextVars_1 = privateContextVars; _b < privateContextVars_1.length; _b++) {
        var cv = privateContextVars_1[_b];
        var error = contextVarValues_1.validateContextVarValue(ctx.schema, cv, globalContextVars.concat(widgetDef.contextVars.concat(privateContextVars)), (widgetDef.privateContextVarValues || {})[cv.id]);
        if (error) {
            return error;
        }
    }
    if (includeChildren) {
        var contextVars = globalContextVars.concat(widgetDef.contextVars).concat(privateContextVars);
        for (var _c = 0, _d = blocks_1.getBlockTree(widgetDef.blockDef, ctx.createBlock, contextVars); _c < _d.length; _c++) {
            var childBlock = _d[_c];
            var block = ctx.createBlock(childBlock.blockDef);
            // Create design context for validating block
            var blockDesignCtx = __assign(__assign({}, ctx), { dataSource: ctx.dataSource, contextVars: childBlock.contextVars, store: new blocks_1.NullBlockStore(), blockPaletteEntries: [], selectedId: null, renderChildBlock: function () { throw new Error("Not implemented"); } });
            var error = block.validate(blockDesignCtx);
            if (error) {
                return error;
            }
        }
    }
    return null;
}
exports.validateWidget = validateWidget;
