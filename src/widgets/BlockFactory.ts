import { HorizontalBlock, HorizontalBlockDef } from './blocks/horizontal';
import { BlockDef, Block } from './blocks';
import { VerticalBlock, VerticalBlockDef } from './blocks/vertical';
import { WidgetBlock, WidgetBlockDef } from './blocks/widget';
import { LookupWidget } from './widgets';
import { TextBlock, TextBlockDef } from './blocks/text';
import { LabeledBlock, LabeledBlockDef } from './blocks/labeled';
import { CollapsibleBlock, CollapsibleBlockDef } from './blocks/collapsible';
import { ExpressionBlock, ExpressionBlockDef } from './blocks/expression';
import { QueryTableBlock, QueryTableBlockDef } from './blocks/queryTable/queryTable';
import { SearchBlock, SearchBlockDef } from './blocks/search/search';
import { ButtonBlock, ButtonBlockDef } from './blocks/button';
import { TextboxBlock, TextboxBlockDef } from './blocks/controls/textbox';
import { SaveCancelBlock, SaveCancelBlockDef } from './blocks/saveCancel';
import { DropdownBlock, DropdownBlockDef } from './blocks/controls/dropdown';
import { DropdownFilterBlock, DropdownFilterBlockDef } from './blocks/dropdownFilter';
import { RowsetBlock, RowsetBlockDef } from './blocks/rowset';

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
      case "horizontal":
        return new HorizontalBlock(blockDef as HorizontalBlockDef, this.createBlock)
      case "vertical":
        return new VerticalBlock(blockDef as VerticalBlockDef, this.createBlock)
      case "widget":
        return new WidgetBlock(blockDef as WidgetBlockDef, this.createBlock)
      case "text":
        return new TextBlock(blockDef as TextBlockDef)
      case "labeled":
        return new LabeledBlock(blockDef as LabeledBlockDef, this.createBlock)
      case "textbox":
        return new TextboxBlock(blockDef as TextboxBlockDef)
      case "dropdown":
        return new DropdownBlock(blockDef as DropdownBlockDef)
      case "collapsible":
        return new CollapsibleBlock(blockDef as CollapsibleBlockDef, this.createBlock)
      case "expression":
        return new ExpressionBlock(blockDef as ExpressionBlockDef)
      case "queryTable":
        return new QueryTableBlock(blockDef as QueryTableBlockDef, this.createBlock)
      case "search":
        return new SearchBlock(blockDef as SearchBlockDef)
      case "dropdownFilter":
        return new DropdownFilterBlock(blockDef as DropdownFilterBlockDef)
      case "button":
        return new ButtonBlock(blockDef as ButtonBlockDef)
      case "saveCancel":
        return new SaveCancelBlock(blockDef as SaveCancelBlockDef, this.createBlock)
      case "rowset":
        return new RowsetBlock(blockDef as RowsetBlockDef, this.createBlock)
    }

    // Use custom blocks
    if (this.customBlocks[blockDef.type]) {
      return this.customBlocks[blockDef.type](blockDef)
    }

    throw new Error(`Type ${blockDef.type} not found`)
  }
}