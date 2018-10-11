import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { NullBlockStore } from '../blocks';
import BlockPlaceholder from '../BlockPlaceholder';
export class WidgetBlock extends LeafBlock {
    constructor(blockDef, createBlock) {
        super(blockDef);
        this.createBlock = createBlock;
    }
    validate() {
        if (!this.blockDef.widgetId) {
            return "Widget required";
        }
        // TODO!!!
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
    getContextVarExprs(contextVar) {
        // TODO!!
        return [];
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
                    // TODO
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        props.onSelectContextVar(outerContextVarId, primaryKey);
                    }
                }, setFilter: (contextVarId, filter) => {
                    // TODO
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        props.setFilter(outerContextVarId, filter);
                    }
                }, getFilters: (contextVarId) => {
                    // TODO
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