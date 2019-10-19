import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef } from '../blocks'
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { NumberInput } from 'react-library/lib/bootstrap';
import { DesignCtx, InstanceCtx } from '../../contexts';

export interface SpacerBlockDef extends BlockDef {
  type: "spacer"

  /** Width in ems (null/undefined is auto) */
  width?: number | null

  /** Height in ems */
  height?: number | null
}

/** Creates a fixed size spacer to separate blocks */
export class SpacerBlock extends LeafBlock<SpacerBlockDef> {
  validate() { return null }
  
  renderDesign(props: DesignCtx) {
    const style: React.CSSProperties = {
      backgroundImage: "linear-gradient(45deg, #dddddd 8.33%, #ffffff 8.33%, #ffffff 50%, #dddddd 50%, #dddddd 58.33%, #ffffff 58.33%, #ffffff 100%)",
      backgroundSize: "8.49px 8.49px"
    }

    if (this.blockDef.width) {
      style.width = this.blockDef.width + "em"
    }
    if (this.blockDef.height) {
      style.height = this.blockDef.height + "em"
    }
    return <div style={style}/>
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    const style: React.CSSProperties = {}

    if (this.blockDef.width) {
      style.width = this.blockDef.width + "em"
    }
    if (this.blockDef.height) {
      style.height = this.blockDef.height + "em"
    }
    return <div style={style}/>
  }

  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Width in ems (blank for auto)">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="width">
            {(value, onChange) => <NumberInput value={value} onChange={onChange} decimal={true} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Height in ems (blank for auto)">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="height">
            {(value, onChange) => <NumberInput value={value} onChange={onChange} decimal={true} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}