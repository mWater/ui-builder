import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'

export interface SearchBlockDef extends BlockDef {
  type: "search"
  // TODO expressions to search
}

export class SearchBlock extends LeafBlock {
  blockDef: SearchBlockDef

  constructor(blockDef: SearchBlockDef) {
    super(blockDef)
  }

  renderDesign(props: RenderDesignProps) {
    return (
      <div className="input-group">
        <span className="input-group-addon"><i className="fa fa-search"/></span>
        <input type="text" className="form-control input-sm" style={{maxWidth: "20em"}} />
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return (
      <div className="input-group">
        <span className="input-group-addon"><i className="fa fa-search"/></span>
        <input type="text" className="form-control input-sm" style={{maxWidth: "20em"}} />
      </div>
    )
  }

  // renderEditor(props: RenderEditorProps) {
  //   return (
  //     <div>
  //     </div>
  //   )
  // }
}