import * as uuid from 'uuid/v4'
import { DropSide, dropWidget, Filter, Widget, WidgetDef } from './Widgets';

export default abstract class LeafWidget extends Widget {
  getChildWidgetDefs() { return [] }

  async getInitialFilters(): Promise<Filter[]> { return [] }

  clone() { 
    return Object.assign({}, this.widgetDef, { id: uuid() }) 
  }

  addWidget(): WidgetDef {
    throw new Error("Cannot add to leaf widget")
  }

  replaceWidget(widgetId: string, replacementWidgetDef: WidgetDef | null) {
    return (widgetId === this.id) ? replacementWidgetDef : this.widgetDef
  }

  dropWidget(droppedWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): WidgetDef {
    if (targetWidgetId === this.id) {
      return dropWidget(droppedWidgetDef, this.widgetDef, dropSide)
    }
    return this.widgetDef
  }
}
