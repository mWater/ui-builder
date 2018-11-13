import * as React from 'react';
import * as _ from 'lodash';
import LeafBlock from '../LeafBlock';
import { NullBlockStore, getBlockTree } from '../blocks';
import BlockPlaceholder from '../BlockPlaceholder';
import { LabeledProperty, ContextVarPropertyEditor } from '../propertyEditors';
import { Select } from 'react-library/lib/bootstrap';
import produce from 'immer';
export class WidgetBlock extends LeafBlock {
    constructor(blockDef, createBlock) {
        super(blockDef);
        this.createBlock = createBlock;
    }
    validate(options) {
        if (!this.blockDef.widgetId) {
            return "Widget required";
        }
        // Ensure that widget exists 
        const widget = options.widgetLibrary.widgets[this.blockDef.widgetId];
        if (!widget) {
            return "Invalid widget";
        }
        // Ensure that all context variables exist
        for (const internalContextVarId of Object.keys(this.blockDef.contextVarMap)) {
            if (!options.contextVars.find(cv => cv.id === this.blockDef.contextVarMap[internalContextVarId])) {
                return "Missing context variable in mapping";
            }
        }
        return null;
    }
    getInitialFilters(contextVarId, widgetLibrary) {
        const widgetDef = widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            const innerBlock = this.createBlock(widgetDef.blockDef);
            // Map contextVarId to internal id
            for (const key of Object.keys(this.blockDef.contextVarMap)) {
                const value = this.blockDef.contextVarMap[key];
                if (value === contextVarId) {
                    return innerBlock.getInitialFilters(key, widgetLibrary);
                }
            }
        }
        return [];
    }
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
        let contextVarExprs = _.flatten(getBlockTree(widgetDef.blockDef, this.createBlock, widgetDef.contextVars).map(cb => {
            const block = this.createBlock(cb.blockDef);
            return block.getContextVarExprs(innerContextVar, widgetLibrary, actionLibrary);
        }));
        // Map any variables of expressions that cross widget boundary
        contextVarExprs = contextVarExprs.map((cve) => this.mapInnerToOuterVariables(cve));
        return contextVarExprs;
    }
    /** Maps variables in an expression from inner variable names to outer ones */
    mapInnerToOuterVariables(expr) {
        return mapObjectTree(expr, (e) => {
            if (e.type === "variable") {
                // Change inner id to outer id
                if (this.blockDef.contextVarMap[e.variableId]) {
                    return Object.assign({}, e, { variableId: this.blockDef.contextVarMap[e.variableId] });
                }
                else {
                    return e;
                }
            }
            else {
                return e;
            }
        });
    }
    renderDesign(props) {
        if (!this.blockDef.widgetId) {
            return React.createElement("div", { style: { fontStyle: "italic" } }, "Select widget...");
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
                        return childBlock.renderDesign(childProps);
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
                        // Map variable from inner to outer
                        return props.getContextVarExprValue(outerContextVarId, this.mapInnerToOuterVariables(expr));
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
        // Create widget options 
        const widgetOptions = _.sortBy(Object.values(props.widgetLibrary.widgets).map(w => ({ label: w.name, value: w.id })), "name");
        const handleWidgetIdChange = (widgetId) => {
            props.onChange(Object.assign({}, this.blockDef, { widgetId: widgetId, contextVarMap: {} }));
        };
        const renderContextVarValues = () => {
            if (!this.blockDef.widgetId) {
                return null;
            }
            // Find the widget
            const widgetDef = props.widgetLibrary.widgets[this.blockDef.widgetId];
            if (!widgetDef) {
                return null;
            }
            return (React.createElement("table", { className: "table table-bordered table-condensed" },
                React.createElement("tbody", null, widgetDef.contextVars.map(contextVar => {
                    const cv = this.blockDef.contextVarMap[contextVar.id];
                    const handleCVChange = (contextVarId) => {
                        props.onChange(produce(this.blockDef, (draft) => {
                            draft.contextVarMap[contextVar.id] = contextVarId;
                        }));
                    };
                    return (React.createElement("tr", { key: contextVar.id },
                        React.createElement("td", null, contextVar.name),
                        React.createElement("td", null,
                            React.createElement(ContextVarPropertyEditor, { contextVars: props.contextVars, types: [contextVar.type], table: contextVar.table, value: cv, onChange: handleCVChange }))));
                }))));
        };
        return React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Widget" },
                React.createElement(Select, { value: this.blockDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            renderContextVarValues());
    }
}
// Run a possibly deep object through a mapping function. Automatically maps all values of objects and arrays recursively
export const mapObjectTree = (obj, mapping) => {
    // If array, map items
    if (_.isArray(obj)) {
        return obj.map((elem) => mapObjectTree(elem, mapping));
    }
    if (_.isObject(obj)) {
        // First map object itself
        const res = mapping(obj);
        // Then map values
        return _.mapValues(res, (value) => mapObjectTree(value, mapping));
    }
    return obj;
};
//# sourceMappingURL=widget.js.map