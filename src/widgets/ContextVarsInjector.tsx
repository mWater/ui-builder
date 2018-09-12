import { RenderInstanceProps, ContextVar, BlockDef, CreateBlock, Filter } from "./blocks";
import * as React from "react";

interface ContextVarValue {
  contextVar: ContextVar
  value: any
}

interface Props {
  contextVarValues: ContextVarValue[]
  renderInstanceProps: RenderInstanceProps
  /** Block that will be inside the context var injector. Needed to get expressions that will be evaluated */
  innerBlock: BlockDef
  createBlock: CreateBlock
  children: (renderInstanceProps: RenderInstanceProps) => React.ReactElement<any>
}

interface State {
  filters: { [contextVarId: string]: Filter[] }
}

/** Injects one or more context variables into the inner render instance props. 
 * Holds state of the filters that are applied to rowset. 
 * Computes values of expressions
 */
export default class ContextVarsInjector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      filters: {}
    }
  }
  
  render() {
    const outer = this.props.renderInstanceProps

    // Create inner props
    const innerProps: RenderInstanceProps = {
      locale: outer.locale,
      database: outer.database,
      onSelectContextVar: outer.onSelectContextVar,
      renderChildBlock: outer.renderChildBlock,
      contextVars: outer.contextVars.concat(this.props.contextVarValues.map(cvv => cvv.contextVar)),
      getContextVarValue: outer.getContextVarValue, // TODO
      getContextVarExprValue: outer.getContextVarExprValue, // TODO
      setFilter: outer.setFilter, // TODO
      getFilters: outer.getFilters, // TODO
    }
    return this.props.children(innerProps)
  }
}