import { RenderInstanceProps, ContextVar, BlockDef, CreateBlock } from "./blocks";
import * as React from "react";
import ContextVarInjector from './ContextVarInjector'
import * as _ from "lodash";
import { Schema } from "mwater-expressions";
import { Database } from "../database/Database";

interface Props {
  injectedContextVars: ContextVar[]
  injectedContextVarValues: { [contextVarId: string]: any }
  renderInstanceProps: RenderInstanceProps
  schema: Schema
  database: Database

  /** Block that will be inside the context var injector. Needed to get expressions that will be evaluated */
  innerBlock: BlockDef | null
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

    const allContextVars = this.props.renderInstanceProps.contextVars.concat(this.props.injectedContextVars)

    for (const contextVar of this.props.injectedContextVars) {
      // Get context var exprs
      const contextVarExprs = this.props.innerBlock ? this.props.createBlock(this.props.innerBlock).getSubtreeContextVarExprs({
        actionLibrary: this.props.renderInstanceProps.actionLibrary,
        widgetLibrary: this.props.renderInstanceProps.widgetLibrary,
        contextVars: allContextVars,
        contextVar: contextVar,
        createBlock: this.props.createBlock
      }) : []

      const currentElem = elem
      elem = (outerProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => (
        <ContextVarInjector 
            injectedContextVar={contextVar} 
            schema={this.props.schema}
            database={this.props.database}
            value={this.props.injectedContextVarValues[contextVar.id]} 
            renderInstanceProps={outerProps}
            contextVarExprs={contextVarExprs}>
          {(renderProps, innerLoading, innerRefreshing) => currentElem(renderProps, innerLoading || loading, innerRefreshing || refreshing)}
        </ContextVarInjector>
      )
    }

    return elem({ ...this.props.renderInstanceProps, database: this.props.database }, false, false)
  }
}