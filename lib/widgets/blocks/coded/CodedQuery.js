"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCodedQuery = exports.CodedQueryEditor = exports.CodedQueriesEditor = void 0;
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = __importDefault(require("react"));
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const __1 = require("../../..");
/** Edits coded queries. */
function CodedQueriesEditor(props) {
    const { value, onChange, schema, dataSource, contextVars } = props;
    function renderItem(item) {
        return react_1.default.createElement("div", null, item.name);
    }
    function createNew() {
        return {};
    }
    function renderEditor(item, onChange) {
        return (react_1.default.createElement(CodedQueryEditor, { value: item, onChange: onChange, contextVars: contextVars, schema: schema, dataSource: dataSource }));
    }
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value || [], onItemsChange: onChange, renderItem: renderItem, createNew: createNew, validateItem: (item) => {
                const error = validateCodedQuery(item, schema, contextVars);
                if (error) {
                    alert(error);
                }
                return error == null;
            }, renderEditor: renderEditor })));
}
exports.CodedQueriesEditor = CodedQueriesEditor;
function CodedQueryEditor(props) {
    const { value, onChange, schema, dataSource, contextVars } = props;
    function renderSelect(select, index, onSelectChange) {
        return (react_1.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 10 } },
            react_1.default.createElement(bootstrap_1.TextInput, { value: select.alias, onChange: (alias) => {
                    onSelectChange(Object.assign(Object.assign({}, select), { alias: alias || "" }));
                }, style: { display: "inline-block", width: "6em" } }),
            react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { value: select.expr, schema: schema, dataSource: dataSource, table: value.from, onChange: (expr) => {
                    onSelectChange(Object.assign(Object.assign({}, select), { expr }));
                }, variables: (0, __1.createExprVariables)(contextVars) })));
    }
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(bootstrap_1.FormGroup, { label: "Name of query", hint: "Passed in as prop" },
            react_1.default.createElement(bootstrap_1.TextInput, { value: value.name || null, onChange: (name) => onChange(Object.assign(Object.assign({}, value), { name: name || "" })) })),
        react_1.default.createElement("hr", null),
        react_1.default.createElement(bootstrap_1.FormGroup, { label: "From" },
            react_1.default.createElement(__1.TableSelect, { schema: schema, value: value.from, onChange: (from) => {
                    onChange(Object.assign(Object.assign({}, value), { from: from || undefined }));
                }, locale: "en" })),
        react_1.default.createElement(bootstrap_1.Checkbox, { value: value.distinct || false, onChange: (distinct) => {
                onChange(Object.assign(Object.assign({}, value), { distinct }));
            } }, "Distinct"),
        value.from ? (react_1.default.createElement("div", null,
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Select" },
                react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value.selects || [], onItemsChange: (selects) => {
                        onChange(Object.assign(Object.assign({}, value), { selects }));
                    }, renderItem: renderSelect, createNew: () => ({ name: "", expr: null }) })),
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Where" },
                react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, { schema: schema, value: value.where, onChange: (where) => {
                        onChange(Object.assign(Object.assign({}, value), { where }));
                    }, dataSource: dataSource, table: value.from, variables: (0, __1.createExprVariables)(contextVars) })),
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Order" },
                react_1.default.createElement(__1.OrderByArrayEditor, { value: value.orderBy, onChange: (orderBy) => {
                        onChange(Object.assign(Object.assign({}, value), { orderBy }));
                    }, table: value.from, contextVars: contextVars, schema: schema, dataSource: dataSource })),
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Limit" },
                react_1.default.createElement(bootstrap_1.NumberInput, { value: value.limit, onChange: (limit) => {
                        onChange(Object.assign(Object.assign({}, value), { limit }));
                    }, decimal: false })))) : null));
}
exports.CodedQueryEditor = CodedQueryEditor;
/** Validate a coded query, returning null if ok, or error */
function validateCodedQuery(codedQuery, schema, contextVars) {
    if (!codedQuery.name) {
        return "Name required";
    }
    if (!codedQuery.selects) {
        return "Selects required";
    }
    if (!codedQuery.from) {
        return "From required";
    }
    const exprValidator = new mwater_expressions_1.ExprValidator(schema, (0, __1.createExprVariables)(contextVars));
    for (const select of codedQuery.selects) {
        const error = exprValidator.validateExpr(select.expr, {
            table: codedQuery.from,
            aggrStatuses: ["aggregate", "literal", "individual"]
        });
        if (error) {
            return error;
        }
    }
    const whereError = exprValidator.validateExpr(codedQuery.where || null, {
        table: codedQuery.from,
        types: ["boolean"]
    });
    if (whereError) {
        return whereError;
    }
    // Validate orderBy
    for (const orderBy of codedQuery.orderBy || []) {
        const error = exprValidator.validateExpr(orderBy.expr, { table: codedQuery.from });
        if (error) {
            return error;
        }
    }
    return null;
}
exports.validateCodedQuery = validateCodedQuery;
