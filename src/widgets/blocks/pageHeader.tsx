import produce from "immer"
import * as React from "react"
import { Block, BlockDef, ContextVar, ChildBlock } from "../blocks"
import { DesignCtx, InstanceCtx } from "../../contexts"

/** Page header with line underneath and back button/close button if appropriate */
export interface PageHeaderBlockDef extends BlockDef {
  type: "page-header"
  child: BlockDef | null
}

export class PageHeaderBlock extends Block<PageHeaderBlockDef> {
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
        produce((b: PageHeaderBlockDef) => {
          b.child = addedBlockDef
          return b
        }),
        addedBlockDef.id
      )
    }

    return <div className="page-header-block page-header-block-design">
      <i className="back-button fa fa-arrow-left" />
      {props.renderChildBlock(props, this.blockDef.child, handleAdd)}
    </div>
  }

  renderInstance(ctx: InstanceCtx) {
    // Determine page type
    const stack = ctx.pageStack.getPageStack()
    const lastPage = stack[stack.length - 1]

    const isModal = lastPage && lastPage.type == "modal"

    if (isModal) {
      return <div className="page-header-block page-header-block-modal">
        {ctx.renderChildBlock(ctx, this.blockDef.child)}
        <button className="btn-close" onClick={() => ctx.pageStack.closePage()}/>
      </div>
    }
    else {
      return <div className="page-header-block page-header-block-normal">
        { stack.length > 1 ? <i className="back-button fa fa-arrow-left" onClick={() => ctx.pageStack.closePage()} /> : <div/> }
        {ctx.renderChildBlock(ctx, this.blockDef.child)}
      </div>
    }
  }
}
