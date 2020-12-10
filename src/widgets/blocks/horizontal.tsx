import _ from 'lodash'
import produce from 'immer'
import React from 'react'
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import { Toggle, Select } from 'react-library/lib/bootstrap';
import { LabeledProperty, PropertyEditor } from '../propertyEditors'
import { DesignCtx, InstanceCtx } from '../../contexts'
import { CSSProperties } from 'react'
import AutoSizeComponent from 'react-library/lib/AutoSizeComponent'

export interface HorizontalBlockDef extends BlockDef {
  type: "horizontal"

  items: BlockDef[]

  /** How to align child blocks. Default is "justify" */
  align?: "justify" | "right" | "left" | "center"

  /** How to vertically align child blocks. Default is top */
  verticalAlign?: "top" | "middle" | "bottom"

  /** Column widths in CSS grid format (e.g. "min-content", "50%", "30px") 
   * If not present, defaults to 1fr for justify, auto otherwise.
   */
  columnWidths?: string[]

  /** Responsive breaks. Array with one entry for each gap (e.g. entry 0 is for gap between column 0 and 1, etc.) 
   * If present, is the width of the horizontal block at which a line break is added
  */
  responsiveBreaks?: (number | null)[]
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
    if (this.blockDef.items.some(bd => bd.type == "horizontal")) {
      // Create list of items
      let newItems: BlockDef[] = []
      for (const item of this.blockDef.items) {
        if (item.type == "horizontal") {
          newItems = newItems.concat((item as HorizontalBlockDef).items)
        }
        else {
          newItems.push(item)
        }
      }
      return produce(this.blockDef, (draft) => {
        draft.items = newItems
      })
    }

    return this.blockDef
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

  renderBlock(children: React.ReactNode[], width: number) {
    const align = this.blockDef.align || "justify"
    const columnWidths = this.blockDef.columnWidths || []
    const responsiveBreaks = this.blockDef.responsiveBreaks || []

    // Determine alignment (vertical)
    let alignItems: "start" | "center" | "end" = "start"
    if (this.blockDef.verticalAlign == "middle") {
      alignItems = "center"
    }
    else if (this.blockDef.verticalAlign == "bottom") {
      alignItems = "end"
    }

    // Break items into rows based on responsive breaks
    const rows: React.ReactNode[] = []
    
    let rowItems: React.ReactNode[] = []
    let rowColumns: string[] = []

    const addRow = () => {
      // Create CSS grid with style
      const containerStyle: CSSProperties = {
        display: "grid",
        gridGap: 5,
        gridTemplateColumns: rowColumns.join(" "), 
        justifyContent: this.blockDef.align,
        alignItems
      }

      rows.push(<div style={containerStyle}>
        { rowItems.map((child, index) => <React.Fragment key={index}>{child}</React.Fragment>) }
      </div>)

      rowItems = []
      rowColumns = []
    }

    for (let index = 0 ; index < children.length ; index++) {
      // Determine if break before
      if (index > 0 && responsiveBreaks[index - 1] && responsiveBreaks[index - 1]! > width) {
        // Add break
        addRow()
      }

      // Add item
      rowItems.push(children[index])
      rowColumns.push(align == "justify" ? columnWidths[index] || "1fr" : columnWidths[index] || "auto")
    }
    addRow()

    return <div>
      { rows }
    </div>
  }

  renderDesign(props: DesignCtx) {
    return (
      <AutoSizeComponent injectWidth>
        { size => (
          <div style={{ paddingTop: 5, paddingBottom: 5 }}>
            { this.renderBlock(this.blockDef.items.map(childBlock => props.renderChildBlock(props, childBlock)), size.width!) }
          </div>
        )}
      </AutoSizeComponent>
    )
  }

  renderInstance(props: InstanceCtx) {
    return (
      <AutoSizeComponent injectWidth>
        { size => this.renderBlock(this.blockDef.items.map(childBlockDef => props.renderChildBlock(props, childBlockDef)), size.width!) }
      </AutoSizeComponent>
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
                defaultWidth={align == "justify" ? "1fr" : "auto"}
                columnWidths={value || []} 
                onChange={onChange} />
            }
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Responsive Breaks">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="responsiveBreaks">
            {(value, onChange) => 
              <ResponsiveBreaksEditor 
                numBreaks={this.blockDef.items.length - 1}
                breaks={value || []} 
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
            label={`#${colIndex + 1}:`}
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

function ColumnWidthEditor(props: {
  label: string
  columnWidth: string
  onChange: (columnWidth: string) => void
}) {
  return <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", columnGap: 5 }}>
    <div>{ props.label }</div>
    <Select
      value={props.columnWidth}
      onChange={props.onChange}
      options={
        [
          { value: "auto", label: "Auto" },
          { value: "min-content", label: "Small as possible" },
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
          { value: "minmax(min-content, 500px)", label: "500px" },
          { value: "minmax(min-content, 600px)", label: "600px" },
          { value: "minmax(min-content, 700px)", label: "700px" },
          { value: "minmax(min-content, 800px)", label: "800px" }
        ]
      }
    />
  </div>
}

const ResponsiveBreaksEditor = (props: {
  numBreaks: number
  breaks: (number | null)[]
  onChange: (breaks: (number | null)[]) => void
}) => {
  return <ul className="list-group">
    {
      _.range(props.numBreaks).map((breakIndex) => {
        return <li className="list-group-item" key={breakIndex}>
          <ResponsiveBreakEditor 
            label={`${breakIndex + 1} / ${breakIndex + 2}:`}
            width={props.breaks[breakIndex] || null}
            onChange={width => props.onChange(produce(props.breaks, draft => {
              draft[breakIndex] = width
            }))}
          />
        </li>
      })
    }
  </ul>
}

function ResponsiveBreakEditor(props: {
  label: string
  width: number | null
  onChange: (width: number | null) => void
}) {
  return <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", columnGap: 5 }}>
    <div>{ props.label }</div>
    <Select
      value={props.width}
      onChange={props.onChange}
      nullLabel="Never break"
      options={
        [
          { value: 100, label: "< 100px" },
          { value: 200, label: "< 200px" },
          { value: 300, label: "< 300px" },
          { value: 400, label: "< 400px" },
          { value: 500, label: "< 500px" },
          { value: 600, label: "< 600px" },
          { value: 700, label: "< 700px" },
          { value: 800, label: "< 800px" },
          { value: 900, label: "< 900px" },
          { value: 1000, label: "< 1000px" },
          { value: 1100, label: "< 1100px" },
          { value: 1200, label: "< 1200px" }
        ]
      }
    />
  </div>
}

