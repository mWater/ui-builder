import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'
import BlockPlaceholder from '../BlockPlaceholder';
import * as _ from 'lodash';
import { PropertyEditor } from '../propertyEditors';
import { Checkbox } from 'react-library/lib/bootstrap';

export interface CollapsibleBlockDef extends BlockDef {
  type: "collapsible"
  label: BlockDef | null
  content: BlockDef | null
  /** True if collapsible section is initially collapsed */
  initialCollapsed?: boolean
}

export class CollapsibleBlock extends CompoundBlock<CollapsibleBlockDef> {
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

  renderDesign(props: RenderDesignProps) {
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
        <Collapsible label={labelNode} forceOpen>
          {contentNode}
        </Collapsible>
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) { 
    const labelNode = this.blockDef.label ?
      this.createBlock(this.blockDef.label).renderInstance(props) : null

    const contentNode = this.blockDef.content ?
      this.createBlock(this.blockDef.content).renderInstance(props) : null

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <Collapsible label={labelNode} initialCollapsed={this.blockDef.initialCollapsed}>
          {contentNode}
        </Collapsible>
      </div>
    )
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="initialCollapsed">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Initially Collapsed</Checkbox>}
        </PropertyEditor>
      </div>
    )
  }
}

interface Props {
  label: React.ReactNode
  forceOpen?: boolean
  initialCollapsed?: boolean
}

class Collapsible extends React.Component<Props, { collapsed: boolean }> {
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
    if (this.state.collapsed) {
      return (
        <div onClick={this.handleToggle}>
          <div style={{float: "left", marginRight: 5, fontSize: 18, color: "#3bd" }}>
            <i className="fa fa-caret-right"/>
          </div>
          {this.props.label}
        </div>
      )
    }

    return (
      <div onClick={this.handleToggle}>
        <div>
          <div style={{float: "left", marginRight: 5, fontSize: 18, color: "#3bd" }}>
            <i className="fa fa-caret-down"/>
          </div>
          {this.props.label}
        </div>
        {this.props.children}
      </div>
    )
  }
}