import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions } from '../blocks'
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, ActionDefEditor } from '../propertyEditors';
import { localize, LocalizedString } from '../localization';
import { ActionDef } from '../actions';
import { Select, TextInput } from 'react-library/lib/bootstrap';

export interface ImageBlockDef extends BlockDef {
  type: "image"
  url?: string
}

export class ImageBlock extends LeafBlock<ImageBlockDef> {
  validate(options: ValidateBlockOptions) { 
    if (!this.blockDef.url) {
      return "URL required"
    }
    return null 
  }
  
  renderImage() {
    if (!this.blockDef.url) {
      return <i className="fa fa-picture-o"/>
    }
    
    return (
      <img src={this.blockDef.url}/>
    )
  }

  renderDesign(props: RenderDesignProps) {
    return this.renderImage()
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    return this.renderImage()
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="URL">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="url">
            {(value, onChange) => <TextInput value={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
