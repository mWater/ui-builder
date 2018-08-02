import produce from 'immer'
import * as React from 'react';
import * as uuid from 'uuid/v4'
import CompoundWidget from './CompoundWidget';
import { DropSide, dropWidget, RenderDesignProps, RenderEditorProps, RenderInstanceProps, WidgetDef, WidgetFactory } from './Widgets'

export interface HorizontalWidgetDef extends WidgetDef {
  items: WidgetDef[]
}

export class HorizontalWidget extends CompoundWidget {
  widgetDef: HorizontalWidgetDef
  widgetFactory: WidgetFactory

  constructor(widgetDef: HorizontalWidgetDef, widgetFactory: WidgetFactory) {
    super(widgetDef, widgetFactory)
  }

  get id() { return this.widgetDef.id }

  getChildWidgetDefs(): WidgetDef[] {
    return this.widgetDef.items
  }
 
  getContextVarExprs(contextVarId: string) { return [] }

  clone(): WidgetDef {
    return produce(this.widgetDef, draft => {
      draft.id = uuid()

      for (let i = 0; i< draft.items.length; i++) {
        draft.items[i] = this.widgetFactory(draft.items[i]).clone()
      }
    })
  }

  replaceWidget(widgetId: string, replacementWidgetDef: WidgetDef | null): WidgetDef | null {
    if (widgetId === this.id) {
      return replacementWidgetDef
    }

    return produce(this.widgetDef as WidgetDef, d => {
      const draft = d as HorizontalWidgetDef

      for (let i = draft.items.length - 1; i >= 0 ; i--) {
        const childWidget = this.widgetFactory(draft.items[i]).replaceWidget(widgetId, replacementWidgetDef)
        if (childWidget) {
          draft.items[i] = childWidget
        }
        else if (draft.items.length > 1) {
          draft.items.splice(i, 1)
        }
        else {
          return draft.items[(i === 0) ? 1 : 0]
        }
      }
      return
    })
  }

  addWidget(addedWidgetDef: WidgetDef, parentWidgetId: string | null, parentWidgetSection: any): WidgetDef {
    throw new Error("Not applicable");
  }

  dropWidget(droppedWidgetDef: WidgetDef, targetWidgetId: string, dropSide: DropSide): WidgetDef {
    // If self
    if (targetWidgetId === this.id) {
      return dropWidget(droppedWidgetDef, this.widgetDef, dropSide)
    }

    return produce(this.widgetDef, draft => {
      for (let i = 0; i < draft.items.length; i++) {
        // Insert if dropped left or right
        if ((dropSide === DropSide.left) && (draft.items[i].id === targetWidgetId)) {
          draft.items.splice(i, 0, droppedWidgetDef)
          return
        }
        else if ((dropSide === DropSide.right) && (draft.items[i].id === targetWidgetId)) {
          draft.items.splice(i + 1, 0, droppedWidgetDef)
          return
        }
        else {
          draft.items[i] = this.widgetFactory(draft.items[i]).dropWidget(droppedWidgetDef, targetWidgetId, dropSide)
        }
      }
    })
  }

  renderChildDesigner(props: RenderDesignProps, childWidgetDef: WidgetDef) {
    const childWidget = this.widgetFactory(childWidgetDef)

    return (
      <div style={{ display: "inline-block", width: (100/this.widgetDef.items.length) + "%" }}>
        { childWidget.renderDesign(props) }
      </div>
    )
  }

  renderDesign(props: RenderDesignProps) {
    return (
      <div>
        { this.widgetDef.items.map(childWidget => this.renderChildDesigner(props, childWidget)) }
      </div>
    )      
  }

  renderInstance(props: RenderInstanceProps) {
    return <div/>
  }
  
  renderEditor(props: RenderEditorProps) {
    return null
  }
}