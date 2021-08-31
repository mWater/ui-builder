"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const react_1 = __importDefault(require("react"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const propertyEditors_1 = require("../propertyEditors");
const localization_1 = require("../localization");
const react_2 = require("react");
const contexts_1 = require("../../contexts");
class RowBlock extends blocks_1.Block {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            const contextVar = this.createContextVar();
            return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }];
        }
        return [];
    }
    createContextVar() {
        if (this.blockDef.table) {
            return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Unnamed", table: this.blockDef.table };
        }
        return null;
    }
    getContextVarExprs(contextVar, ctx) {
        if (this.blockDef.idContextVarExpr && contextVar.id == this.blockDef.idContextVarExpr.contextVarId) {
            return [this.blockDef.idContextVarExpr.expr];
        }
        return [];
    }
    validate(options) {
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
        let error;
        if (!this.blockDef.table) {
            return "Missing table";
        }
        const mode = this.blockDef.mode || "filter";
        // Validate filter
        if (mode == "filter") {
            error = exprValidator.validateExpr(this.blockDef.filter || null, { table: this.blockDef.table, types: ["boolean"] });
            if (error) {
                return error;
            }
            // Validate orderBy
            for (const orderBy of this.blockDef.filterOrderBy || []) {
                error = exprValidator.validateExpr(orderBy.expr, { table: this.blockDef.table });
                if (error) {
                    return error;
                }
            }
        }
        // Validate idContextVarExpr
        if (mode == "id") {
            if (!this.blockDef.idContextVarExpr) {
                return "Id expression required";
            }
            error = (0, blocks_1.validateContextVarExpr)({
                contextVars: options.contextVars,
                schema: options.schema,
                contextVarId: this.blockDef.idContextVarExpr.contextVarId,
                expr: this.blockDef.idContextVarExpr.expr,
                idTable: this.blockDef.table,
                types: ["id"],
                aggrStatuses: ["literal", "individual"]
            });
            if (error) {
                return error;
            }
        }
        return null;
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return (0, immer_1.default)(this.blockDef, draft => {
            draft.content = content;
        });
    }
    renderDesign(props) {
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        // Create props for child
        const contextVar = this.createContextVar();
        let contentProps = props;
        // Add context variable if knowable
        if (contextVar) {
            contentProps = Object.assign(Object.assign({}, contentProps), { contextVars: props.contextVars.concat([contextVar]) });
        }
        const contentNode = props.renderChildBlock(contentProps, this.blockDef.content, handleSetContent);
        return (react_1.default.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    }
    renderInstance(props) {
        const contextVar = this.createContextVar();
        return react_1.default.createElement(RowInstance, { contextVar: contextVar, blockDef: this.blockDef, instanceProps: props });
    }
    renderEditor(props) {
        const handleTableChange = (tableId) => {
            const table = props.schema.getTable(tableId);
            props.store.replaceBlock((0, immer_1.default)(this.blockDef, (bd) => {
                bd.table = tableId;
                bd.name = bd.name || (0, localization_1.localize)(table.name);
            }));
        };
        const mode = this.blockDef.mode || "filter";
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h3", null, "Row"),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                react_1.default.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: this.blockDef.table || null, onChange: handleTableChange })),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "name" }, (value, onChange) => react_1.default.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange, placeholder: "Unnamed" }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "mode" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "mode" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value || "filter", onChange: onChange, options: [
                        { value: "filter", label: "By Filter" },
                        { value: "id", label: "By ID" }
                    ] }))),
            this.blockDef.table && mode == "filter" ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "filter" }, (value, onChange) => react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.blockDef.table, variables: (0, blocks_1.createExprVariables)(props.contextVars) })))
                : null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Filter Order", key: "filterOrderBy", hint: "If filter matches more than one row, first one is taken" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "filterOrderBy" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.OrderByArrayEditor, { value: value || [], onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: this.blockDef.table }))),
            this.blockDef.table && mode == "id" ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "ID of row" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idContextVarExpr" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, contextVarId: value ? value.contextVarId : null, expr: value ? value.expr : null, onChange: (contextVarId, expr) => {
                            onChange({ contextVarId, expr });
                        }, schema: props.schema, dataSource: props.dataSource, idTable: this.blockDef.table, types: ["id"] })))
                : null));
    }
}
exports.RowBlock = RowBlock;
const RowInstance = (props) => {
    const { blockDef, instanceProps, contextVar } = props;
    const db = instanceProps.database;
    const table = contextVar.table;
    const [error, setError] = (0, react_2.useState)(null);
    const [loading, setLoading] = (0, react_2.useState)(true);
    const [id, setId] = (0, react_2.useState)();
    const mode = blockDef.mode || "filter";
    (0, react_2.useEffect)(() => {
        if (mode == "filter") {
            // Query to get match
            db.query({
                select: { id: { type: "id", table: table } },
                from: table,
                where: blockDef.filter,
                orderBy: blockDef.filterOrderBy || undefined,
                limit: 1
            }, instanceProps.contextVars, (0, contexts_1.getFilteredContextVarValues)(instanceProps))
                .then((rows) => {
                if (rows.length > 0) {
                    setId(rows[0].id);
                }
                else {
                    setId(null);
                }
                setLoading(false);
            })
                .catch(err => {
                setError(err);
                setLoading(false);
            });
        }
        else {
            // Just set id from context var
            const exprValue = instanceProps.getContextVarExprValue(blockDef.idContextVarExpr.contextVarId, blockDef.idContextVarExpr.expr);
            setId(exprValue);
            setLoading(false);
        }
    }, []);
    if (loading) {
        return react_1.default.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
            react_1.default.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
    }
    if (error) {
        return react_1.default.createElement("div", { className: "alert alert-danger" }, "Error loading results");
    }
    // Inject context variable
    return react_1.default.createElement(ContextVarsInjector_1.default, { injectedContextVars: [contextVar], injectedContextVarValues: { [contextVar.id]: id }, innerBlock: blockDef.content, instanceCtx: instanceProps }, (instanceCtx, loading, refreshing) => {
        if (loading) {
            return react_1.default.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                react_1.default.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
        }
        return instanceProps.renderChildBlock(instanceCtx, blockDef.content);
    });
};
