import { BlockDef, ContextVar } from "../widgets/blocks";
import uuid from "uuid/v4"
import React from "react";
import { QueryTableBlockDef } from "src/widgets/blocks/queryTable/queryTable";
import { TextBlockDef } from "src/widgets/blocks/text";

export interface BlockPaletteEntry {
  title: string
  blockDef: BlockDef | ((contextVars: ContextVar[]) => BlockDef)
  /** Element to display instead of design view */
  elem?: React.ReactElement<any>
}

export const defaultBlockPaletteEntries: BlockPaletteEntry[] = [
  {
    title: "Text",
    blockDef: { id: "", type: "text", text: { _base: "en", en: "" }, style: "div" },
  },
  {
    title: "Header",
    blockDef: { id: "", type: "header", child: {
      type: "text",
      id: "",
      style: "h4",
      text: { _base: "en", en: "Header"}
    } as TextBlockDef},
  },
  {
    title: "Labeled Section",
    blockDef: { id: "", type: "labeled", label: { _base: "en", en: "" }, child: null },
  },
  {
    title: "Collapsible Section",
    blockDef: { id: "", type: "collapsible", label: { id: "text", type: "text", text: { _base: "en", en: "Collapsible" }, style: "div" }, content: null },
  },
  {
    title: "Rowset",
    blockDef: { id: "", type: "rowset", content: null, filter: null },
  },
  {
    title: "TextBox Control",
    blockDef: { id: "", type: "textbox", rowContextVarId: null, column: null },
  },
  {
    title: "NumberBox Control",
    blockDef: { id: "", type: "numberbox", rowContextVarId: null, decimal: true, column: null },
  },
  {
    title: "Dropdown Control",
    blockDef: { id: "", type: "dropdown", rowContextVarId: null, column: null },
  },
  {
    title: "Date/Datetime Control",
    blockDef: { id: "", type: "datefield", rowContextVarId: null, column: null },
  },
  {
    title: "Expression",
    blockDef: { id: "", type: "expression", expr: null },
  },
  {
    title: "Conditional",
    blockDef: { id: "", type: "conditional", expr: null },
  },
  {
    title: "Float",
    blockDef: { id: "", type: "float", direction: "right", verticalAlign: "top", mainContent: null, floatContent: null },
  },
  {
    title: "Embed Widget",
    blockDef: { id: "", type: "widget", widgetId: null, contextVarMap: {} },
  },
  {
    title: "Spacer",
    blockDef: { id: "", type: "spacer", height: 5 },
  },
  {
    title: "Query Table",
    blockDef: (contextVars: ContextVar[]) => {
      const rowsetCV = contextVars.find(cv => cv.type == "rowset")
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
        limit: 100
      } as QueryTableBlockDef
    }
  },
  {
    title: "Fixed Table",
    blockDef: {
      id: "",
      type: "fixedTable",
      numRows: 2,
      numColumns: 2,
      cellBorders: "default",
      cellPadding: "default",
      rows: [
        { cells: [{ content: null }, { content: null }]},
        { cells: [{ content: null }, { content: null }]}
      ]
    }
  },
  {
    title: "Search Box",
    blockDef: { id: "", type: "search", searchExprs: [], placeholder: null },
  },
  {
    title: "Dropdown Filter",
    blockDef: { id: "", type: "dropdownFilter", filterExpr: null, placeholder: null },
  },
  {
    title: "Button",
    blockDef: { id: "", type: "button", label: { _base: "en", en: "Button" }, style: "default", size: "normal" }
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
    }
  },
  {
    title: "Tabbed",
    blockDef: { id: "", type: "tabbed", tabs: [{ id: uuid(), label: { _base: "en", en: "Tab1" }, content: null }]}
  },
  {
    title: "Static Image",
    blockDef: { id: "", type: "image" }
  },
  {
    title: "Table of Contents",
    blockDef: { id: "", type: "toc", items: [] },
    elem: <div>Table of Contents</div>
  },
  {
    title: "Validation",
    blockDef: { id: "", type: "validation", validations: [] },
    elem: <div className="alert alert-danger"><div><i className="fa fa-exclamation-triangle"/> Validation</div></div>
  },
  {
    title: "Print",
    blockDef: { id: "", type: "print", content: null }
  }
]
