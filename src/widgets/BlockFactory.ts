import { DropdownBlock, DropdownBlockDef } from './dropdownBlock'
import { HorizontalBlock, HorizontalBlockDef } from './horizontalBlock';
import { BlockDef, Block } from './blocks';
import { VerticalBlock, VerticalBlockDef } from './verticalBlock';
import { WidgetBlock, WidgetBlockDef } from './widgetBlock';
import { LookupWidget } from './widgets';
import { TextBlock, TextBlockDef } from './textBlock';

export default class BlockFactory {
  lookupWidget: LookupWidget

  constructor(lookupWidget: LookupWidget) {
    this.lookupWidget = lookupWidget
  }

  createBlock = (blockDef: BlockDef): Block => {
    if (blockDef.type === "horizontal") {
      return new HorizontalBlock(blockDef as HorizontalBlockDef, this.createBlock)
    }
    if (blockDef.type === "vertical") {
      return new VerticalBlock(blockDef as VerticalBlockDef, this.createBlock)
    }
    if (blockDef.type === "widget") {
      return new WidgetBlock(blockDef as WidgetBlockDef, this.createBlock, this.lookupWidget)
    }
    if (blockDef.type === "text") {
      return new TextBlock(blockDef as TextBlockDef)
    }


    if (blockDef.type === "dropdown") {
      return new DropdownBlock(blockDef as DropdownBlockDef)
    }

    throw new Error("Type not found")
  }
}