import { HorizontalBlock, HorizontalBlockDef } from './blocks/horizontal';
import { BlockDef, Block } from './blocks';
import { VerticalBlock, VerticalBlockDef } from './blocks/vertical';
import { WidgetBlock, WidgetBlockDef } from './blocks/widget';
import { LookupWidget } from './widgets';
import { TextBlock, TextBlockDef } from './blocks/text';
import { LabeledBlock, LabeledBlockDef } from './blocks/labeled';
import { DropdownInputBlock, DropdownInputBlockDef } from './blocks/dropdownInput';
import { CollapsibleBlock, CollapsibleBlockDef } from './blocks/collapsible';
import { ExpressionBlock, ExpressionBlockDef } from './blocks/expression';
import { QueryTableBlock, QueryTableBlockDef } from './blocks/queryTable/queryTable';
import { SearchBlock, SearchBlockDef } from './blocks/search/search';
import { ButtonBlock, ButtonBlockDef } from './blocks/button';
import { TextboxBlock, TextboxBlockDef } from './blocks/controls/textbox';
import { SaveCancelBlock, SaveCancelBlockDef } from './blocks/saveCancel';

export default class BlockFactory {
  createBlock = (lookupWidget: LookupWidget, blockDef: BlockDef): Block<BlockDef> => {
    const internalCreateBlock = this.createBlock.bind(null, lookupWidget)
    switch (blockDef.type) {
      case "horizontal":
        return new HorizontalBlock(blockDef as HorizontalBlockDef, internalCreateBlock)
      case "vertical":
        return new VerticalBlock(blockDef as VerticalBlockDef, internalCreateBlock)
      case "widget":
        return new WidgetBlock(blockDef as WidgetBlockDef, internalCreateBlock, lookupWidget)
      case "text":
        return new TextBlock(blockDef as TextBlockDef)
      case "labeled":
        return new LabeledBlock(blockDef as LabeledBlockDef, internalCreateBlock)
      case "textbox":
        return new TextboxBlock(blockDef as TextboxBlockDef)
      case "dropdownInput":
        return new DropdownInputBlock(blockDef as DropdownInputBlockDef)
      case "collapsible":
        return new CollapsibleBlock(blockDef as CollapsibleBlockDef, internalCreateBlock)
      case "expression":
        return new ExpressionBlock(blockDef as ExpressionBlockDef)
      case "queryTable":
        return new QueryTableBlock(blockDef as QueryTableBlockDef, internalCreateBlock)
      case "search":
        return new SearchBlock(blockDef as SearchBlockDef)
      case "button":
        return new ButtonBlock(blockDef as ButtonBlockDef)
      case "saveCancel":
        return new SaveCancelBlock(blockDef as SaveCancelBlockDef, internalCreateBlock)
    }
    throw new Error("Type not found")
  }
}