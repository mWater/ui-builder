import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { LabeledProperty, DropdownPropertyEditor, LocalizedTextPropertyEditor } from '../propertyEditors'
import { LocalizedString, localize } from '../localization'

export interface TextBlockDef extends BlockDef {
  type: "text"
  /** Text content */
  text: LocalizedString,
  /** style ("p", "div", "h1", "h2", "h3", "h4") */
  style: string  
}

export class TextBlock extends LeafBlock {
  blockDef: TextBlockDef

  constructor(blockDef: TextBlockDef) {
    super(blockDef)
  }

  renderDesign(props: RenderDesignProps) {
    const text = localize(this.blockDef.text, props.locale)
    return React.createElement(this.blockDef.style, {}, text ? text : <span className="text-muted">Text</span>)
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    const text = localize(this.blockDef.text, props.locale)
    return React.createElement(this.blockDef.style, {}, text)
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Text">
          <LocalizedTextPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="text"
            locale={props.locale}
            placeholder="Lorem ipsum"
            multiline
          />
        </LabeledProperty>
        <LabeledProperty label="Style">
          <DropdownPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="style"
            options={[
              { value: "div", label: "Plain Text"},
              { value: "p", label: "Paragraph"},
              { value: "h1", label: "Heading 1"},
              { value: "h2", label: "Heading 2"},
              { value: "h3", label: "Heading 3"},
              { value: "h4", label: "Heading 4"}
            ]}
          />
        </LabeledProperty>
      </div>
    )
  }
}