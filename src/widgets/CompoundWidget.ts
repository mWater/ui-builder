import Expr from './Expr'
import { DropSide, Filter, RenderDesignProps, RenderEditorProps, RenderInstanceProps, Widget, WidgetDef, WidgetFactory } from './Widgets';

/* Widget which contains other widgets */
export default abstract class CompoundWidget implements Widget {
  widgetDef: WidgetDef
  widgetFactory: WidgetFactory

  constructor(widgetDef: WidgetDef, widgetFactory: WidgetFactory) {
    this.widgetDef = widgetDef;
    this.widgetFactory = widgetFactory;
  }

  get id() { return this.widgetDef.id; }

  async getInitialFilters(contextVarId: string): Promise<Filter[]> {
    let filters = [] as Filter[];
    for (const item of this.widgetDef.items) {
      const widget = this.widgetFactory(item);
      const subfilters = await widget.getInitialFilters(contextVarId);
      filters = filters.concat(subfilters);
    }
    return filters;
  }

  // abstract getChildWidgetDefs(): WidgetDef[];

  // abstract getContextVarExprs(contextVarId: string): Expr[];

  // abstract renderDesign(props: RenderDesignProps): React.ReactElement<any>; // TODO
  // abstract renderInstance(props: RenderInstanceProps): React.ReactElement<any>; // TODO
  // abstract renderEditor(props: RenderEditorProps): React.ReactElement<any> | null; // TODO

  // abstract clone(): WidgetDef;
  // abstract replaceWidget(widgetId: string, replacementWidgetDef: WidgetDef | null): WidgetDef | null;
  // abstract addWidget(addedWidgetDef: WidgetDef, parentWidgetId: string | null, parentWidgetSection: any): WidgetDef;
  // abstract dropWidget(droppedWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): WidgetDef;
}