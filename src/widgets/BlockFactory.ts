import { DropdownBlock, DropdownBlockDef } from './blocks/dropdownBlock'
import { HorizontalBlock, HorizontalBlockDef } from './blocks/horizontalBlock';
import { BlockDef, Block } from './blocks';
import { VerticalBlock, VerticalBlockDef } from './blocks/verticalBlock';
import { WidgetBlock, WidgetBlockDef } from './widgetBlock';
import { LookupWidget } from './widgets';
import { TextBlock, TextBlockDef } from './blocks/textBlock';
import { LabeledBlock, LabeledBlockDef } from './blocks/labeledBlock';

export default class BlockFactory {
  createBlock = (lookupWidget: LookupWidget, blockDef: BlockDef): Block => {
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
      case "dropdown":
        return new DropdownBlock(blockDef as DropdownBlockDef)
      case "labeled":
        return new LabeledBlock(blockDef as LabeledBlockDef, internalCreateBlock)
    }
    throw new Error("Type not found")
  }
}