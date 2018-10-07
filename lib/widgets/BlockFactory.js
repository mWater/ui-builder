import { HorizontalBlock } from './blocks/horizontal';
import { VerticalBlock } from './blocks/vertical';
import { WidgetBlock } from './blocks/widget';
import { TextBlock } from './blocks/text';
import { LabeledBlock } from './blocks/labeled';
import { CollapsibleBlock } from './blocks/collapsible';
import { ExpressionBlock } from './blocks/expression';
import { QueryTableBlock } from './blocks/queryTable/queryTable';
import { SearchBlock } from './blocks/search/search';
import { ButtonBlock } from './blocks/button';
import { TextboxBlock } from './blocks/controls/textbox';
import { SaveCancelBlock } from './blocks/saveCancel';
import { DropdownBlock } from './blocks/controls/dropdown';
import { DropdownFilterBlock } from './blocks/dropdownFilter';
export default class BlockFactory {
    constructor() {
        this.createBlock = (blockDef) => {
            switch (blockDef.type) {
                case "horizontal":
                    return new HorizontalBlock(blockDef, this.createBlock);
                case "vertical":
                    return new VerticalBlock(blockDef, this.createBlock);
                case "widget":
                    return new WidgetBlock(blockDef, this.createBlock);
                case "text":
                    return new TextBlock(blockDef);
                case "labeled":
                    return new LabeledBlock(blockDef, this.createBlock);
                case "textbox":
                    return new TextboxBlock(blockDef);
                case "dropdown":
                    return new DropdownBlock(blockDef);
                case "collapsible":
                    return new CollapsibleBlock(blockDef, this.createBlock);
                case "expression":
                    return new ExpressionBlock(blockDef);
                case "queryTable":
                    return new QueryTableBlock(blockDef, this.createBlock);
                case "search":
                    return new SearchBlock(blockDef);
                case "dropdownFilter":
                    return new DropdownFilterBlock(blockDef);
                case "button":
                    return new ButtonBlock(blockDef);
                case "saveCancel":
                    return new SaveCancelBlock(blockDef, this.createBlock);
            }
            throw new Error(`Type ${blockDef.type} not found`);
        };
    }
}
//# sourceMappingURL=BlockFactory.js.map