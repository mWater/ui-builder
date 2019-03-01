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
class BlockFactory {
    constructor() {
        this.createBlock = (blockDef) => {
            switch (blockDef.type) {
                case "horizontal":
                    return new horizontal_1.HorizontalBlock(blockDef, this.createBlock);
                case "vertical":
                    return new vertical_1.VerticalBlock(blockDef, this.createBlock);
                case "widget":
                    return new widget_1.WidgetBlock(blockDef, this.createBlock);
                case "text":
                    return new text_1.TextBlock(blockDef);
                case "labeled":
                    return new labeled_1.LabeledBlock(blockDef, this.createBlock);
                case "textbox":
                    return new textbox_1.TextboxBlock(blockDef);
                case "dropdown":
                    return new dropdown_1.DropdownBlock(blockDef);
                case "collapsible":
                    return new collapsible_1.CollapsibleBlock(blockDef, this.createBlock);
                case "expression":
                    return new expression_1.ExpressionBlock(blockDef);
                case "conditional":
                    return new conditional_1.ConditionalBlock(blockDef, this.createBlock);
                case "queryTable":
                    return new queryTable_1.QueryTableBlock(blockDef, this.createBlock);
                case "fixedTable":
                    return new fixedTable_1.FixedTableBlock(blockDef, this.createBlock);
                case "search":
                    return new search_1.SearchBlock(blockDef);
                case "dropdownFilter":
                    return new dropdownFilter_1.DropdownFilterBlock(blockDef);
                case "button":
                    return new button_1.ButtonBlock(blockDef);
                case "saveCancel":
                    return new saveCancel_1.SaveCancelBlock(blockDef, this.createBlock);
                case "rowset":
                    return new rowset_1.RowsetBlock(blockDef, this.createBlock);
                case "addRow":
                    return new addRow_1.AddRowBlock(blockDef, this.createBlock);
                case "tabbed":
                    return new tabbed_1.TabbedBlock(blockDef, this.createBlock);
                case "image":
                    return new image_1.ImageBlock(blockDef);
                case "datefield":
                    return new datefield_1.DatefieldBlock(blockDef);
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
//# sourceMappingURL=BlockFactory.js.map