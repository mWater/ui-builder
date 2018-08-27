import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { TextPropertyEditor } from '../propertyEditors';

export interface ExpressionBlockDef extends BlockDef {
  expr: string // TODO
}

export class ExpressionBlock extends LeafBlock {
  blockDef: ExpressionBlockDef

  constructor(blockDef: ExpressionBlockDef) {
    super(blockDef)
  }

  renderDesign(props: RenderDesignProps) {
    return (
      // TODO NO BOOTSTRAP HERE
      <div>
        <span className="text-muted">[</span>
        {this.blockDef.expr}
        <span className="text-muted">]</span>
      </div>
    )     
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return (
      // TODO NO BOOTSTRAP HERE
      <div>{this.blockDef.expr}</div>
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