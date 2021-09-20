"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOCBlock = exports.alterItems = exports.iterateItems = void 0;
const React = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const blocks_1 = require("../../blocks");
const immer_1 = require("immer");
const TOCDesignComp_1 = __importDefault(require("./TOCDesignComp"));
const TOCInstanceComp_1 = __importDefault(require("./TOCInstanceComp"));
require("./toc.css");
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const uuid_1 = __importDefault(require("uuid"));
const embeddedExprs_1 = require("../../../embeddedExprs");
/** Create a flat list of all items */
const iterateItems = (items) => {
    var flatItems = [];
    for (const item of items) {
        flatItems.push(item);
        flatItems = flatItems.concat((0, exports.iterateItems)(item.children));
    }
    return flatItems;
};
exports.iterateItems = iterateItems;
/** Alter each item, allowing item to be mutated, replaced (return item or array of items) or deleted (return null) */
const alterItems = (items, action) => {
    const newItems = _.flatten(_.compact(items.map(item => action(item))));
    return (0, immer_1.produce)(newItems, draft => {
        for (const ni of draft) {
            ni.children = (0, exports.alterItems)((0, immer_1.original)(ni.children), action);
        }
    });
};
exports.alterItems = alterItems;
class TOCBlock extends blocks_1.Block {
    /** Get child blocks */
    getChildren(contextVars) {
        // Iterate all 
        return _.compact([this.blockDef.header, this.blockDef.footer].concat((0, exports.iterateItems)(this.blockDef.items).map(item => item.labelBlock || null)))
            .map(bd => ({ blockDef: bd, contextVars: contextVars }));
    }
    /** Get any context variables expressions that this block needs (not including child blocks) */
    getContextVarExprs(contextVar, ctx) {
        const exprs = [];
        for (const item of (0, exports.iterateItems)(this.blockDef.items)) {
            // Add conditions
            if (item.condition && item.condition.contextVarId == contextVar.id) {
                exprs.push(item.condition.expr);
            }
            if (item.titleEmbeddedExprs) {
                for (const titleEmbeddedExpr of item.titleEmbeddedExprs) {
                    if (titleEmbeddedExpr.contextVarId == contextVar.id) {
                        exprs.push(titleEmbeddedExpr.expr);
                    }
                }
            }
        }
        return _.compact(exprs);
    }
    /** Validate a single TOC item */
    validateItem(designCtx, tocItem) {
        if (tocItem.widgetId) {
            // Check that widget exists
            const widget = designCtx.widgetLibrary.widgets[tocItem.widgetId];
            if (!widget) {
                return "Widget does not exist";
            }
            // For each inner context variable
            for (const innerContextVar of widget.contextVars) {
                // If mapped, check that outer context var exists
                if (tocItem.contextVarMap && tocItem.contextVarMap[innerContextVar.id]) {
                    const outerContextVarId = tocItem.contextVarMap[innerContextVar.id];
                    if (!designCtx.contextVars.find(cv => cv.id == outerContextVarId)) {
                        return "Context variable not found. Please check mapping";
                    }
                }
            }
        }
        // Validate condition
        if (tocItem.condition) {
            const error = (0, blocks_1.validateContextVarExpr)({
                contextVars: designCtx.contextVars,
                schema: designCtx.schema,
                contextVarId: tocItem.condition.contextVarId,
                expr: tocItem.condition.expr,
                aggrStatuses: ["individual", "literal"],
                types: ["boolean"]
            });
            if (error) {
                return `Error in condition: ${error}`;
            }
        }
        // Validate expressions
        if (tocItem.titleEmbeddedExprs) {
            const error = (0, embeddedExprs_1.validateEmbeddedExprs)({
                embeddedExprs: tocItem.titleEmbeddedExprs,
                schema: designCtx.schema,
                contextVars: designCtx.contextVars
            });
            if (error) {
                return error;
            }
        }
        return null;
    }
    validate(designCtx) {
        // Validate all items
        for (const tocItem of (0, exports.iterateItems)(this.blockDef.items)) {
            const error = this.validateItem(designCtx, tocItem);
            if (error) {
                return error;
            }
        }
        return null;
    }
    processChildren(action) {
        return (0, immer_1.produce)(this.blockDef, (draft) => {
            // For header and footer
            draft.header = action(this.blockDef.header);
            draft.footer = action(this.blockDef.footer);
            // For all other blocks
            for (const item of (0, exports.iterateItems)(draft.items)) {
                item.labelBlock = action((0, immer_1.original)(item.labelBlock) || null);
            }
        });
    }
    /** Canonicalize the block definition. Should be done after operations on the block are completed. Only alter self, not children.
     * Can also be used to upgrade blocks
     */
    canonicalize() {
        // Upgrade any labels to labelBlocks
        return (0, immer_1.produce)(this.blockDef, draft => {
            for (const item of (0, exports.iterateItems)(draft.items)) {
                if (item.label && !item.labelBlock) {
                    item.labelBlock = { type: "text", text: item.label, id: uuid_1.default.v4() };
                    delete item.label;
                }
            }
        });
    }
    renderDesign(props) {
        return React.createElement(TOCDesignComp_1.default, { renderProps: props, blockDef: this.blockDef });
    }
    renderInstance(props) {
        return React.createElement(TOCInstanceComp_1.default, { instanceCtx: props, blockDef: this.blockDef, createBlock: props.createBlock });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Theme" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "theme" }, (value, onChange) => (React.createElement(bootstrap_1.Toggle, { value: value || "light", onChange: onChange, options: [
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" }
                    ] })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Collapse Below Width" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "collapseWidth" }, (value, onChange) => React.createElement(propertyEditors_1.ResponsiveWidthSelector, { value: value, onChange: onChange })))));
    }
}
exports.TOCBlock = TOCBlock;
