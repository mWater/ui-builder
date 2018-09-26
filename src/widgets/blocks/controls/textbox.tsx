import * as React from 'react';
import { BlockDef, RenderEditorProps } from '../../blocks';
import { ControlBlock, ControlBlockDef } from './ControlBlock';
import { Column } from 'mwater-expressions';
import { TextInput } from 'react-library/lib/bootstrap';

export interface TextboxBlockDef extends ControlBlockDef {
  type: "textbox"
}

export class TextboxBlock extends ControlBlock<TextboxBlockDef> {
  renderControl(props: { value: any, onChange: (value: any) => void }) {
    return <TextInput 
      emptyNull 
      value={props.value as (string | null)} 
      onChange={props.onChange}
      />
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: RenderEditorProps) {
    return null
  }

  /** Filter the columns that this control is for */
  filterColumn(column: Column) {
    return column.type === "text"
  }
}