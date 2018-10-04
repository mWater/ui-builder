import { RenderInstanceProps, ContextVar, BlockDef, CreateBlock, Filter, getBlockTree } from "./blocks";
import * as React from "react";
import ContextVarInjector from './ContextVarInjector'
import * as _ from "lodash";
import { Schema } from "mwater-expressions";
import { Database } from "../database/Database";

interface Props {
  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }
  renderInstanceProps: RenderInstanceProps
  schema: Schema
  database: Database

  /** Block that will be inside the context var injector. Needed to get expressions that will be evaluated */
  innerBlock: BlockDef
  createBlock: CreateBlock
  children: (renderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => React.ReactElement<any>
}

/** Injects one or more context variables into the inner render instance props. 
 * Holds state of the filters that are applied to rowset. 
 * Computes values of expressions
 */
export default class ContextVarsInjector extends React.Component<Props> {
  render() {
    // Wrap once per child
    let elem = this.props.children

    for (const contextVar of this.props.contextVars) {
      // Get context var exprs
      const contextVarExprs = _.flatten(getBlockTree(this.props.innerBlock, this.props.createBlock, this.props.contextVars).map(cb => {
        const block = this.props.createBlock(cb.blockDef)
        return block.getContextVarExprs(contextVar)
      }))

      const currentElem = elem
      elem = (outerProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => (
        <ContextVarInjector 
            contextVar={contextVar} 
            schema={this.props.schema}
            database={this.props.database}
            value={this.props.contextVarValues[contextVar.id]} 
            renderInstanceProps={outerProps}
            contextVarExprs={contextVarExprs}>
          {(renderProps, innerLoading, innerRefreshing) => currentElem(renderProps, innerLoading || loading, innerRefreshing || refreshing)}
        </ContextVarInjector>
      )
    }

    return elem(this.props.renderInstanceProps, false, false)
  }
}