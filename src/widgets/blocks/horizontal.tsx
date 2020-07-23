import _ from 'lodash'
import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import { Toggle, Select } from 'react-library/lib/bootstrap';
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

  /** Column widths in CSS grid format (e.g. "min-content", "50%", "30px") 
   * If not present, defaults to 1fr for justify, min-content otherwise.
   */
  columnWidths?: string[]
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
    const align = this.blockDef.align || "justify"
    const columnWidths = this.blockDef.columnWidths || []

    // Create columns
    const gridTemplateColumns = this.blockDef.items.map((item, index) => {
      if (align == "justify") {
        return columnWidths[index] || "1fr"
      }
      return columnWidths[index] || "min-content"
    })

    // Create CSS grid with style
    const containerStyle: CSSProperties = {
      display: "grid",
      gridGap: 5,
      gridTemplateColumns: gridTemplateColumns.join(" "), 
      justifyContent: this.blockDef.align,
    }
    if (this.blockDef.verticalAlign == "middle") {
      containerStyle.alignItems = "center"
    }
    else if (this.blockDef.verticalAlign == "bottom") {
      containerStyle.alignItems = "end"
    }
    else {
      containerStyle.alignItems = "start"
    }

    return <div style={containerStyle}>
      { children.map((child, index) => <React.Fragment key={index}>{child}</React.Fragment>) }
    </div>
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
      <div>
        { this.renderBlock(this.blockDef.items.map(childBlockDef => props.renderChildBlock(props, childBlockDef))) }
      </div>
    )
  }

  renderEditor(props: DesignCtx) {
    const align = this.blockDef.align || "justify"

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

        <LabeledProperty label="Column Widths">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="columnWidths">
            {(value, onChange) => 
              <ColumnWidthsEditor 
                numColumns={this.blockDef.items.length}
                defaultWidth={align == "justify" ? "1fr" : "min-content"}
                columnWidths={value || []} 
                onChange={onChange} />
            }
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }

  getLabel() { return "" } 
}

const ColumnWidthsEditor = (props: {
  numColumns: number
  defaultWidth: string
  columnWidths: string[]
  onChange: (columnWidths: string[]) => void
}) => {
  return <ul className="list-group">
    {
      _.range(props.numColumns).map((colIndex) => {

        return <li className="list-group-item" key={colIndex}>
          <ColumnWidthEditor 
            columnWidth={props.columnWidths[colIndex] || props.defaultWidth}
            onChange={width => props.onChange(produce(props.columnWidths, draft => {
              draft[colIndex] = width
            }))}
          />
        </li>
      })
    }
  </ul>
}

const ColumnWidthEditor = (props: {
  columnWidth: string
  onChange: (columnWidth: string) => void
}) => {
  return <Select
    value={props.columnWidth}
    onChange={props.onChange}
    options={
      [
        { value: "min-content", label: "Fit" },
        { value: "1fr", label: "1 fraction" },
        { value: "2fr", label: "2 fraction" },
        { value: "3fr", label: "3 fraction" },
        { value: "minmax(min-content, 16%)", label: "1/6" },
        { value: "minmax(min-content, 25%)", label: "1/4" },
        { value: "minmax(min-content, 33%)", label: "1/3" },
        { value: "minmax(min-content, 50%)", label: "1/2" },
        { value: "minmax(min-content, 67%)", label: "2/3" },
        { value: "minmax(min-content, 75%)", label: "3/4" },
        { value: "minmax(min-content, 83%)", label: "5/6" },
        { value: "minmax(min-content, 100px)", label: "100px" },
        { value: "minmax(min-content, 200px)", label: "200px" },
        { value: "minmax(min-content, 300px)", label: "300px" },
        { value: "minmax(min-content, 400px)", label: "400px" },
        { value: "minmax(min-content, 500px)", label: "500px" }
      ]
    }
  />
}