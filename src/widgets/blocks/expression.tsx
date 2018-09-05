import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { TextPropertyEditor } from '../propertyEditors';

export interface ExpressionBlockDef extends BlockDef {
  type: "expression"
  expr: string // TODO
}

export class ExpressionBlock extends LeafBlock<ExpressionBlockDef> {
  renderDesign(props: RenderDesignProps) {
    return (
      <div>
        <span className="text-muted">[</span>
        {this.blockDef.expr}
        <span className="text-muted">]</span>
      </div>
    )     
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    return (
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