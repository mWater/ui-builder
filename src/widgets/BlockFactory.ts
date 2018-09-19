import { HorizontalBlock, HorizontalBlockDef } from './blocks/horizontal';
import { BlockDef, Block } from './blocks';
import { VerticalBlock, VerticalBlockDef } from './blocks/vertical';
import { WidgetBlock, WidgetBlockDef } from './blocks/widget';
import { LookupWidget } from './widgets';
import { TextBlock, TextBlockDef } from './blocks/text';
import { LabeledBlock, LabeledBlockDef } from './blocks/labeled';
import { TextInputBlock, TextInputBlockDef } from './blocks/textInput';
import { DropdownInputBlock, DropdownInputBlockDef } from './blocks/dropdownInput';
import { CollapsibleBlock, CollapsibleBlockDef } from './blocks/collapsible';
import { ExpressionBlock, ExpressionBlockDef } from './blocks/expression';
import { QueryTableBlock, QueryTableBlockDef } from './blocks/queryTable/queryTable';
import { SearchBlock, SearchBlockDef } from './blocks/search';
import { ButtonBlock, ButtonBlockDef } from './blocks/button';

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
      case "textInput":
        return new TextInputBlock(blockDef as TextInputBlockDef)
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
    }
    throw new Error("Type not found")
  }
}