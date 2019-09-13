import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'
import { localize } from '../localization';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor } from '../propertyEditors';
import { LocalizedString } from 'mwater-expressions';

/** Header with line underneath */
export interface HeaderBlockDef extends BlockDef {
  type: "pageHeader"
  child: BlockDef | null
}

export class HeaderBlock extends CompoundBlock<HeaderBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars}] : []
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      draft.child = action(draft.child)
    })
  }

  renderDesign(props: RenderDesignProps) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: HeaderBlockDef) => { 
        b.child = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    return (
      <div className="header-block">
        { props.renderChildBlock(props, this.blockDef.child, handleAdd) }
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) {
    return (
      <div className="header-block">
        { props.renderChildBlock(props, this.blockDef.child) }
      </div>
    )
  }
}