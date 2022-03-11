"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const horizontal_1 = require("./blocks/horizontal");
const vertical_1 = require("./blocks/vertical");
const widget_1 = require("./blocks/widget");
const text_1 = require("./blocks/text");
const labeled_1 = require("./blocks/labeled");
const collapsible_1 = require("./blocks/collapsible");
const expression_1 = require("./blocks/expression");
const queryTable_1 = require("./blocks/queryTable/queryTable");
const search_1 = require("./blocks/search/search");
const button_1 = require("./blocks/button");
const textbox_1 = require("./blocks/controls/textbox");
const saveCancel_1 = require("./blocks/saveCancel");
const dropdown_1 = require("./blocks/controls/dropdown");
const dropdownFilter_1 = require("./blocks/dropdownFilter/dropdownFilter");
const rowset_1 = require("./blocks/rowset");
const tabbed_1 = require("./blocks/tabbed/tabbed");
const image_1 = require("./blocks/image");
const addRow_1 = require("./blocks/addRow");
const datefield_1 = require("./blocks/controls/datefield");
const conditional_1 = require("./blocks/conditional");
const fixedTable_1 = require("./blocks/fixedTable");
const addWizard_1 = require("./blocks/addWizard");
const numberbox_1 = require("./blocks/controls/numberbox");
const header_1 = require("./blocks/header");
const toc_1 = require("./blocks/toc/toc");
const validation_1 = require("./blocks/validation");
const float_1 = require("./blocks/float");
const spacer_1 = require("./blocks/spacer");
const print_1 = require("./blocks/print");
const queryRepeat_1 = require("./blocks/queryRepeat/queryRepeat");
const row_1 = require("./blocks/row");
const panel_1 = require("./blocks/panel");
const alert_1 = require("./blocks/alert");
const dateInject_1 = require("./blocks/dateInject");
const toggle_1 = require("./blocks/controls/toggle");
const GanttChart_1 = require("./blocks/ganttChart/GanttChart");
const toggleFilter_1 = require("./blocks/toggleFilter");
const tagsEditor_1 = require("./blocks/controls/tagsEditor");
const expressionFilter_1 = require("./blocks/expressionFilter");
class BlockFactory {
    constructor() {
        this.createBlock = (blockDef) => {
            switch (blockDef.type) {
                case "addWizard":
                    return new addWizard_1.AddWizardBlock(blockDef);
                case "horizontal":
                    return new horizontal_1.HorizontalBlock(blockDef);
                case "vertical":
                    return new vertical_1.VerticalBlock(blockDef);
                case "widget":
                    return new widget_1.WidgetBlock(blockDef);
                case "text":
                    return new text_1.TextBlock(blockDef);
                case "labeled":
                    return new labeled_1.LabeledBlock(blockDef);
                case "textbox":
                    return new textbox_1.TextboxBlock(blockDef);
                case "numberbox":
                    return new numberbox_1.NumberboxBlock(blockDef);
                case "dropdown":
                    return new dropdown_1.DropdownBlock(blockDef);
                case "toggle":
                    return new toggle_1.ToggleBlock(blockDef);
                case "collapsible":
                    return new collapsible_1.CollapsibleBlock(blockDef);
                case "expression":
                    return new expression_1.ExpressionBlock(blockDef);
                case "conditional":
                    return new conditional_1.ConditionalBlock(blockDef);
                case "queryTable":
                    return new queryTable_1.QueryTableBlock(blockDef);
                case "fixedTable":
                    return new fixedTable_1.FixedTableBlock(blockDef);
                case "search":
                    return new search_1.SearchBlock(blockDef);
                case "dropdownFilter":
                    return new dropdownFilter_1.DropdownFilterBlock(blockDef);
                case "button":
                    return new button_1.ButtonBlock(blockDef);
                case "saveCancel":
                    return new saveCancel_1.SaveCancelBlock(blockDef);
                case "rowset":
                    return new rowset_1.RowsetBlock(blockDef);
                case "row":
                    return new row_1.RowBlock(blockDef);
                case "addRow":
                    return new addRow_1.AddRowBlock(blockDef);
                case "tabbed":
                    return new tabbed_1.TabbedBlock(blockDef);
                case "image":
                    return new image_1.ImageBlock(blockDef);
                case "datefield":
                    return new datefield_1.DatefieldBlock(blockDef);
                case "toc":
                    return new toc_1.TOCBlock(blockDef);
                case "header":
                    return new header_1.HeaderBlock(blockDef);
                case "alert":
                    return new alert_1.AlertBlock(blockDef);
                case "validation":
                    return new validation_1.ValidationBlock(blockDef);
                case "float":
                    return new float_1.FloatBlock(blockDef);
                case "spacer":
                    return new spacer_1.SpacerBlock(blockDef);
                case "print":
                    return new print_1.PrintBlock(blockDef);
                case "queryRepeat":
                    return new queryRepeat_1.QueryRepeatBlock(blockDef);
                case "panel":
                    return new panel_1.PanelBlock(blockDef);
                case "dateInject":
                    return new dateInject_1.DateInjectBlock(blockDef);
                case "ganttChart":
                    return new GanttChart_1.GanttChartBlock(blockDef);
                case "toggleFilter":
                    return new toggleFilter_1.ToggleFilterBlock(blockDef);
                case "tagsEditor":
                    return new tagsEditor_1.TagsEditorBlock(blockDef);
                case "expressionFilter":
                    return new expressionFilter_1.ExpressionFilterBlock(blockDef);
            }
            // Use custom blocks
            if (this.customBlocks[blockDef.type]) {
                return this.customBlocks[blockDef.type](blockDef);
            }
            throw new Error(`Type ${blockDef.type} not found`);
        };
        this.customBlocks = {};
    }
    registerCustomBlock(type, factory) {
        this.customBlocks[type] = factory;
    }
}
exports.default = BlockFactory;
