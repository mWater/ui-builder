import * as React from 'react';
import * as _ from 'lodash';
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ContextVar, ChildBlock } from '../blocks'
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { NumberInput, Select } from 'react-library/lib/bootstrap';
import CompoundBlock from '../CompoundBlock';
import produce from 'immer';

/** Table with a fixed number of rows and columns */
export interface FixedTableBlockDef extends BlockDef {
  type: "fixedTable"

  /** Style of borders around the cells */
  cellBorders: "default"

  /** Padding of the cells */
  cellPadding: "default" | "condensed"

  /** Number of rows in the table */
  numRows: number

  /** Number of columns in the table */
  numColumns: number

  /** Rows of the table */
  rows: FixedTableRowDef[]
}

/** Single row of a table */
interface FixedTableRowDef {
  /** Cells of the row */
  cells: FixedTableCellDef[]
}

interface FixedTableCellDef {
  content: BlockDef | null
}

export class FixedTableBlock extends CompoundBlock<FixedTableBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Get for all cells
    return _.compact(_.flatten(this.blockDef.rows.map(r => r.cells.map(c => c.content)))).map(bd => ({ blockDef: bd!, contextVars: contextVars }))
  }

  validate() { return null }

  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef {
    return produce(this.blockDef, (draft: FixedTableBlockDef) => {
      // For each row
      for (const row of draft.rows) {
        for (const cell of row.cells) {
          if (cell.content) {
            cell.content = action(cell.content)
          }
        }
      }
    })
  }

  renderDesign(props: RenderDesignProps) {
    // Handle setting of a cell contents
    const handleSet = (rowIndex: number, columnIndex: number, content: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: FixedTableBlockDef) => { 
        b.rows[rowIndex].cells[columnIndex].content = content
      }), content.id)
    }

    return (
      <table className={ this.blockDef.cellPadding === "condensed" ? "table table-bordered table-condensed" : "table table-bordered" }>
        <tbody>
          { this.blockDef.rows.map((row, rowIndex) => (
            <tr>
              { row.cells.map((cell, columnIndex) => <td key={columnIndex}>{props.renderChildBlock(props, cell.content, handleSet.bind(null, rowIndex, columnIndex))}</td>) } 
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    return (
      <table className={ this.blockDef.cellPadding === "condensed" ? "table table-bordered table-condensed" : "table table-bordered" }>
        <tbody>
          { this.blockDef.rows.map((row, rowIndex) => (
            <tr>
              { row.cells.map((cell, columnIndex) => <td key={columnIndex}>{props.renderChildBlock(props, cell.content)}</td>) } 
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  renderEditor(props: RenderEditorProps) {
    const handleNumRowsChange = (numRows: number) => {
      if (numRows < 1) {
        return
      }
      props.onChange(setNumRows(this.blockDef, numRows))
    }

    const handleNumColumnsChange = (numColumns: number) => {
      if (numColumns < 1) {
        return
      }
      props.onChange(setNumColumns(this.blockDef, numColumns))
    }

    return (
      <div>
        <LabeledProperty label="Number of Rows">
          <NumberInput value={this.blockDef.numRows} onChange={handleNumRowsChange} decimal={false}/>
        </LabeledProperty>

        <LabeledProperty label="Number of Columns">
          <NumberInput value={this.blockDef.numColumns} onChange={handleNumColumnsChange} decimal={false}/>
        </LabeledProperty>

        <LabeledProperty label="Cell Padding">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="cellPadding">
            {(value, onChange) => 
              <Select value={value} onChange={onChange}
                options={[
                  { value: "default", label: "Normal"},
                  { value: "condensed", label: "Condensed"},
              ]}/> }
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
    // Add columns
    if (numColumns > blockDef.numColumns) {
      for (const row of d.rows) {
        for (let i = 0; i < numColumns - blockDef.numColumns ; i++) {
          row.cells.push({ content: null })
        }
      }
    }

    // Remove columns
    if (numColumns < blockDef.numColumns) {
      for (const row of d.rows) {
        row.cells.splice(numColumns, blockDef.numColumns - numColumns)
      }
    }

    d.numColumns = numColumns
  })
}