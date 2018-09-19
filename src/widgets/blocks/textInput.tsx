import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { TextPropertyEditor } from '../propertyEditors';

export interface TextInputBlockDef extends BlockDef {
  type: "textInput"
  column: string // TODO
}

export class TextInputBlock extends LeafBlock<TextInputBlockDef> {
  validate() { return null } // TODO
  

  renderDesign(props: RenderDesignProps) {
    return (
      <input type="text" className="form-control" placeholder={this.blockDef.column} />
    )     
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return (
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