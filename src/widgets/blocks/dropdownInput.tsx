import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { TextPropertyEditor } from '../propertyEditors';

export interface DropdownInputBlockDef extends BlockDef {
  type: "dropdownInput"
  column: string // TODO
}

export class DropdownInputBlock extends LeafBlock {
  blockDef: DropdownInputBlockDef

  constructor(blockDef: DropdownInputBlockDef) {
    super(blockDef)
  }

  renderDesign(props: RenderDesignProps) {
    return (
      // TODO NO BOOTSTRAP HERE
      <select className="form-control" value="a" style={{color: "#999"}}>
        <option value="a" disabled>{this.blockDef.column}</option>
      </select>
    )     
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return (
      // TODO NO BOOTSTRAP HERE
      <select className="form-control" value="a" style={{color: "#999"}}>
        <option value="a" disabled>{this.blockDef.column}</option>
      </select>
    )     
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <TextPropertyEditor 
          obj={this.blockDef}
          onChange={props.onChange}
          property="column"
        />
      </div>
    )
  }
}