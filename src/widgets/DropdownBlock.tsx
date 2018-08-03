import * as React from 'react';
import LeafBlock from './LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderEditorProps, RenderInstanceProps } from './blocks'

export interface DropdownBlockDef extends BlockDef {
  column: string
}

export class DropdownBlock extends LeafBlock {
  blockDef: DropdownBlockDef

  constructor(blockDef: DropdownBlockDef) {
    super(blockDef)
  }

  renderDesign(props: RenderDesignProps) {
    return props.wrapDesignerElem(this.blockDef,
      <select>
        <option value="a">A {this.id}</option>
      </select>
    )     
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return <DropdownBlockInstance id={this.id} ref={ref}/>
  }

  renderEditor(props: RenderEditorProps) {
    return null
  }

  getContextVarExprs(contextVarId: string) { return [] }
}

class DropdownBlockInstance extends React.Component<{ id: string }> implements BlockInstance {
  // validate() { return [] }

  render() {
    return (
      <select>
        <option value="a">A {this.props.id}</option>
      </select>
    )      
  }
}