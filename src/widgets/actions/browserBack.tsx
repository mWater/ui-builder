import _ from 'lodash'
import { ActionDef, Action } from '../actions';
import { DesignCtx, InstanceCtx } from '../../contexts';

export interface BrowserBackActionDef extends ActionDef {
  type: "browserBack"
}

/** Goes back in browser history */
export class BrowserBackAction extends Action<BrowserBackActionDef> {
  validate(designCtx: DesignCtx) {
    return null
  }

  async performAction(instanceCtx: InstanceCtx): Promise<void> {
    window.history.back()
  }
}

