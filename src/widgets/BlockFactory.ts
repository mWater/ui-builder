import { HorizontalBlock, HorizontalBlockDef } from "./blocks/horizontal"
import { BlockDef, Block } from "./blocks"
import { VerticalBlock, VerticalBlockDef } from "./blocks/vertical"
import { WidgetBlock, WidgetBlockDef } from "./blocks/widget"
import { TextBlock, TextBlockDef } from "./blocks/text"
import { LabeledBlock, LabeledBlockDef } from "./blocks/labeled"
import { CollapsibleBlock, CollapsibleBlockDef } from "./blocks/collapsible"
import { ExpressionBlock, ExpressionBlockDef } from "./blocks/expression"
import { QueryTableBlock, QueryTableBlockDef } from "./blocks/queryTable/queryTable"
import { SearchBlock, SearchBlockDef } from "./blocks/search/search"
import { ButtonBlock, ButtonBlockDef } from "./blocks/button"
import { TextboxBlock, TextboxBlockDef } from "./blocks/controls/textbox"
import { SaveCancelBlock, SaveCancelBlockDef } from "./blocks/saveCancel"
import { DropdownBlock, DropdownBlockDef } from "./blocks/controls/dropdown"
import { DropdownFilterBlock, DropdownFilterBlockDef } from "./blocks/dropdownFilter/dropdownFilter"
import { RowsetBlock, RowsetBlockDef } from "./blocks/rowset"
import { TabbedBlock, TabbedBlockDef } from "./blocks/tabbed/tabbed"
import { ImageBlock, ImageBlockDef } from "./blocks/image"
import { AddRowBlock, AddRowBlockDef } from "./blocks/addRow"
import { DatefieldBlock, DatefieldBlockDef } from "./blocks/controls/datefield"
import { ConditionalBlock, ConditionalBlockDef } from "./blocks/conditional"
import { FixedTableBlock, FixedTableBlockDef } from "./blocks/fixedTable"
import { AddWizardBlockDef, AddWizardBlock } from "./blocks/addWizard"
import { NumberboxBlockDef, NumberboxBlock } from "./blocks/controls/numberbox"
import { HeaderBlock, HeaderBlockDef } from "./blocks/header"
import { TOCBlock, TOCBlockDef } from "./blocks/toc/toc"
import { ValidationBlockDef, ValidationBlock } from "./blocks/validation"
import { FloatBlock, FloatBlockDef } from "./blocks/float"
import { SpacerBlock, SpacerBlockDef } from "./blocks/spacer"
import { PrintBlock, PrintBlockDef } from "./blocks/print"
import { QueryRepeatBlock, QueryRepeatBlockDef } from "./blocks/queryRepeat/queryRepeat"
import { RowBlockDef, RowBlock } from "./blocks/row"
import { PanelBlock, PanelBlockDef } from "./blocks/panel"
import { AlertBlock, AlertBlockDef } from "./blocks/alert"
import { DateInjectBlock, DateInjectBlockDef } from "./blocks/dateInject"
import { ToggleBlockDef, ToggleBlock } from "./blocks/controls/toggle"
import { GanttChartBlock, GanttChartBlockDef } from "./blocks/ganttChart/GanttChart"
import { ToggleFilterBlock, ToggleFilterBlockDef } from "./blocks/toggleFilter"
import { TagsEditorBlock, TagsEditorBlockDef } from "./blocks/controls/tagsEditor"
import { ExpressionFilterBlock, ExpressionFilterBlockDef } from "./blocks/expressionFilter"
import { VariableBlock, VariableBlockDef } from "./blocks/variable"
import HtmlBlock, { HtmlBlockDef } from "./blocks/html/HtmlBlock"
import CodedBlock, { CodedBlockDef } from "./blocks/coded/CodedBlock"

export default class BlockFactory {
  customBlocks: { [type: string]: (blockDef: BlockDef) => Block<BlockDef> }

  constructor() {
    this.customBlocks = {}
  }

  registerCustomBlock(type: string, factory: (blockDef: BlockDef) => Block<BlockDef>) {
    this.customBlocks[type] = factory
  }

  createBlock = (blockDef: BlockDef): Block<BlockDef> => {
    switch (blockDef.type) {
      case "addWizard":
        return new AddWizardBlock(blockDef as AddWizardBlockDef)
      case "horizontal":
        return new HorizontalBlock(blockDef as HorizontalBlockDef)
      case "vertical":
        return new VerticalBlock(blockDef as VerticalBlockDef)
      case "widget":
        return new WidgetBlock(blockDef as WidgetBlockDef)
      case "text":
        return new TextBlock(blockDef as TextBlockDef)
      case "labeled":
        return new LabeledBlock(blockDef as LabeledBlockDef)
      case "textbox":
        return new TextboxBlock(blockDef as TextboxBlockDef)
      case "numberbox":
        return new NumberboxBlock(blockDef as NumberboxBlockDef)
      case "dropdown":
        return new DropdownBlock(blockDef as DropdownBlockDef)
      case "toggle":
        return new ToggleBlock(blockDef as ToggleBlockDef)
      case "collapsible":
        return new CollapsibleBlock(blockDef as CollapsibleBlockDef)
      case "expression":
        return new ExpressionBlock(blockDef as ExpressionBlockDef)
      case "conditional":
        return new ConditionalBlock(blockDef as ConditionalBlockDef)
      case "queryTable":
        return new QueryTableBlock(blockDef as QueryTableBlockDef)
      case "fixedTable":
        return new FixedTableBlock(blockDef as FixedTableBlockDef)
      case "search":
        return new SearchBlock(blockDef as SearchBlockDef)
      case "dropdownFilter":
        return new DropdownFilterBlock(blockDef as DropdownFilterBlockDef)
      case "button":
        return new ButtonBlock(blockDef as ButtonBlockDef)
      case "saveCancel":
        return new SaveCancelBlock(blockDef as SaveCancelBlockDef)
      case "rowset":
        return new RowsetBlock(blockDef as RowsetBlockDef)
      case "row":
        return new RowBlock(blockDef as RowBlockDef)
      case "addRow":
        return new AddRowBlock(blockDef as AddRowBlockDef)
      case "tabbed":
        return new TabbedBlock(blockDef as TabbedBlockDef)
      case "image":
        return new ImageBlock(blockDef as ImageBlockDef)
      case "datefield":
        return new DatefieldBlock(blockDef as DatefieldBlockDef)
      case "toc":
        return new TOCBlock(blockDef as TOCBlockDef)
      case "header":
        return new HeaderBlock(blockDef as HeaderBlockDef)
      case "alert":
        return new AlertBlock(blockDef as AlertBlockDef)
      case "validation":
        return new ValidationBlock(blockDef as ValidationBlockDef)
      case "float":
        return new FloatBlock(blockDef as FloatBlockDef)
      case "spacer":
        return new SpacerBlock(blockDef as SpacerBlockDef)
      case "print":
        return new PrintBlock(blockDef as PrintBlockDef)
      case "queryRepeat":
        return new QueryRepeatBlock(blockDef as QueryRepeatBlockDef)
      case "panel":
        return new PanelBlock(blockDef as PanelBlockDef)
      case "dateInject":
        return new DateInjectBlock(blockDef as DateInjectBlockDef)
      case "ganttChart":
        return new GanttChartBlock(blockDef as GanttChartBlockDef)
      case "toggleFilter":
        return new ToggleFilterBlock(blockDef as ToggleFilterBlockDef)
      case "variable":
        return new VariableBlock(blockDef as VariableBlockDef)
      case "tagsEditor":
        return new TagsEditorBlock(blockDef as TagsEditorBlockDef)
      case "expressionFilter":
        return new ExpressionFilterBlock(blockDef as ExpressionFilterBlockDef)
      case "html":
      case "mwater-common:html": // Legacy
      case "waterorg:html": // Legacy
      case "bluekey:html": // Legacy
        return new HtmlBlock(blockDef as HtmlBlockDef)
      case "coded":
      case "mwater-common:coded": // Legacy
      case "waterorg:coded": // Legacy
      case "bluekey:coded": // Legacy
        return new CodedBlock(blockDef as CodedBlockDef)
    }

    // Use custom blocks
    if (this.customBlocks[blockDef.type]) {
      return this.customBlocks[blockDef.type](blockDef)
    }

    throw new Error(`Type ${blockDef.type} not found`)
  }
}
