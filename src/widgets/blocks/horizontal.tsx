import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import { Toggle } from 'react-library/lib/bootstrap';
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { CSSProperties } from 'react';

export interface HorizontalBlockDef extends BlockDef {
  type: "horizontal"

  items: BlockDef[]

  /** How to align child blocks. Default is "justify" */
  align?: "justify" | "right" | "left" | "center"

  /** How to vertically align child blocks. Default is top */
  verticalAlign?: "top" | "middle" | "bottom"
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
      const items = draft.items.map(item => item.type === "horizontal" ? (item as HorizontalBlockDef).items : item)
      draft.items = items.reduce((a: BlockDef[], b) => a.concat(b), []) as BlockDef[]
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
              const style: CSSProperties = { 
                display: "inline-block", 
                width: (100/children.length) + "%", 
                verticalAlign: this.blockDef.verticalAlign || "top" 
              }
              if (index > 0) {
                style.paddingLeft = 5
              }

              return (
                <div key={index} style={style}>
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
              const style: CSSProperties = { 
                display: "inline-block", 
                verticalAlign: this.blockDef.verticalAlign || "top"
              }
              if (index > 0) {
                style.paddingLeft = 5
              }

              return (
                <div key={index} style={style}>
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
              const style: CSSProperties = { 
                display: "inline-block", 
                verticalAlign: this.blockDef.verticalAlign || "top"
              }
              if (index > 0) {
                style.paddingLeft = 5
              }

              return (
                <div key={index} style={style}>
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
              const style: CSSProperties = { 
                display: "inline-block", 
                verticalAlign: this.blockDef.verticalAlign || "top"
              }
              if (index > 0) {
                style.paddingLeft = 5
              }

              return (
                <div key={index} style={style}>
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
        <LabeledProperty label="Horizontal Alignment">
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

        <LabeledProperty label="Vertical Alignment">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="verticalAlign">
            {(value, onChange) => 
              <Toggle 
                value={value || "top"} 
                onChange={onChange} 
                options={[
                  { value: "top", label: "Top" },
                  { value: "middle", label: "Middle" },
                  { value: "bottom", label: "Bottom" }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }

  getLabel() { return "" } 
}
