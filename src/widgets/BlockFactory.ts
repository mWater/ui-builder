import { DropdownBlock, DropdownBlockDef } from './blocks/dropdownBlock'
import { HorizontalBlock, HorizontalBlockDef } from './blocks/horizontalBlock';
import { BlockDef, Block } from './blocks';
import { VerticalBlock, VerticalBlockDef } from './blocks/verticalBlock';
import { WidgetBlock, WidgetBlockDef } from './widgetBlock';
import { LookupWidget } from './widgets';
import { TextBlock, TextBlockDef } from './blocks/textBlock';
import { LabeledBlock, LabeledBlockDef } from './blocks/labeledBlock';

export default class BlockFactory {
  lookupWidget: LookupWidget

  constructor(lookupWidget: LookupWidget) {
    this.lookupWidget = lookupWidget
  }

  createBlock = (blockDef: BlockDef): Block => {
    switch (blockDef.type) {
      case "horizontal":
        return new HorizontalBlock(blockDef as HorizontalBlockDef, this.createBlock)
      case "vertical":
        return new VerticalBlock(blockDef as VerticalBlockDef, this.createBlock)
      case "widget":
        return new WidgetBlock(blockDef as WidgetBlockDef, this.createBlock, this.lookupWidget)
      case "text":
        return new TextBlock(blockDef as TextBlockDef)
      case "dropdown":
        return new DropdownBlock(blockDef as DropdownBlockDef)
      case "labeled":
        return new LabeledBlock(blockDef as LabeledBlockDef, this.createBlock)
    }
    throw new Error("Type not found")
  }
}