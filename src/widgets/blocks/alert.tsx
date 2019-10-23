import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { Select } from 'react-library/lib/bootstrap';

/** Alert box */
export interface AlertBlockDef extends BlockDef {
  type: "alert"
  content: BlockDef | null

  style: "success" | "info" | "warning" | "danger"
}

export class AlertBlock extends Block<AlertBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.content ? [{ blockDef: this.blockDef.content, contextVars: contextVars}] : []
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const content = action(this.blockDef.content)
    return produce(this.blockDef, draft => {
      draft.content = content
    })
  }

  renderDesign(props: DesignCtx) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: AlertBlockDef) => { 
        b.content = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    return (
      <div className={`alert alert-${this.blockDef.style}`}>
        { props.renderChildBlock(props, this.blockDef.content, handleAdd) }
      </div>
    )
  }

  renderInstance(props: InstanceCtx) {
    return (
      <div className={`alert alert-${this.blockDef.style}`}>
        { props.renderChildBlock(props, this.blockDef.content) }
      </div>
    )
  }

  renderEditor(designCtx: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Style">
          <PropertyEditor obj={this.blockDef} onChange={designCtx.store.replaceBlock} property="style">
            {(value, onChange) => 
              <Select 
                value={value || null} 
                onChange={onChange} 
                options={[
                  { value: "info", label: "Info" },
                  { value: "success", label: "Success" },
                  { value: "warning", label: "Warning" },
                  { value: "danger", label: "Danger" }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}