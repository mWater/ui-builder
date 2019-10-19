import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, ContextVar } from '../blocks'
import { LabeledProperty, PropertyEditor, ActionDefEditor } from '../propertyEditors';
import { TextInput, Select } from 'react-library/lib/bootstrap';
import { ActionDef } from '../actions';
import { Expr } from 'mwater-expressions';
import { localize } from '../localization';
import produce from 'immer';
import { DesignCtx, InstanceCtx } from '../../contexts';

export interface ImageBlockDef extends BlockDef {
  type: "image"

  /** URL of image */
  url?: string

  /** Localized version of the urls that override above for images that vary with locale */
  localizedUrls?: { [locale: string]: string }

  /** Action to perform when image is clicked */
  clickActionDef: ActionDef | null

  /** Size mode:
   * normal: displays image with maximum width of 100%
   * fullwidth: stretches to 100%
   * banner: stretches to 100% and includes reverse page margin to fill completely
   */
  sizeMode?: "normal" | "fullwidth" | "banner"
}

/** Simple static image block */
export class ImageBlock extends LeafBlock<ImageBlockDef> {
  validate(designCtx: DesignCtx) { 
    if (!this.blockDef.url) {
      return "URL required"
    }

    let error: string | null

    // Validate action
    if (this.blockDef.clickActionDef) {
      const action = designCtx.actionLibrary.createAction(this.blockDef.clickActionDef)

      error = action.validate(designCtx)
      if (error) {
        return error
      }
    }
    return null 
  }

  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] { 
    // Include action expressions
    if (this.blockDef.clickActionDef) {
      const action = ctx.actionLibrary.createAction(this.blockDef.clickActionDef)
      return action.getContextVarExprs(contextVar)
    }

    return [] 
  }
   
  renderImage(locale: string, handleClick?: () => void) {
    if (!this.blockDef.url) {
      return <i className="fa fa-picture-o"/>
    }

    var url
    if (this.blockDef.localizedUrls && this.blockDef.localizedUrls[locale]) {
      url = this.blockDef.localizedUrls[locale]
    }
    else {
      url = this.blockDef.url
    }
    
    const divStyle: React.CSSProperties = {}
    const imageStyle: React.CSSProperties = {}

    const sizeMode = this.blockDef.sizeMode || "normal"
    if (sizeMode == "normal") {
      imageStyle.maxWidth = "100%"
    }
    else if (sizeMode == "fullwidth") {
      imageStyle.width = "100%"
    }
    else if (sizeMode == "banner") {
      imageStyle.width = "100%"
      divStyle.margin = "-15px -20px 0px -20px"
    }

    return (
      <div onClick={handleClick} style={divStyle}>
        <img src={url} style={imageStyle}/>
      </div>
    )
  }

  renderDesign(props: DesignCtx) {
    return this.renderImage(props.locale)
  }

  renderInstance(instanceCtx: InstanceCtx): React.ReactElement<any> {
    const handleClick = () => {
      // Confirm if confirm message
      if (this.blockDef.confirmMessage) {
        if (!confirm(localize(this.blockDef.confirmMessage, instanceCtx.locale))) {
          return
        }
      }

      // Run action
      if (this.blockDef.clickActionDef) {
        const action = instanceCtx.actionLibrary.createAction(this.blockDef.clickActionDef)

        action.performAction(instanceCtx)
      }
    }

    return this.renderImage(instanceCtx.locale, handleClick)
  }

  renderEditor(props: DesignCtx) {
    const locales = [
      "en",
      "fr",
      "es",
      "pt",
      "sw",
      "tet",
      "id",
      "ht",
      "my",
      "km",
      "bn",
      "am"
    ]
    const localizedUrls = this.blockDef.localizedUrls || {}

    return (
      <div>
        <LabeledProperty label="URL">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="url">
            {(value, onChange) => <TextInput value={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Size Mode">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="sizeMode">
            {(value, onChange) => 
              <Select value={value || "normal"} onChange={onChange}
              options={[
                { value: "normal", label: "Normal"},
                { value: "fullwidth", label: "Full width"},
                { value: "banner", label: "Banner"}
              ]}/> }
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="When image clicked">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="clickActionDef">
            {(value, onChange) => (
              <ActionDefEditor 
                value={value} 
                onChange={onChange} 
                designCtx={props} />
            )}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Locale-specific URL overrides">
        { locales.map(locale => {
          const onChange = (url: string | null) => {
            props.store.replaceBlock(produce(this.blockDef, bd => {
              if (url) {
                bd.localizedUrls = bd.localizedUrls || {}
                bd.localizedUrls[locale] = url
              }
              else {
                bd.localizedUrls = bd.localizedUrls || {}
                delete bd.localizedUrls[locale]
              }
            }))
          }
          return <LabeledProperty label={locale}>
            <TextInput value={localizedUrls[locale]} onChange={onChange} emptyNull />
          </LabeledProperty>
        })}
      </LabeledProperty>

    </div>
    )
  }
}
