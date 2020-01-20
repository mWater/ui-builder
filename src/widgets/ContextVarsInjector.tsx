import { ContextVar, BlockDef, CreateBlock } from "./blocks";
import * as React from "react";
import ContextVarInjector from './ContextVarInjector'
import * as _ from "lodash";
import { InstanceCtx } from "../contexts";

interface Props {
  instanceCtx: InstanceCtx
  injectedContextVars: ContextVar[]
  injectedContextVarValues: { [contextVarId: string]: any }

  /** Block that will be inside the context var injector. Needed to get expressions that will be evaluated */
  innerBlock: BlockDef | null
  children: (instanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => React.ReactElement<any>
}

/** Injects one or more context variables into the inner render instance props. 
 * Holds state of the filters that are applied to rowset. 
 * Computes values of expressions
 */
export default class ContextVarsInjector extends React.Component<Props> {
  render() {
    // Wrap once per child
    let elem = this.props.children

    const allContextVars = this.props.instanceCtx.contextVars.concat(this.props.injectedContextVars)

    // Do in reverse order, as the inner most one is done first
    const reverseInjectedContextVars = this.props.injectedContextVars.slice().reverse()
    for (const contextVar of reverseInjectedContextVars) {
      const innerBlock = this.props.innerBlock ? this.props.instanceCtx.createBlock(this.props.innerBlock) : null

      // Get context var exprs
      const contextVarExprs = innerBlock ? innerBlock.getSubtreeContextVarExprs(contextVar, {
        ...this.props.instanceCtx,
        contextVars: allContextVars
      }) : []

      const initialFilters = innerBlock ? innerBlock.getSubtreeInitialFilters(contextVar.id, {
        ...this.props.instanceCtx,
        contextVars: allContextVars
      }) : []

      const currentElem = elem
      elem = (outerInstanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => (
        <ContextVarInjector 
            injectedContextVar={contextVar} 
            value={this.props.injectedContextVarValues[contextVar.id]} 
            instanceCtx={outerInstanceCtx}
            initialFilters={initialFilters}
            contextVarExprs={contextVarExprs}>
          {(renderProps, innerLoading, innerRefreshing) => currentElem(renderProps, innerLoading || loading, innerRefreshing || refreshing)}
        </ContextVarInjector>
      )
    }

    return elem(this.props.instanceCtx, false, false)
  }
}