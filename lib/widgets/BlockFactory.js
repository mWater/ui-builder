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
var toc_1 = require("./blocks/toc");
var BlockFactory = /** @class */ (function () {
    function BlockFactory() {
        var _this = this;
        this.createBlock = function (blockDef) {
            switch (blockDef.type) {
                case "horizontal":
                    return new horizontal_1.HorizontalBlock(blockDef, _this.createBlock);
                case "vertical":
                    return new vertical_1.VerticalBlock(blockDef, _this.createBlock);
                case "widget":
                    return new widget_1.WidgetBlock(blockDef, _this.createBlock);
                case "text":
                    return new text_1.TextBlock(blockDef);
                case "labeled":
                    return new labeled_1.LabeledBlock(blockDef, _this.createBlock);
                case "textbox":
                    return new textbox_1.TextboxBlock(blockDef);
                case "dropdown":
                    return new dropdown_1.DropdownBlock(blockDef);
                case "collapsible":
                    return new collapsible_1.CollapsibleBlock(blockDef, _this.createBlock);
                case "expression":
                    return new expression_1.ExpressionBlock(blockDef);
                case "conditional":
                    return new conditional_1.ConditionalBlock(blockDef, _this.createBlock);
                case "queryTable":
                    return new queryTable_1.QueryTableBlock(blockDef, _this.createBlock);
                case "fixedTable":
                    return new fixedTable_1.FixedTableBlock(blockDef, _this.createBlock);
                case "search":
                    return new search_1.SearchBlock(blockDef);
                case "dropdownFilter":
                    return new dropdownFilter_1.DropdownFilterBlock(blockDef);
                case "button":
                    return new button_1.ButtonBlock(blockDef);
                case "saveCancel":
                    return new saveCancel_1.SaveCancelBlock(blockDef, _this.createBlock);
                case "rowset":
                    return new rowset_1.RowsetBlock(blockDef, _this.createBlock);
                case "addRow":
                    return new addRow_1.AddRowBlock(blockDef, _this.createBlock);
                case "tabbed":
                    return new tabbed_1.TabbedBlock(blockDef, _this.createBlock);
                case "image":
                    return new image_1.ImageBlock(blockDef);
                case "datefield":
                    return new datefield_1.DatefieldBlock(blockDef);
                case "toc":
                    return new toc_1.TOCBlock(blockDef, _this.createBlock);
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
