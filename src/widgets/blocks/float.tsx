import * as React from 'react';
import * as _ from 'lodash';
import { BlockDef, ContextVar, ChildBlock } from '../blocks'
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { Toggle } from 'react-library/lib/bootstrap';
import CompoundBlock from '../CompoundBlock';
import produce from 'immer';
import { DesignCtx, InstanceCtx } from '../../contexts';

/** Floats some content either right or left of main content */
export interface FloatBlockDef extends BlockDef {
  type: "float"

  /** Which way to float the float content */
  direction: "left" | "right"

  /** Which way to vertically align */
  verticalAlign: "top" | "middle" | "bottom" 

  /** Main content of block */
  mainContent: BlockDef | null

  /** Floated content of block */
  floatContent: BlockDef | null
}

export class FloatBlock extends CompoundBlock<FloatBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Get for all cells
    return _.compact([this.blockDef.mainContent, this.blockDef.floatContent]).map(bd => ({ blockDef: bd!, contextVars: contextVars }))
  }

  validate() { return null }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, (draft: FloatBlockDef) => {
      draft.mainContent = action(this.blockDef.mainContent)
      draft.floatContent = action(this.blockDef.floatContent)
    })
  }

  renderDesign(props: DesignCtx) {
    const handleSetMainContent = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: FloatBlockDef) => { 
        b.mainContent = blockDef 
      }), blockDef.id)
    }
    const handleSetFloatContent = (blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: FloatBlockDef) => { 
        b.floatContent = blockDef 
      }), blockDef.id)
    }

    const mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent, handleSetMainContent)
    const floatContentNode = props.renderChildBlock(props, this.blockDef.floatContent, handleSetFloatContent)

    return <FloatComponent 
      float={floatContentNode} 
      main={mainContentNode} 
      direction={this.blockDef.direction} 
      verticalAlign={this.blockDef.verticalAlign} />
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    const mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent)
    const floatContentNode = props.renderChildBlock(props, this.blockDef.floatContent)

    return <FloatComponent 
      float={floatContentNode} 
      main={mainContentNode} 
      direction={this.blockDef.direction} 
      verticalAlign={this.blockDef.verticalAlign} />
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Direction">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="direction">
            {(value, onChange) => 
              <Toggle 
                value={value} 
                onChange={onChange} 
                options={[
                  { value: "left", label: <i className="fa fa-align-left"/> },
                  { value: "right", label: <i className="fa fa-align-right"/> }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Vertical Alignment">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="verticalAlign">
            {(value, onChange) => 
              <Toggle 
                value={value} 
                onChange={onChange} 
                options={[
                  { value: "top", label: "Top" },
                  { value: "middle", label: "Middle" },
                  { value: "bottom", label: "Bottom" }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>
     </div>
    )
  }
}

const FloatComponent = (props: { 
  main: React.ReactNode 
  float: React.ReactNode
  direction: "left" | "right"
  verticalAlign: "top" | "middle" | "bottom"
 }) => {
  return (
    <table style={{width: "100%"}}>
      <tbody>
        <tr>
          { props.direction == "left" ? <td style={{ verticalAlign: props.verticalAlign }}>{props.float}</td> : null }
          <td style={{ width: "100%", verticalAlign: props.verticalAlign }}>{props.main}</td>
          { props.direction == "right" ? <td style={{ verticalAlign: props.verticalAlign }}>{props.float}</td> : null }
        </tr>
      </tbody>      
    </table>

  )
}