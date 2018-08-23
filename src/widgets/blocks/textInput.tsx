import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { TextPropertyEditor } from '../propertyEditors';

export interface TextInputBlockDef extends BlockDef {
  column: string // TODO
}

export class TextInputBlock extends LeafBlock {
  blockDef: TextInputBlockDef

  constructor(blockDef: TextInputBlockDef) {
    super(blockDef)
  }

  renderDesign(props: RenderDesignProps) {
    return (
      // TODO NO BOOTSTRAP HERE
      <input type="text" className="form-control" placeholder={this.blockDef.column} />
    )     
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return (
      // TODO NO BOOTSTRAP HERE
      <input type="text" className="form-control" placeholder={this.blockDef.column} />
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