import { BlockDef } from "../widgets/blocks";
import uuid from "uuid/v4"

export interface BlockPaletteEntry {
  title: string
  blockDef: BlockDef
  /** Element to display instead of design view */
  elem?: React.ReactElement<any>
}

export const defaultBlockPaletteEntries: BlockPaletteEntry[] = [
  {
    title: "Text",
    blockDef: { id: "", type: "text", text: { _base: "en", en: "" }, style: "div" },
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
    title: "Embed Widget",
    blockDef: { id: "", type: "widget", widgetId: null, contextVarMap: {} },
  },
  {
    title: "Query Table",
    blockDef: { 
      id: "", 
      mode: "singleRow",
      type: "queryTable", 
      headers: [
        { id: "h1", type: "text", text: { _base: "en", en: "Header 1" }, style: "div" },
        { id: "h2", type: "text", text: { _base: "en", en: "Header 2" }, style: "div" }
      ], 
      contents: [null, null],
      limit: 100
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
]