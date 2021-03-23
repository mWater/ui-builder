import { ActionDef, Action } from '../actions';
import { DesignCtx, InstanceCtx } from '../../contexts';
export interface BrowserBackActionDef extends ActionDef {
    type: "browserBack";
}
/** Goes back in browser history */
export declare class BrowserBackAction extends Action<BrowserBackActionDef> {
    validate(designCtx: DesignCtx): null;
    performAction(instanceCtx: InstanceCtx): Promise<void>;
}
