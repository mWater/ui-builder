import * as React from 'react';
import * as _ from 'lodash';
import LeafBlock from '../LeafBlock';
import { NullBlockStore, getBlockTree } from '../blocks';
import BlockPlaceholder from '../BlockPlaceholder';
export class WidgetBlock extends LeafBlock {
    constructor(blockDef, createBlock) {
        super(blockDef);
        this.createBlock = createBlock;
    }
    validate(options) {
        if (!this.blockDef.widgetId) {
            return "Widget required";
        }
        // Ensure that all context variables exist
        for (const internalContextVarId of Object.keys(this.blockDef.contextVarMap)) {
            if (!options.contextVars.find(cv => cv.id === this.blockDef.contextVarMap[internalContextVarId])) {
                return "Missing context variable in mapping";
            }
        }
        return null;
    }
    // TODO get initial filters, mapped
    // async getInitialFilters(contextVarId: string): Promise<Filter[]> { 
    //   const widgetDef = this.lookupWidget(this.blockDef.widgetId)
    //   if (widgetDef && widgetDef.blockDef) {
    //     const innerBlock = this.createBlock(widgetDef.blockDef)
    //     // Map contextVarId to internal id
    //     for (const key of Object.keys(this.blockDef.contextVarMap)) {
    //       const value = this.blockDef.contextVarMap[key]
    //       if (value === contextVarId) {
    //         return innerBlock.getInitialFilters(key)
    //       }
    //     }
    //   }
    //   return []
    // }
    getContextVarExprs(contextVar, widgetLibrary, actionLibrary) {
        if (!this.blockDef.widgetId) {
            return [];
        }
        // Get inner widget
        const widgetDef = widgetLibrary.widgets[this.blockDef.widgetId];
        if (!widgetDef.blockDef) {
            return [];
        }
        // Map context variable
        const innerContextVar = widgetDef.contextVars.find(cv => contextVar.id === this.blockDef.contextVarMap[cv.id]);
        if (!innerContextVar) {
            return [];
        }
        // Get complete context variables exprs of inner widget blocks
        const contextVarExprs = _.flatten(getBlockTree(widgetDef.blockDef, this.createBlock, widgetDef.contextVars).map(cb => {
            const block = this.createBlock(cb.blockDef);
            return block.getContextVarExprs(innerContextVar, widgetLibrary, actionLibrary);
        }));
        // Map any variables of expressions that cross widget boundary
        return contextVarExprs;
    }
    renderDesign(props) {
        if (!this.blockDef.widgetId) {
            return React.createElement("div", null);
        }
        // Find the widget
        const widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            const innerBlock = this.createBlock(widgetDef.blockDef);
            // Create props for rendering inner block
            const innerProps = {
                schema: props.schema,
                dataSource: props.dataSource,
                selectedId: null,
                locale: props.locale,
                contextVars: widgetDef.contextVars,
                widgetLibrary: props.widgetLibrary,
                store: new NullBlockStore(),
                renderChildBlock: (childProps, childBlockDef) => {
                    if (childBlockDef) {
                        const childBlock = this.createBlock(childBlockDef);
                        return childBlock.renderDesign(props);
                    }
                    else {
                        return React.createElement(BlockPlaceholder, null);
                    }
                },
            };
            return (React.createElement("div", null,
                innerBlock.renderDesign(innerProps),
                React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } })));
        }
        else { // Handle case of widget with null block
            return React.createElement("div", null);
        }
    }
    renderInstance(props) {
        // Map context var values
        const mappedContextVarValues = {};
        for (const innerContextVarId of Object.keys(this.blockDef.contextVarMap)) {
            const outerContextVarId = this.blockDef.contextVarMap[innerContextVarId];
            if (outerContextVarId) {
                mappedContextVarValues[innerContextVarId] = props.contextVarValues[outerContextVarId];
            }
            else {
                mappedContextVarValues[innerContextVarId] = null;
            }
        }
        // Find the widget
        const widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            const innerBlock = this.createBlock(widgetDef.blockDef);
            const innerProps = Object.assign({}, props, { contextVars: widgetDef.contextVars, contextVarValues: Object.assign({}, props.contextVarValues, mappedContextVarValues), getContextVarExprValue: (contextVarId, expr) => {
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        return props.getContextVarExprValue(outerContextVarId, expr);
                    }
                    else {
                        return;
                    }
                }, onSelectContextVar: (contextVarId, primaryKey) => {
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        props.onSelectContextVar(outerContextVarId, primaryKey);
                    }
                }, setFilter: (contextVarId, filter) => {
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        props.setFilter(outerContextVarId, filter);
                    }
                }, getFilters: (contextVarId) => {
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        return props.getFilters(outerContextVarId);
                    }
                    return [];
                } });
            return innerBlock.renderInstance(innerProps);
        }
        else { // Handle case of widget with null block
            return React.createElement("div", null);
        }
    }
    renderEditor(props) {
        return React.createElement("div", null, "TODO");
    }
}
//# sourceMappingURL=widget.js.map