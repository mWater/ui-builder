import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { TextPropertyEditor } from '../propertyEditors';
import { Expr } from 'mwater-expressions';

export interface ExpressionBlockDef extends BlockDef {
  type: "expression"
  
  /** Context variable (row or rowset) to use for expression */
  contextVarId: string

  /** Expression to be displayed */
  expr: Expr
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

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
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