import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import { Toggle } from 'react-library/lib/bootstrap';
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { DesignCtx, InstanceCtx } from '../../contexts';

export interface HorizontalBlockDef extends BlockDef {
  type: "horizontal"

  items: BlockDef[]

  /** How to align child blocks */
  align: "justify" | "right" | "left" | "center"
}

export class HorizontalBlock extends Block<HorizontalBlockDef> {
  get id() { return this.blockDef.id }

  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.items.map(bd => ({ blockDef: bd, contextVars: contextVars }))
  }

  validate() { return null }
 
  canonicalize(): BlockDef | null {
    // Remove if zero items
    if (this.blockDef.items.length === 0) {
      return null
    }
    // Collapse if one item
    if (this.blockDef.items.length === 1) {
      return this.blockDef.items[0]
    }
    // Flatten out nested horizontal blocks
    return produce(this.blockDef, (draft) => {
      draft.items = draft.items.map(item => item.type === "horizontal" ? item.items : item).reduce((a, b) => a.concat(b), [])
    })
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const newItems: BlockDef[] = []
    for (const item of this.blockDef.items) {
      const newItem = action(item)
      if (newItem) {
        newItems.push(newItem)
      }
    }

    // Apply action to all children, discarding null ones
    return produce(this.blockDef, draft => { draft.items = newItems })
  }

  renderBlock(children: React.ReactNode[]) {
    switch (this.blockDef.align || "justify") {
      case "justify":
        return (
          <div>
            { children.map((child, index) => {
              return (
                <div key={index} style={{ display: "inline-block", width: (100/children.length) + "%", verticalAlign: "top" }}>
                  {child}
                </div>
              )})
            }
          </div>
        )
      case "left":
        return (
          <div>
            { children.map((child, index) => {
              return (
                <div key={index} style={{ display: "inline-block", verticalAlign: "top" }}>
                  {child}
                </div>
              )})
            }
          </div>
        )
      case "right":
        return (
          <div style={{ textAlign: "right" }}>
            { children.map((child, index) => {
              return (
                <div key={index} style={{ display: "inline-block", verticalAlign: "top" }}>
                  {child}
                </div>
              )})
            }
          </div>
        )
      case "center":
        return (
          <div style={{ textAlign: "center" }}>
            { children.map((child, index) => {
              return (
                <div key={index} style={{ display: "inline-block", verticalAlign: "top" }}>
                  {child}
                </div>
              )})
            }
          </div>
        )
    }
  }

  renderDesign(props: DesignCtx) {
    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        { this.renderBlock(this.blockDef.items.map(childBlock => props.renderChildBlock(props, childBlock))) }
      </div>
    )
  }

  renderInstance(props: InstanceCtx) {
    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        { this.renderBlock(this.blockDef.items.map(childBlockDef => props.renderChildBlock(props, childBlockDef))) }
      </div>
    )
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Alignment">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="align">
            {(value, onChange) => 
              <Toggle 
                value={value || "justify"} 
                onChange={onChange} 
                options={[
                  { value: "justify", label: <i className="fa fa-align-justify"/> },
                  { value: "left", label: <i className="fa fa-align-left"/> },
                  { value: "center", label: <i className="fa fa-align-center"/> },
                  { value: "right", label: <i className="fa fa-align-right"/> }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }

  getLabel() { return "" } 
}
