import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'
import { LocalizedString, localize } from '../localization';
import { LocalizedTextPropertyEditor, PropertyEditor } from '../propertyEditors';

export interface SaveCancelBlockDef extends BlockDef {
  type: "saveCancel"
  saveLabel: LocalizedString | null
  cancelLabel: LocalizedString | null
  child: BlockDef | null
}

export class SaveCancelBlock extends CompoundBlock<SaveCancelBlockDef> {
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
      props.store.alterBlock(this.id, produce((b: SaveCancelBlockDef) => { 
        b.child = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    // const labelText = localize(this.blockDef.label, props.locale)

    return (
      <div>
        { props.renderChildBlock(props, this.blockDef.child, handleAdd) }
        <div className="save-cancel-footer">
          <button type="button" className="btn btn-primary">Save</button>
          &nbsp;
          <button type="button" className="btn btn-default">Cancel</button>
        </div>
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) {
    return (
      <div>
        { props.renderChildBlock(props, this.blockDef.child) }
        <div className="save-cancel-footer">
          <button type="button" className="btn btn-primary">Save</button>
          &nbsp;
          <button type="button" className="btn btn-default">Cancel</button>
        </div>
      </div>
    )
  }
  
  renderEditor(props: RenderEditorProps) {
    return null
  }
}