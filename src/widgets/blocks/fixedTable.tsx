import * as React from 'react';
import * as _ from 'lodash';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import { LabeledProperty, PropertyEditor, TableColumnWidthEditor } from '../propertyEditors';
import { NumberInput, Select, Toggle } from 'react-library/lib/bootstrap';
import produce from 'immer';
import { DesignCtx, InstanceCtx } from '../../contexts';

/** Table with a fixed number of rows and columns */
export interface FixedTableBlockDef extends BlockDef {
  type: "fixedTable"

  /** Borders (default is "horizontal") */
  borders?: "horizontal" | "all" | "none"

  /** Table padding (default is "normal") */
  padding?: "normal" | "compact"

  /** Number of rows in the table */
  numRows: number

  /** Number of columns in the table */
  numColumns: number

  /** Rows of the table */
  rows: FixedTableRowDef[]

  /** Columns of the table (not the blocks, just information) */
  columns?: FixedTableColumnDef[]
}

/** Single row of a table */
interface FixedTableRowDef {
  /** Cells of the row */
  cells: FixedTableCellDef[]
}

interface FixedTableCellDef {
  content: BlockDef | null
}

/** Single column of a table */
interface FixedTableColumnDef {
  // Default to auto
  columnWidth: string
}

export class FixedTableBlock extends Block<FixedTableBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Get for all cells
    return _.compact(_.flatten(this.blockDef.rows.map(r => r.cells.map(c => c.content)))).map(bd => ({ blockDef: bd!, contextVars: contextVars }))
  }

  validate() { return null }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, (draft: FixedTableBlockDef) => {
      // For each row
      this.blockDef.rows.forEach((row, rowIndex) => {
        row.cells.forEach((cell, cellIndex) => {
          draft.rows[rowIndex].cells[cellIndex].content = action(cell.content)
        })
      })
    })
  }

  renderDesign(props: DesignCtx) {
    // Handle setting of a cell contents
    const handleSet = (rowIndex: number, columnIndex: number, content: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: FixedTableBlockDef) => { 
        b.rows[rowIndex].cells[columnIndex].content = content
      }), content.id)
    }

    let className = "table"
    switch (this.blockDef.borders || "horizontal") {
      case "all":
        className += " table-bordered"
        break
      case "none":
        className += " table-borderless"
        break
    }

    switch (this.blockDef.padding || "normal") {
      case "compact":
        className += " table-condensed"
        break
    }

    return (
      <table className={className}>
        <colgroup>
          { _.range(this.blockDef.numColumns).map((colIndex) => {
            // Determine width
            const columns = this.blockDef.columns
            const width = columns && columns[colIndex] ? columns[colIndex]!.columnWidth : "auto"
            return <col key={colIndex} style={{ width: width }}/>
          })}
        </colgroup>
        <tbody>
          { this.blockDef.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              { row.cells.map((cell, columnIndex) => <td key={columnIndex}>{props.renderChildBlock(props, cell.content, handleSet.bind(null, rowIndex, columnIndex))}</td>) } 
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    let className = "table"
    switch (this.blockDef.borders || "horizontal") {
      case "all":
        className += " table-bordered"
        break
      case "none":
        className += " table-borderless"
        break
    }

    switch (this.blockDef.padding || "normal") {
      case "compact":
        className += " table-condensed"
        break
    }

    return (
      <table className={className}>
        { _.range(this.blockDef.numColumns).map((colIndex) => {
          // Determine width
          const columns = this.blockDef.columns
          const width = columns && columns[colIndex] ? columns[colIndex]!.columnWidth : "auto"
          return <col key={colIndex} style={{ width: width }}/>
        })}
        <tbody>
          { this.blockDef.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              { row.cells.map((cell, columnIndex) => <td key={columnIndex}>{props.renderChildBlock(props, cell.content)}</td>) } 
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  renderEditor(props: DesignCtx) {
    const handleNumRowsChange = (numRows: number) => {
      if (numRows < 1) {
        return
      }
      props.store.replaceBlock(setNumRows(this.blockDef, numRows))
    }

    const handleNumColumnsChange = (numColumns: number) => {
      if (numColumns < 1) {
        return
      }
      props.store.replaceBlock(setNumColumns(this.blockDef, numColumns))
    }

    return (
      <div>
        <LabeledProperty label="Number of Rows">
          <NumberInput value={this.blockDef.numRows} onChange={handleNumRowsChange} decimal={false}/>
        </LabeledProperty>

        <LabeledProperty label="Number of Columns">
          <NumberInput value={this.blockDef.numColumns} onChange={handleNumColumnsChange} decimal={false}/>
        </LabeledProperty>

        <LabeledProperty label="Borders">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="borders">
            {(value, onChange) => <Toggle 
              value={value || "horizontal"} 
              onChange={onChange} 
              options={[{ value: "none", label: "None" }, { value: "horizontal", label: "Horizontal" }, { value: "all", label: "All" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Padding">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="padding">
            {(value, onChange) => <Toggle value={value || "normal"} onChange={onChange} options={[{ value: "normal", label: "Normal" }, { value: "compact", label: "Compact" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Columns">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="columns">
            {(value, onChange) => <ColumnsEditor
              value={value}
              onChange={onChange}
              numColumns={this.blockDef.numColumns}
              /> }
          </PropertyEditor>
        </LabeledProperty>
     </div>
    )
  }
}

/** Function to set the number of rows, adding/removing as necessary */
export function setNumRows(blockDef: FixedTableBlockDef, numRows: number): FixedTableBlockDef {
  return produce(blockDef, (d: FixedTableBlockDef) => {
    // Add rows
    if (numRows > blockDef.numRows) {
      for (let i = 0; i < numRows - blockDef.numRows ; i++) {
        d.rows.push({ cells: _.range(blockDef.numColumns).map(() => ({ content: null })) })
      }
    }

    // Remove rows
    if (numRows < blockDef.numRows) {
      d.rows.splice(numRows, blockDef.numRows - numRows)
    }

    d.numRows = numRows
  })
}

/** Function to set the number of columns, adding/removing as necessary */
export function setNumColumns(blockDef: FixedTableBlockDef, numColumns: number): FixedTableBlockDef {
  return produce(blockDef, (d: FixedTableBlockDef) => {
    // Create columns if they don't exist
    if (!d.columns) {
      d.columns = _.range(blockDef.numColumns).map(c => ({ columnWidth: "auto" }))
    }

    // Add columns
    if (numColumns > blockDef.numColumns) {
      // Add to each row
      for (const row of d.rows) {
        for (let i = 0; i < numColumns - blockDef.numColumns ; i++) {
          row.cells.push({ content: null })
        }
      }

      // Add to columns
      for (let i = 0; i < numColumns - blockDef.numColumns ; i++) {
        d.columns.push({ columnWidth: "auto" })
      }
    }

    // Remove columns
    if (numColumns < blockDef.numColumns) {
      for (const row of d.rows) {
        row.cells.splice(numColumns, blockDef.numColumns - numColumns)
      }
      d.columns.splice(numColumns, blockDef.numColumns - numColumns)
    }

    d.numColumns = numColumns
  })
}

/** Edits column info */
const ColumnsEditor = (props: { 
  value?: Array<FixedTableColumnDef>
  onChange: (value: Array<FixedTableColumnDef>) => void 
  numColumns: number
}) => {
  const handleColumnWidthChange = (colIndex: number, columnWidth: string) => {
    props.onChange(produce(props.value || [], draft => {
      // Make sure exists
      draft[colIndex] = draft[colIndex] || { columnWidth: "auto" }
      draft[colIndex]!.columnWidth = columnWidth
    }))
  }

  return <ul className="list-group">
    { _.map(_.range(props.numColumns), colIndex => {
      return <li className="list-group-item" key={colIndex}>
        <LabeledProperty label="Width" key="width">
          <TableColumnWidthEditor
            columnWidth={props.value && props.value[colIndex] ? props.value[colIndex]!.columnWidth : "auto" }
            onChange={handleColumnWidthChange.bind(null, colIndex)}
          />
        </LabeledProperty>
      </li>
    })}
  </ul>
}
