"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var horizontal_1 = require("./blocks/horizontal");
var vertical_1 = require("./blocks/vertical");
var widget_1 = require("./blocks/widget");
var text_1 = require("./blocks/text");
var labeled_1 = require("./blocks/labeled");
var collapsible_1 = require("./blocks/collapsible");
var expression_1 = require("./blocks/expression");
var queryTable_1 = require("./blocks/queryTable/queryTable");
var search_1 = require("./blocks/search/search");
var button_1 = require("./blocks/button");
var textbox_1 = require("./blocks/controls/textbox");
var saveCancel_1 = require("./blocks/saveCancel");
var dropdown_1 = require("./blocks/controls/dropdown");
var dropdownFilter_1 = require("./blocks/dropdownFilter/dropdownFilter");
var rowset_1 = require("./blocks/rowset");
var tabbed_1 = require("./blocks/tabbed/tabbed");
var image_1 = require("./blocks/image");
var addRow_1 = require("./blocks/addRow");
var datefield_1 = require("./blocks/controls/datefield");
var conditional_1 = require("./blocks/conditional");
var fixedTable_1 = require("./blocks/fixedTable");
var addWizard_1 = require("./blocks/addWizard");
var numberbox_1 = require("./blocks/controls/numberbox");
var header_1 = require("./blocks/header");
var toc_1 = require("./blocks/toc/toc");
var validation_1 = require("./blocks/validation");
var float_1 = require("./blocks/float");
var spacer_1 = require("./blocks/spacer");
var print_1 = require("./blocks/print");
var queryRepeat_1 = require("./blocks/queryRepeat/queryRepeat");
var row_1 = require("./blocks/row");
var panel_1 = require("./blocks/panel");
var alert_1 = require("./blocks/alert");
var dateInject_1 = require("./blocks/dateInject");
var toggle_1 = require("./blocks/controls/toggle");
var BlockFactory = /** @class */ (function () {
    function BlockFactory() {
        var _this = this;
        this.createBlock = function (blockDef) {
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
            }
            // Use custom blocks
            if (_this.customBlocks[blockDef.type]) {
                return _this.customBlocks[blockDef.type](blockDef);
            }
            throw new Error("Type " + blockDef.type + " not found");
        };
        this.customBlocks = {};
    }
    BlockFactory.prototype.registerCustomBlock = function (type, factory) {
        this.customBlocks[type] = factory;
    };
    return BlockFactory;
}());
exports.default = BlockFactory;
