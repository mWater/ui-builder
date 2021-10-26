import React from "react"
import _ from "lodash"
import { ActionDef, Action, RenderActionEditorProps } from "../actions"
import { DesignCtx, InstanceCtx } from "../../contexts"

export interface RefreshDataActionDef extends ActionDef {
  type: "refreshData"
}

/** Refreshes all data-driven widgets */
export class RefreshDataAction extends Action<RefreshDataActionDef> {
  validate(designCtx: DesignCtx) {
    return null
  }

  renderEditor(props: RenderActionEditorProps) {
    return <div />
  }

  async performAction(instanceCtx: InstanceCtx): Promise<void> {
    // Perform refresh
    instanceCtx.database.refresh()
  }
}
