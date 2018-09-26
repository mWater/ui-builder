import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps } from '../blocks'

export interface SpacerBlockDef extends BlockDef {
  type: "spacer"
}

// TODO
export class SpacerBlock extends LeafBlock<SpacerBlockDef> {
  validate() { return null }
  
  renderDesign(props: RenderDesignProps) {
    return (
      <div/>
    )
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    return (
      <div/>
    )
  }

  // renderEditor(props: RenderEditorProps) {
  //   return (
  //     <div>
  //     </div>
  //   )
  // }
}