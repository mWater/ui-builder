import produce from "immer"
import * as React from "react"
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks"
import { DesignCtx, InstanceCtx } from "../../contexts"

/** Header with line underneath */
export interface HeaderBlockDef extends BlockDef {
  type: "header"
  child: BlockDef | null
}

export class HeaderBlock extends Block<HeaderBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : []
  }

  validate() {
    return null
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const child = action(this.blockDef.child)
    return produce(this.blockDef, (draft) => {
      draft.child = child
    })
  }

  renderDesign(props: DesignCtx) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.alterBlock(
        this.id,
        produce((b: HeaderBlockDef) => {
          b.child = addedBlockDef
          return b
        }),
        addedBlockDef.id
      )
    }

    return <div className="header-block">{props.renderChildBlock(props, this.blockDef.child, handleAdd)}</div>
  }

  renderInstance(props: InstanceCtx) {
    return <div className="header-block">{props.renderChildBlock(props, this.blockDef.child)}</div>
  }
}
