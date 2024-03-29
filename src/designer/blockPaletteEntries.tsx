import { BlockDef, ContextVar } from "../widgets/blocks"
import uuid from "uuid/v4"
import React from "react"
import { QueryTableBlockDef } from "src/widgets/blocks/queryTable/queryTable"
import { TextBlockDef } from "src/widgets/blocks/text"
import { AlertBlockDef } from "../widgets/blocks/alert"
import { HeaderBlockDef } from "../widgets/blocks/header"
import { CollapsibleBlockDef } from "../widgets/blocks/collapsible"
import { RowsetBlockDef } from "../widgets/blocks/rowset"
import { RowBlockDef } from "../widgets/blocks/row"
import { TextboxBlockDef } from "../widgets/blocks/controls/textbox"
import { NumberboxBlockDef } from "../widgets/blocks/controls/numberbox"
import { DropdownBlockDef } from "../widgets/blocks/controls/dropdown"
import { DatefieldBlockDef } from "../widgets/blocks/controls/datefield"
import { ExpressionBlockDef } from "../widgets/blocks/expression"
import { ConditionalBlockDef } from "../widgets/blocks/conditional"
import { FloatBlockDef } from "../widgets/blocks/float"
import { WidgetBlockDef } from "../widgets/blocks/widget"
import { SpacerBlockDef } from "../widgets/blocks/spacer"
import { PanelBlockDef } from "../widgets/blocks/panel"
import { FixedTableBlockDef } from "../widgets/blocks/fixedTable"
import { SearchBlockDef } from "../widgets/blocks/search/search"
import { DropdownFilterBlockDef } from "../widgets/blocks/dropdownFilter/dropdownFilter"
import { ButtonBlockDef } from "../widgets/blocks/button"
import { SaveCancelBlockDef } from "../widgets/blocks/saveCancel"
import { AddRowBlockDef } from "../widgets/blocks/addRow"
import { TabbedBlockDef } from "../widgets/blocks/tabbed/tabbed"
import { TOCBlockDef } from "../widgets/blocks/toc/toc"
import { ImageBlockDef } from "../widgets/blocks/image"
import { ValidationBlockDef } from "../widgets/blocks/validation"
import { PrintBlockDef } from "../widgets/blocks/print"
import { QueryRepeatBlockDef } from "../widgets/blocks/queryRepeat/queryRepeat"
import { LabeledBlockDef } from "../widgets/blocks/labeled"
import { DateInjectBlockDef } from "../widgets/blocks/dateInject"
import { ToggleBlockDef } from "../widgets/blocks/controls/toggle"
import { GanttChartBlockDef } from "../widgets/blocks/ganttChart/GanttChart"
import { ToggleFilterBlockDef } from "../widgets/blocks/toggleFilter"
import { TagsEditorBlockDef } from "../widgets/blocks/controls/tagsEditor"
import { ExpressionFilterBlockDef } from "../widgets/blocks/expressionFilter"
import { VariableBlockDef } from "../widgets/blocks/variable"
import { HtmlBlockDef } from "../widgets/blocks/html/HtmlBlock"
import { CodedBlockDef } from "../widgets/blocks/coded/CodedBlock"
import { PageHeaderBlockDef } from "../widgets/blocks/pageHeader"

export interface BlockPaletteEntry {
  title: string
  subtitle?: string
  blockDef: BlockDef | ((contextVars: ContextVar[]) => BlockDef)
  /** Element to display instead of design view */
  elem?: React.ReactElement<any>
}

export const defaultBlockPaletteEntries: BlockPaletteEntry[] = [
  {
    title: "Text",
    blockDef: { id: "", type: "text", text: { _base: "en", en: "" }, style: "div" } as TextBlockDef
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
    } as PageHeaderBlockDef
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
    } as HeaderBlockDef
  },
  {
    title: "Expression",
    blockDef: { id: "", type: "expression", expr: null } as ExpressionBlockDef
  },
  {
    title: "Labeled Section",
    blockDef: { id: "", type: "labeled", label: { _base: "en", en: "" }, child: null } as LabeledBlockDef
  },
  {
    title: "Collapsible Section",
    blockDef: {
      id: "",
      type: "collapsible",
      label: { id: "text", type: "text", text: { _base: "en", en: "Collapsible" }, style: "div" },
      content: null
    } as CollapsibleBlockDef
  },
  {
    title: "Rowset",
    blockDef: { id: "", type: "rowset", content: null, filter: null } as RowsetBlockDef
  },
  {
    title: "Row",
    blockDef: { id: "", type: "row", content: null, filter: null } as RowBlockDef
  },
  {
    title: "TextBox Control",
    blockDef: { id: "", type: "textbox", rowContextVarId: null, column: null } as TextboxBlockDef
  },
  {
    title: "NumberBox Control",
    blockDef: { id: "", type: "numberbox", rowContextVarId: null, decimal: true, column: null } as NumberboxBlockDef
  },
  {
    title: "Dropdown Control",
    blockDef: { id: "", type: "dropdown", rowContextVarId: null, column: null } as DropdownBlockDef
  },
  {
    title: "Toggle Control",
    blockDef: { id: "", type: "toggle", rowContextVarId: null, column: null } as ToggleBlockDef
  },
  {
    title: "Date/Datetime Control",
    blockDef: { id: "", type: "datefield", rowContextVarId: null, column: null } as DatefieldBlockDef
  },
  {
    title: "Conditional",
    blockDef: { id: "", type: "conditional", expr: null } as ConditionalBlockDef
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
    } as FloatBlockDef
  },
  {
    title: "Embed Widget",
    blockDef: { id: "", type: "widget", widgetId: null, contextVarMap: {} } as WidgetBlockDef
  },
  {
    title: "Spacer",
    blockDef: { id: "", type: "spacer", height: 5 } as SpacerBlockDef
  },
  {
    title: "Panel",
    blockDef: { id: "", type: "panel", mainContent: null, headerContent: null } as PanelBlockDef
  },
  {
    title: "Alert",
    blockDef: { id: "", type: "alert", content: null, style: "warning" } as AlertBlockDef
  },
  {
    title: "Query Table",
    blockDef: (contextVars: ContextVar[]) => {
      const rowsetCV = contextVars.find((cv) => cv.type == "rowset")
      return {
        id: "",
        mode: "singleRow",
        type: "queryTable",
        headers: [
          { id: "h1", type: "text", text: { _base: "en", en: "Header 1" }, style: "div" } as TextBlockDef,
          { id: "h2", type: "text", text: { _base: "en", en: "Header 2" }, style: "div" } as TextBlockDef
        ],
        contents: [null, null],
        where: null,
        rowClickAction: null,
        orderBy: null,
        rowsetContextVarId: rowsetCV ? rowsetCV.id : null,
        limit: 1000
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
      rows: [{ cells: [{ content: null }, { content: null }] }, { cells: [{ content: null }, { content: null }] }]
    } as FixedTableBlockDef
  },
  {
    title: "Search Box",
    blockDef: { id: "", type: "search", searchExprs: [], placeholder: null, rowsetContextVarId: null } as SearchBlockDef
  },
  {
    title: "Dropdown Filter",
    blockDef: { id: "", type: "dropdownFilter", filterExpr: null, placeholder: null } as DropdownFilterBlockDef
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
    } as ToggleFilterBlockDef
  },
  {
    title: "Expression Filter",
    blockDef: {
      id: "",
      type: "expressionFilter",
      rowsetContextVarId: null,
      defaultFilterExpr: null
    } as ExpressionFilterBlockDef
  },
  {
    title: "Button",
    blockDef: {
      id: "",
      type: "button",
      label: { _base: "en", en: "Button" },
      style: "default",
      size: "normal"
    } as ButtonBlockDef
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
    } as SaveCancelBlockDef
  },
  {
    title: "Add Row",
    blockDef: {
      id: "",
      type: "addRow",
      columnValues: {},
      content: null
    } as AddRowBlockDef,
    subtitle: "Adds a new row to a database table and injects as row variable to inner block"
  },
  {
    title: "Tabbed",
    blockDef: {
      id: "",
      type: "tabbed",
      tabs: [{ id: uuid(), label: { _base: "en", en: "Tab1" }, content: null }]
    } as TabbedBlockDef
  },
  {
    title: "Static Image",
    blockDef: { id: "", type: "image" } as ImageBlockDef
  },
  {
    title: "Table of Contents",
    blockDef: { id: "", type: "toc", items: [], header: null, footer: null } as TOCBlockDef,
    elem: <div>Table of Contents</div>
  },
  {
    title: "Validation",
    blockDef: { id: "", type: "validation", validations: [] } as ValidationBlockDef,
    elem: (
      <div className="alert alert-danger">
        <div>
          <i className="fa fa-exclamation-triangle" /> Validation
        </div>
      </div>
    )
  },
  {
    title: "Print",
    blockDef: { id: "", type: "print", content: null } as PrintBlockDef
  },
  {
    title: "Repeating Block",
    blockDef: {
      id: "",
      type: "queryRepeat",
      content: null,
      separator: "solid_line",
      limit: 100
    } as QueryRepeatBlockDef,
    subtitle: "Repeats a block once for each result of a query"
  },
  {
    title: "Inject Variable",
    blockDef: {
      id: "",
      type: "variable",
      content: null
    } as VariableBlockDef,
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
    } as TagsEditorBlockDef,
    subtitle: "Allows editing/creating tags for a text array column"
  },
  {
    title: "HTML Block",
    blockDef: { id: "", type: "html" } as HtmlBlockDef
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
    } as CodedBlockDef,
    elem: <div style={{ textAlign: "center", color: "#AAA", fontSize: 18 }}>Coded Block</div>
  },
  {
    title: "Date Inject",
    blockDef: { id: "", type: "dateInject", content: null } as DateInjectBlockDef,
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
    } as GanttChartBlockDef
  },
]
