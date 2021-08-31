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
exports.QueryRepeatBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const QueryRepeatBlockInstance_1 = __importDefault(require("./QueryRepeatBlockInstance"));
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
class QueryRepeatBlock extends blocks_1.Block {
    getChildren(contextVars) {
        // Get rowset context variable
        const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        if (this.blockDef.content) {
            return [{
                    blockDef: this.blockDef.content,
                    contextVars: rowsetCV ? contextVars.concat(this.createRowContextVar(rowsetCV)) : contextVars
                }];
        }
        return [];
    }
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
        let error;
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table });
        if (error) {
            return error;
        }
        // TODO Validate order by
        return null;
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return (0, immer_1.default)(this.blockDef, draft => { draft.content = content; });
    }
    /** Create the context variable used */
    createRowContextVar(rowsetCV) {
        return { id: this.getRowContextVarId(), name: `Table row of ${rowsetCV.name}`, type: "row", table: rowsetCV.table };
    }
    getRowContextVarId() {
        return this.blockDef.id + "_row";
    }
    /** Get list of expressions used in a row by content blocks */
    getRowExprs(contextVars, ctx) {
        const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return [];
        }
        let exprs = [];
        const rowCV = this.createRowContextVar(rowsetCV);
        // Get expressions for content
        if (this.blockDef.content) {
            exprs = exprs.concat(ctx.createBlock(this.blockDef.content).getSubtreeContextVarExprs(rowCV, Object.assign(Object.assign({}, ctx), { contextVars: contextVars.concat([rowCV]) })));
        }
        return exprs;
    }
    getContextVarExprs() {
        return [];
    }
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    getRowContextVarValue(row, rowExprs, schema, rowsetCV, contextVars) {
        return row.id;
    }
    renderDesign(props) {
        const setContent = (blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)(b => {
                b.content = blockDef;
            }), blockDef.id);
        };
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        let contentProps = props;
        // Add context variable if knowable
        if (rowsetCV) {
            contentProps = Object.assign(Object.assign({}, contentProps), { contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) });
        }
        return (props.renderChildBlock(contentProps, this.blockDef.content, setContent));
    }
    renderInstance(props) {
        return React.createElement(QueryRepeatBlockInstance_1.default, { block: this, instanceCtx: props });
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null;
        const separatorOptions = [
            { value: "none", label: "None" },
            { value: "solid_line", label: "Solid Line" },
            { value: "page_break", label: "Page Break" }
        ];
        const horizontalSpacingOptions = [
            { value: 0, label: "None" },
            { value: 5, label: "5 pixels" },
            { value: 10, label: "10 pixels" },
            { value: 15, label: "15 pixels" },
        ];
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Repeat direction" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "orientation" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value || "vertical", onChange: onChange, options: [{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }] }))),
            (this.blockDef.orientation || "vertical") == "vertical" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Separator" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "separator" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: separatorOptions })))
                :
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Spacing" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "horizontalSpacing" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value != null ? value : 5, onChange: onChange, options: horizontalSpacingOptions }))),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "where" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["boolean"], variables: (0, blocks_1.createExprVariables)(props.contextVars), table: rowsetCV.table }))))
                : null,
            rowCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Ordering" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "orderBy" }, (value, onChange) => React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: rowsetCV.table })))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Maximum rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "limit" }, (value, onChange) => React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: false }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Message to display when no rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "noRowsMessage" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
exports.QueryRepeatBlock = QueryRepeatBlock;
