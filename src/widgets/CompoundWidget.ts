import { Filter, Widget, WidgetDef, WidgetFactory } from './Widgets';

/* Widget which contains other widgets */
export default abstract class CompoundWidget extends Widget {
  widgetFactory: WidgetFactory

  constructor(widgetDef: WidgetDef, widgetFactory: WidgetFactory) {
    super(widgetDef)
    this.widgetFactory = widgetFactory;
  }

  async getInitialFilters(contextVarId: string): Promise<Filter[]> {
    let filters = [] as Filter[];
    for (const item of this.widgetDef.items) {
      const widget = this.widgetFactory(item);
      const subfilters = await widget.getInitialFilters(contextVarId);
      filters = filters.concat(subfilters);
    }
    return filters;
  }
}