import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'
import BlockPlaceholder from '../BlockPlaceholder';
import * as _ from 'lodash';

export interface CollapsibleBlockDef extends BlockDef {
  type: "collapsible"
  label: BlockDef | null
  content: BlockDef | null
}

export class CollapsibleBlock extends CompoundBlock<CollapsibleBlockDef> {
  getChildren(): ChildBlock[] {
    return _.compact([this.blockDef.label, this.blockDef.content]).map(bd => ({ blockDef: bd, contextVars: [] }))
  }
 
  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      if (draft.label) {
        draft.label = action(draft.label)
      }
      if (draft.content) {
        draft.content = action(draft.content)
      }
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

  renderInstance(props: RenderInstanceProps) { // TODO, ref: (blockInstance: BlockInstance | null) => void) {
    const labelNode = this.blockDef.label ?
      this.createBlock(this.blockDef.label).renderInstance(props) : null

    const contentNode = this.blockDef.content ?
      this.createBlock(this.blockDef.content).renderInstance(props) : null

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <Collapsible label={labelNode}>
          {contentNode}
        </Collapsible>
      </div>
    )
  }
}

interface Props {
  label: React.ReactNode
  forceOpen?: boolean
}

class Collapsible extends React.Component<Props, { collapsed: boolean }> {
  constructor(props: Props) {
    super(props)

    this.state = {
      collapsed: false
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