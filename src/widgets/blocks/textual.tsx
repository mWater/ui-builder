import { BlockDef, Block } from "../blocks";
import LeafBlock from "../LeafBlock";
import React from "react";
import { DesignCtx } from "../../contexts";
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from "../propertyEditors";
import { Select } from "react-library/lib/bootstrap";
import { Checkbox, Toggle } from "react-library/lib/bootstrap";

/** Common base class for text and expression */
export interface TextualBlockDef extends BlockDef {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  
  /** Default is div */
  style?: "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5"

  /** Color of text. Default is no coloring */
  color?: null | "muted" | "primary" | "success" | "info" | "warning" //| "danger" 

  /** How to align text. Default is left */
  align?: "left" | "center" | "right" | "justify"

  /** True to make multiple lines break */
  multiline?: boolean
}

export abstract class TextualBlock<T extends TextualBlockDef> extends LeafBlock<T> {
  getClassName() {
    if (this.blockDef.color) {
      return "text-" + this.blockDef.color
    }
    return ""
  }

  getStyle() {
    const style: React.CSSProperties = {}
    if (this.blockDef.bold) {
      style.fontWeight = "bold"
    }
    if (this.blockDef.italic) {
      style.fontStyle = "italic"
    }
    if (this.blockDef.underline) {
      style.textDecoration = "underline"
    }
    if (this.blockDef.align) {
      style.textAlign = this.blockDef.align
    }
    if (this.blockDef.multiline) {
      style.whiteSpace = "pre-line"
    }
    return style
  }

  renderText(content: React.ReactNode) {
    const style = this.getStyle()

    return React.createElement(this.blockDef.style || "div", { style: style, className: this.getClassName() }, content)
  }

  renderTextualEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Style">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="style">
            {(value, onChange) => 
              <Select 
                value={value || "div"} 
                onChange={onChange}
                options={[
                  { value: "div", label: "Plain Text"},
                  { value: "p", label: "Paragraph"},
                  { value: "h1", label: "Heading 1"},
                  { value: "h2", label: "Heading 2"},
                  { value: "h3", label: "Heading 3"},
                  { value: "h4", label: "Heading 4"},
                  { value: "h5", label: "Heading 5"}
            ]} /> }
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="bold">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Bold</Checkbox>}
        </PropertyEditor>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="italic">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Italic</Checkbox>}
        </PropertyEditor>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="underline">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Underline</Checkbox>}
        </PropertyEditor>

        <LabeledProperty label="Alignment">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="align">
            {(value, onChange) => 
              <Toggle 
                value={value || "left"} 
                onChange={onChange} 
                options={[
                  { value: "left", label: <i className="fa fa-align-left"/> },
                  { value: "center", label: <i className="fa fa-align-center"/> },
                  { value: "right", label: <i className="fa fa-align-right"/> },
                  { value: "justify", label: <i className="fa fa-align-justify"/> }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="multiline">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Multi-line</Checkbox>}
        </PropertyEditor>

        <LabeledProperty label="Color">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="color">
            {(value, onChange) => 
              // Had to use "as any" due to Tyepscript bug
              <Select 
                value={value as any} 
                onChange={onChange} 
                options={[
                  { value: null, label: "Default" },
                  { value: "muted", label: "Muted" },
                  { value: "primary", label: "Primary" },
                  { value: "success", label: "Success" },
                  { value: "info", label: "Info" },
                  { value: "warning", label: "Warning" },
                  { value: "danger", label: "Danger" }
                ]} />
            }
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}