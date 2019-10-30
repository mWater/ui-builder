import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import * as _ from 'lodash';
import ReactElementPrinter from 'react-library/lib/ReactElementPrinter'
import { DesignCtx, InstanceCtx } from '../../contexts';

/** Block that can be printed by a print button at top right */
export interface PrintBlockDef extends BlockDef {
  type: "print"
  content: BlockDef | null
}

export class PrintBlock extends Block<PrintBlockDef> {
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
      props.store.alterBlock(this.id, produce((b: PrintBlockDef) => { 
        b.content = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    return (
      <div>
        <div style={{ textAlign: "right" }}>
          <button type="button" className="btn btn-link">
            <i className="fa fa-print" />
          </button>
        </div>
        { props.renderChildBlock(props, this.blockDef.content, handleAdd) }
      </div>
    )
  }

  renderInstance(props: InstanceCtx) {
    const elem = props.renderChildBlock(props, this.blockDef.content)

    const handleClick = () => {
      new ReactElementPrinter().print(elem, { delay: 5000 })
    } 

    return (
      <div>
        <div style={{ textAlign: "right" }}>
          <button type="button" className="btn btn-link" onClick={handleClick}>
            <i className="fa fa-print"/>
          </button>
        </div>
        { elem }
      </div>
    )
  }
}