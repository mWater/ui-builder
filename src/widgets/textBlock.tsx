import * as React from 'react';
import LeafBlock from './LeafBlock'
import { BlockDef, BlockInstance, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from './blocks'
import { LocalizedTextPropertyEditor, LabelledProperty, DropdownPropertyEditor } from './propertyEditors'
import { LocalizedString, localize } from './localization'

export interface TextBlockDef extends BlockDef {
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

    return props.wrapDesignerElem(this.blockDef,
      React.createElement(this.blockDef.style, {}, text ? text : <span className="text-muted">Lorem Ipsum</span>))
  }

  renderInstance(props: RenderInstanceProps, ref: (blockInstance: BlockInstance | null) => void): React.ReactElement<any> {
    const text = localize(this.blockDef.text, props.locale)

    return React.createElement(this.blockDef.style, {}, text)
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabelledProperty label="Text">
          <LocalizedTextPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="text"
            locale={props.locale}
            placeholder="Lorem Ipsum"
          />
        </LabelledProperty>
        <LabelledProperty label="Style">
          <DropdownPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="style"
            options={[
              { value: "p", label: "Paragraph"},
              { value: "div", label: "Paragraph (no margin)"},
              { value: "h1", label: "Heading 1"},
              { value: "h2", label: "Heading 2"},
              { value: "h3", label: "Heading 3"},
              { value: "h4", label: "Heading 4"}
            ]}
          />
        </LabelledProperty>
      </div>
    )
  }
}