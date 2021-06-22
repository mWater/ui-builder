import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import * as _ from 'lodash';
import { LabeledProperty, PropertyEditor, ResponsiveWidthSelector } from '../propertyEditors';
import { Checkbox, Select } from 'react-library/lib/bootstrap';
import { DesignCtx, InstanceCtx } from '../../contexts';

export interface CollapsibleBlockDef extends BlockDef {
  type: "collapsible"
  label: BlockDef | null
  content: BlockDef | null
  
  /** True if collapsible section is initially collapsed */
  initialCollapsed?: boolean

  /** Width at which collapses whether initially collapsed or not */
  collapseWidth?: number
}

export class CollapsibleBlock extends Block<CollapsibleBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return _.compact([this.blockDef.label, this.blockDef.content]).map(bd => ({ blockDef: bd!, contextVars: contextVars }))
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const label = action(this.blockDef.label)
    const content = action(this.blockDef.content)
    return produce(this.blockDef, draft => {
      draft.label = label
      draft.content = content
    })
  }

  renderDesign(props: DesignCtx) {
    // Allow dropping
    const handleSetLabel = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: CollapsibleBlockDef) => { 
        b.label = blockDef 
        return b
      }), blockDef.id)
    }

    const handleSetContent = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: CollapsibleBlockDef) => { 
        b.content = blockDef 
        return b
      }), blockDef.id)
    }

    const labelNode = props.renderChildBlock(props, this.blockDef.label, handleSetLabel)
    const contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent)

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <CollapsibleComponent label={labelNode} forceOpen>
          {contentNode}
        </CollapsibleComponent>
      </div>
    )
  }

  renderInstance(props: InstanceCtx) { 
    const labelNode = this.blockDef.label ?
      props.createBlock(this.blockDef.label).renderInstance(props) : null

    const contentNode = this.blockDef.content ?
      props.createBlock(this.blockDef.content).renderInstance(props) : null

    // Determine if initially collapsed
    const initialCollapsed = this.blockDef.initialCollapsed || (this.blockDef.collapseWidth != null && window.innerWidth <= this.blockDef.collapseWidth)

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <CollapsibleComponent label={labelNode} initialCollapsed={initialCollapsed}>
          {contentNode}
        </CollapsibleComponent>
      </div>
    )
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="initialCollapsed">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Initially Collapsed</Checkbox>}
        </PropertyEditor>

        <LabeledProperty label="Collapse Below Width">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="collapseWidth">
            {(value, onChange) => <ResponsiveWidthSelector value={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

interface Props {
  label: React.ReactNode
  forceOpen?: boolean
  initialCollapsed?: boolean
}

/** Collapsible UI control */
export class CollapsibleComponent extends React.Component<Props, { collapsed: boolean }> {
  constructor(props: Props) {
    super(props)

    this.state = {
      // Collapse if not forced open and initialCollapsed
      collapsed: !(this.props.forceOpen || false) && (this.props.initialCollapsed || false)
    }
  }

  handleToggle = () => {
    if (!this.props.forceOpen) {
      this.setState({ collapsed: !this.state.collapsed })
    }
  }

  render() {
    return <div>
      <table style={{width: "100%"}}>
        <tbody>
          <tr key="float" onClick={this.handleToggle} style={{ cursor: "pointer" }}>
            <td key="left" style={{ verticalAlign: "middle", paddingRight: 5, fontSize: 18, color: "#3bd" }}>
              { this.state.collapsed ? <i className="fa fa-caret-right"/> : <i className="fa fa-caret-down"/> }
            </td>
            <td key="main" style={{ width: "100%", verticalAlign: "middle" }}>{this.props.label}</td>
          </tr>
        </tbody>      
      </table>
      { !this.state.collapsed ? this.props.children : null}
    </div>
  }
}