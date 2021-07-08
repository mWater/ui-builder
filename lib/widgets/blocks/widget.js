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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapObjectTree = exports.WidgetBlock = void 0;
const React = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const blocks_1 = require("../blocks");
const BlockPlaceholder_1 = __importDefault(require("../BlockPlaceholder"));
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const immer_1 = __importDefault(require("immer"));
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
class WidgetBlock extends LeafBlock_1.default {
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
    getInitialFilters(contextVarId, instanceCtx) {
        const widgetDef = instanceCtx.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            const innerBlock = instanceCtx.createBlock(widgetDef.blockDef);
            // Map contextVarId to internal id
            for (const key of Object.keys(this.blockDef.contextVarMap)) {
                const value = this.blockDef.contextVarMap[key];
                if (value === contextVarId) {
                    return innerBlock.getInitialFilters(key, instanceCtx);
                }
            }
        }
        return [];
    }
    getContextVarExprs(contextVar, ctx) {
        if (!this.blockDef.widgetId) {
            return [];
        }
        // Get inner widget
        const widgetDef = ctx.widgetLibrary.widgets[this.blockDef.widgetId];
        if (!widgetDef.blockDef) {
            return [];
        }
        // Map context variable
        let innerContextVar = widgetDef.contextVars.find(cv => contextVar.id === this.blockDef.contextVarMap[cv.id]);
        if (!innerContextVar) {
            // Check if global variable
            if ((ctx.globalContextVars || []).find(cv => cv.id == contextVar.id)) {
                // Pass it straight through
                innerContextVar = contextVar;
            }
            else {
                return [];
            }
        }
        // Get complete context variables exprs of inner widget blocks
        let contextVarExprs = ctx.createBlock(widgetDef.blockDef).getSubtreeContextVarExprs(innerContextVar, {
            ...ctx, contextVars: widgetDef.contextVars,
        });
        // Map any variables of expressions that cross widget boundary
        contextVarExprs = contextVarExprs.map((cve) => this.mapInnerToOuterVariables(cve));
        return contextVarExprs;
    }
    /** Maps variables in an expression from inner variable names to outer ones */
    mapInnerToOuterVariables(expr) {
        return exports.mapObjectTree(expr, (e) => {
            if (e.type === "variable") {
                // Change inner id to outer id
                if (this.blockDef.contextVarMap[e.variableId]) {
                    return { ...e, variableId: this.blockDef.contextVarMap[e.variableId] };
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
    /** Maps variables in an expression from outer variable names to inner ones */
    mapOuterToInnerVariables(expr) {
        return exports.mapObjectTree(expr, (e) => {
            if (e.type === "variable") {
                // Change outer id to inner id
                for (const key in this.blockDef.contextVarMap) {
                    if (this.blockDef.contextVarMap[key] == e.variableId) {
                        return { ...e, variableId: key };
                    }
                }
                return e;
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
            const innerBlock = props.createBlock(widgetDef.blockDef);
            const innerContextVars = (props.globalContextVars || [])
                .concat(widgetDef.contextVars)
                .concat(widgetDef.privateContextVars || []);
            // Create props for rendering inner block
            const innerProps = {
                ...props,
                selectedId: null,
                contextVars: innerContextVars,
                store: new blocks_1.NullBlockStore(),
                blockPaletteEntries: [],
                renderChildBlock: (childProps, childBlockDef) => {
                    if (childBlockDef) {
                        const childBlock = props.createBlock(childBlockDef);
                        return childBlock.renderDesign(childProps);
                    }
                    else {
                        return React.createElement(BlockPlaceholder_1.default, null);
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
    renderInstance(instanceCtx) {
        // Map context var values
        const mappedContextVarValues = {};
        for (const innerContextVarId of Object.keys(this.blockDef.contextVarMap)) {
            const outerContextVarId = this.blockDef.contextVarMap[innerContextVarId];
            if (outerContextVarId) {
                mappedContextVarValues[innerContextVarId] = instanceCtx.contextVarValues[outerContextVarId];
            }
            else {
                mappedContextVarValues[innerContextVarId] = null;
            }
        }
        // Include global context variables
        for (const globalContextVar of instanceCtx.globalContextVars || []) {
            mappedContextVarValues[globalContextVar.id] = instanceCtx.contextVarValues[globalContextVar.id];
        }
        // Find the widget
        const widgetDef = instanceCtx.widgetLibrary.widgets[this.blockDef.widgetId];
        if (widgetDef && widgetDef.blockDef) {
            const innerBlock = instanceCtx.createBlock(widgetDef.blockDef);
            // Include outer context variables, even though widget does not technically need them
            // They are included as the widget might receive expressions such as rowsets that reference
            // variables that are only present in the outer scope.
            const innerContextVars = (instanceCtx.globalContextVars || [])
                .concat(instanceCtx.contextVars)
                .concat(widgetDef.contextVars);
            const innerContextVarValues = {
                ...instanceCtx.contextVarValues,
                ...mappedContextVarValues,
                // Exclude stale values
                ...(_.pick(widgetDef.privateContextVarValues || {}, (widgetDef.privateContextVars || []).map(cv => cv.id)))
            };
            const innerInstanceCtx = {
                ...instanceCtx,
                contextVars: innerContextVars,
                contextVarValues: innerContextVarValues,
                getContextVarExprValue: (contextVarId, expr) => {
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        // Map variable from inner to outer
                        return instanceCtx.getContextVarExprValue(outerContextVarId, this.mapInnerToOuterVariables(expr));
                    }
                    else {
                        // If global variable, pass through
                        if ((instanceCtx.globalContextVars || []).find(cv => cv.id == contextVarId)) {
                            return instanceCtx.getContextVarExprValue(contextVarId, expr);
                        }
                        return;
                    }
                },
                onSelectContextVar: (contextVarId, primaryKey) => {
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        instanceCtx.onSelectContextVar(outerContextVarId, primaryKey);
                    }
                },
                setFilter: (contextVarId, filter) => {
                    // Lookup outer id
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        instanceCtx.setFilter(outerContextVarId, { ...filter, expr: this.mapInnerToOuterVariables(filter.expr) });
                    }
                },
                getFilters: (contextVarId) => {
                    // Lookup outer id, mapping any variables
                    const outerContextVarId = this.blockDef.contextVarMap[contextVarId];
                    if (outerContextVarId) {
                        return instanceCtx.getFilters(outerContextVarId).map(f => ({ ...f, expr: this.mapOuterToInnerVariables(f.expr) }));
                    }
                    return [];
                }
            };
            // Inject private context vars
            return React.createElement(ContextVarsInjector_1.default, { instanceCtx: innerInstanceCtx, innerBlock: widgetDef.blockDef, injectedContextVars: widgetDef.privateContextVars || [], injectedContextVarValues: _.pick(widgetDef.privateContextVarValues || {}, (widgetDef.privateContextVars || []).map(cv => cv.id)) }, (instanceCtx, loading, refreshing) => {
                if (loading) {
                    return React.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                        React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
                }
                return innerBlock.renderInstance(instanceCtx);
            });
        }
        else { // Handle case of widget with null block
            return React.createElement("div", null);
        }
    }
    renderEditor(props) {
        // Create widget options 
        const widgetOptions = _.sortByAll(Object.values(props.widgetLibrary.widgets), "group", "name").map(w => ({ label: (w.group ? `${w.group}: ` : "") + w.name, value: w.id }));
        const handleWidgetIdChange = (widgetId) => {
            props.store.replaceBlock({ ...this.blockDef, widgetId: widgetId, contextVarMap: {} });
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
                        props.store.replaceBlock(immer_1.default(this.blockDef, (draft) => {
                            draft.contextVarMap[contextVar.id] = contextVarId;
                        }));
                    };
                    return (React.createElement("tr", { key: contextVar.id },
                        React.createElement("td", { key: "name" }, contextVar.name),
                        React.createElement("td", { key: "value" },
                            React.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: props.contextVars, types: [contextVar.type], table: contextVar.table, value: cv, onChange: handleCVChange }))));
                }))));
        };
        return React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Widget" },
                React.createElement(bootstrap_1.Select, { value: this.blockDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            renderContextVarValues());
    }
}
exports.WidgetBlock = WidgetBlock;
// Run a possibly deep object through a mapping function. Automatically maps all values of objects and arrays recursively
exports.mapObjectTree = (obj, mapping) => {
    // If array, map items
    if (_.isArray(obj)) {
        return obj.map((elem) => exports.mapObjectTree(elem, mapping));
    }
    if (_.isObject(obj)) {
        // First map object itself
        const res = mapping(obj);
        // Then map values
        return _.mapValues(res, (value) => exports.mapObjectTree(value, mapping));
    }
    return obj;
};
