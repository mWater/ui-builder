import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'

export interface SpacerBlockDef extends BlockDef {
  type: "spacer"
}

// TODO
export class SpacerBlock extends LeafBlock<SpacerBlockDef> {
  renderDesign(props: RenderDesignProps) {
    return (
      <div/>
    )
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
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