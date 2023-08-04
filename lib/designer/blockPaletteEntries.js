"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultBlockPaletteEntries = void 0;
const v4_1 = __importDefault(require("uuid/v4"));
const react_1 = __importDefault(require("react"));
exports.defaultBlockPaletteEntries = [
    {
        title: "Text",
        blockDef: { id: "", type: "text", text: { _base: "en", en: "" }, style: "div" }
    },
    {
        title: "Page Header",
        subtitle: "Special header for top of page",
        blockDef: {
            id: "",
            type: "page-header",
            child: {
                type: "text",
                id: "",
                style: "h4",
                text: { _base: "en", en: "Page Header" }
            }
        }
    },
    {
        title: "Header",
        blockDef: {
            id: "",
            type: "header",
            child: {
                type: "text",
                id: "",
                style: "h5",
                text: { _base: "en", en: "Header" }
            }
        }
    },
    {
        title: "Expression",
        blockDef: { id: "", type: "expression", expr: null }
    },
    {
        title: "Labeled Section",
        blockDef: { id: "", type: "labeled", label: { _base: "en", en: "" }, child: null }
    },
    {
        title: "Collapsible Section",
        blockDef: {
            id: "",
            type: "collapsible",
            label: { id: "text", type: "text", text: { _base: "en", en: "Collapsible" }, style: "div" },
            content: null
        }
    },
    {
        title: "Rowset",
        blockDef: { id: "", type: "rowset", content: null, filter: null }
    },
    {
        title: "Row",
        blockDef: { id: "", type: "row", content: null, filter: null }
    },
    {
        title: "TextBox Control",
        blockDef: { id: "", type: "textbox", rowContextVarId: null, column: null }
    },
    {
        title: "NumberBox Control",
        blockDef: { id: "", type: "numberbox", rowContextVarId: null, decimal: true, column: null }
    },
    {
        title: "Dropdown Control",
        blockDef: { id: "", type: "dropdown", rowContextVarId: null, column: null }
    },
    {
        title: "Toggle Control",
        blockDef: { id: "", type: "toggle", rowContextVarId: null, column: null }
    },
    {
        title: "Date/Datetime Control",
        blockDef: { id: "", type: "datefield", rowContextVarId: null, column: null }
    },
    {
        title: "Conditional",
        blockDef: { id: "", type: "conditional", expr: null }
    },
    {
        title: "Float",
        blockDef: {
            id: "",
            type: "float",
            direction: "right",
            verticalAlign: "top",
            mainContent: null,
            floatContent: null
        }
    },
    {
        title: "Embed Widget",
        blockDef: { id: "", type: "widget", widgetId: null, contextVarMap: {} }
    },
    {
        title: "Spacer",
        blockDef: { id: "", type: "spacer", height: 5 }
    },
    {
        title: "Panel",
        blockDef: { id: "", type: "panel", mainContent: null, headerContent: null }
    },
    {
        title: "Alert",
        blockDef: { id: "", type: "alert", content: null, style: "warning" }
    },
    {
        title: "Query Table",
        blockDef: (contextVars) => {
            const rowsetCV = contextVars.find((cv) => cv.type == "rowset");
            return {
                id: "",
                mode: "singleRow",
                type: "queryTable",
                headers: [
                    { id: "h1", type: "text", text: { _base: "en", en: "Header 1" }, style: "div" },
                    { id: "h2", type: "text", text: { _base: "en", en: "Header 2" }, style: "div" }
                ],
                contents: [null, null],
                where: null,
                rowClickAction: null,
                orderBy: null,
                rowsetContextVarId: rowsetCV ? rowsetCV.id : null,
                limit: 1000
            };
        }
    },
    {
        title: "Fixed Table",
        blockDef: {
            id: "",
            type: "fixedTable",
            numRows: 2,
            numColumns: 2,
            rows: [{ cells: [{ content: null }, { content: null }] }, { cells: [{ content: null }, { content: null }] }]
        }
    },
    {
        title: "Search Box",
        blockDef: { id: "", type: "search", searchExprs: [], placeholder: null, rowsetContextVarId: null }
    },
    {
        title: "Dropdown Filter",
        blockDef: { id: "", type: "dropdownFilter", filterExpr: null, placeholder: null }
    },
    {
        title: "Toggle Filter",
        blockDef: {
            id: "",
            type: "toggleFilter",
            initialOption: 0,
            forceSelection: false,
            options: [
                { label: { _base: "en", en: "Option A" }, filters: [] },
                { label: { _base: "en", en: "Option B" }, filters: [] }
            ]
        }
    },
    {
        title: "Expression Filter",
        blockDef: {
            id: "",
            type: "expressionFilter",
            rowsetContextVarId: null,
            defaultFilterExpr: null
        }
    },
    {
        title: "Button",
        blockDef: {
            id: "",
            type: "button",
            label: { _base: "en", en: "Button" },
            style: "default",
            size: "normal"
        }
    },
    {
        title: "Save/Cancel",
        blockDef: {
            id: "",
            type: "saveCancel",
            saveLabel: { _base: "en", en: "Save" },
            cancelLabel: { _base: "en", en: "Cancel" },
            confirmDiscardMessage: { _base: "en", en: "Discard changes?" },
            child: null
        }
    },
    {
        title: "Add Row",
        blockDef: {
            id: "",
            type: "addRow",
            columnValues: {},
            content: null
        },
        subtitle: "Adds a new row to a database table and injects as row variable to inner block"
    },
    {
        title: "Tabbed",
        blockDef: {
            id: "",
            type: "tabbed",
            tabs: [{ id: (0, v4_1.default)(), label: { _base: "en", en: "Tab1" }, content: null }]
        }
    },
    {
        title: "Static Image",
        blockDef: { id: "", type: "image" }
    },
    {
        title: "Table of Contents",
        blockDef: { id: "", type: "toc", items: [], header: null, footer: null },
        elem: react_1.default.createElement("div", null, "Table of Contents")
    },
    {
        title: "Validation",
        blockDef: { id: "", type: "validation", validations: [] },
        elem: (react_1.default.createElement("div", { className: "alert alert-danger" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("i", { className: "fa fa-exclamation-triangle" }),
                " Validation")))
    },
    {
        title: "Print",
        blockDef: { id: "", type: "print", content: null }
    },
    {
        title: "Repeating Block",
        blockDef: {
            id: "",
            type: "queryRepeat",
            content: null,
            separator: "solid_line",
            limit: 100
        },
        subtitle: "Repeats a block once for each result of a query"
    },
    {
        title: "Inject Variable",
        blockDef: {
            id: "",
            type: "variable",
            content: null
        },
        subtitle: "Evaluates an expression and injects as a variable"
    },
    {
        title: "Tags Editor",
        blockDef: {
            id: "",
            type: "tagsEditor",
            rowContextVarId: null,
            column: null,
            required: false
        },
        subtitle: "Allows editing/creating tags for a text array column"
    },
    {
        title: "HTML Block",
        blockDef: { id: "", type: "html" }
    },
    {
        title: "Coded Block",
        blockDef: {
            id: "",
            type: "coded",
            code: `import React from 'react'

/* props are ctx (instance context), and any expressions defined */
export function InstanceComp(props) {
  return <div>TODO</div>
}

/* Optional design component. props are ctx (design context) */
export function DesignComp(props) {
  return <div>Coded Block</div>
}
        `,
            compiledCode: "",
            codedExprs: []
        },
        elem: react_1.default.createElement("div", { style: { textAlign: "center", color: "#AAA", fontSize: 18 } }, "Coded Block")
    },
    {
        title: "Date Inject",
        blockDef: { id: "", type: "dateInject", content: null },
        subtitle: "Allows selecting a date and injects that date as a variable to the inner block"
    },
    {
        title: "GANTT Chart",
        blockDef: {
            id: "",
            type: "ganttChart",
            rowsetContextVarId: null,
            rowLabelExpr: null,
            rowStartDateExpr: null,
            rowEndDateExpr: null,
            filter: null,
            rowOrderColumn: null,
            rowParentColumn: null,
            startDate: null,
            endDate: null,
            barColor: null,
            milestoneColor: null
        }
    },
];
