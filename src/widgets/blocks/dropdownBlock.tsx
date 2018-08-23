import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { LocalizedTextPropertyEditor } from '../propertyEditors';

export interface DropdownBlockDef extends BlockDef {
  column: string
}

export class DropdownBlock extends LeafBlock {
  blockDef: DropdownBlockDef

  constructor(blockDef: DropdownBlockDef) {
    super(blockDef)
  }

  renderDesign(props: RenderDesignProps) {
    return (
      <select>
        <option value="a">A {this.id}</option>
      </select>
    )     
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return <DropdownBlockInstance id={this.id} ref={ref}/>
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LocalizedTextPropertyEditor 
          obj={this.blockDef}
          onChange={props.onChange}
          property="column"
          locale={props.locale}
        />
      </div>
    )
  }
}

class DropdownBlockInstance extends React.Component<{ id: string }> implements BlockInstance {
  render() {
    return (
      <select>
        <option value="a">A {this.props.id}</option>
      </select>
    )      
  }
}