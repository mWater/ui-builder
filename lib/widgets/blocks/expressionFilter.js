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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionFilterBlock = void 0;
const react_1 = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const propertyEditors_1 = require("../propertyEditors");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
/** Filter by a customizable expression
 */
class ExpressionFilterBlock extends LeafBlock_1.default {
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        // Validate filter
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
        const error = exprValidator.validateExpr(this.blockDef.defaultFilterExpr, { table: rowsetCV.table, types: ["boolean"] });
        if (error) {
            return error;
        }
        return null;
    }
    getInitialFilters(contextVarId, instanceCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (contextVarId == this.blockDef.rowsetContextVarId) {
                if (this.blockDef.defaultFilterExpr) {
                    return [{
                            id: this.blockDef.id,
                            expr: this.blockDef.defaultFilterExpr
                        }];
                }
            }
            return [];
        });
    }
    renderDesign(props) {
        const rowsetCV = props.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!(rowsetCV === null || rowsetCV === void 0 ? void 0 : rowsetCV.table)) {
            return react_1.default.createElement("a", { className: "link-plain" }, "+ Add Filter");
        }
        return react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, { schema: props.schema, dataSource: props.dataSource, table: rowsetCV.table, value: this.blockDef.defaultFilterExpr });
    }
    renderInstance(ctx) {
        return react_1.default.createElement(ExpressionFilterInstance, { blockDef: this.blockDef, ctx: ctx });
    }
    renderEditor(ctx) {
        // Get rowset context variable
        const rowsetCV = ctx.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId);
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "rowsetContextVarId" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: ctx.contextVars, types: ["rowset"] })))),
            rowsetCV ? (react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Default filter expression" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "defaultFilterExpr" }, (value, onChange) => (react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, schema: ctx.schema, dataSource: ctx.dataSource, onChange: onChange, table: rowsetCV.table, variables: (0, blocks_1.createExprVariables)(ctx.contextVars) }))))) : null));
    }
}
exports.ExpressionFilterBlock = ExpressionFilterBlock;
function ExpressionFilterInstance(props) {
    const { blockDef, ctx } = props;
    const [filterExpr, setFilterExpr] = (0, react_1.useState)(blockDef.defaultFilterExpr);
    // Get rowset context variable
    const rowsetCV = ctx.contextVars.find((cv) => cv.id === blockDef.rowsetContextVarId);
    // Set filter
    (0, react_1.useEffect)(() => {
        ctx.setFilter(blockDef.rowsetContextVarId, {
            id: blockDef.id,
            expr: filterExpr
        });
    }, [filterExpr]);
    return (react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, { schema: ctx.schema, dataSource: ctx.dataSource || new mwater_expressions_1.NullDataSource(), table: rowsetCV.table, value: filterExpr, onChange: setFilterExpr, variables: (0, blocks_1.createExprVariables)(ctx.contextVars) }));
}
