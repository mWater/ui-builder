import _ from 'lodash'
import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { BlockDef } from "./widgets/blocks";
import ContextVarsInjector from "./widgets/ContextVarsInjector";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { BaseCtx, InstanceCtx } from "./contexts";

import './PageStackDisplay.css'
import uuid = require("uuid");

interface Props {
  baseCtx: BaseCtx
  initialPage: Page
}

interface State {
  pages: Page[]
}

/** Maintains and displays the stack of pages, including modals.  */
export class PageStackDisplay extends React.Component<Props, State> implements PageStack {
  /** Stores validation registrations for all sub-components so that they can be validated
   * before being saved. Contains pageIndex as well to allow validating a single page
   */
  validationRegistrations: { [key: string]: { pageIndex: number, validate: (() => string | null) } }

  constructor(props: Props) {
    super(props)

    // Display initial page
    this.state = {
      pages: [props.initialPage]
    }

    this.validationRegistrations = {}
  }

  openPage(page: Page): void {
    this.setState({ pages: this.state.pages.concat(page) })
  }

  /** Replace current page with specified one */
  replacePage(page: Page): boolean {
    if (this.state.pages.length == 0) {
      throw new Error("Zero pages in stack")
    }

    // Validate all instances within page
    const pageIndex = this.state.pages.length - 1
    const result = this.validatePage(pageIndex)
    if (!result) {
      return false
    }

    const pages = this.state.pages.slice()
    pages.splice(pages.length - 1, 1)
    pages.push(page)
    this.setState({ pages })
    return true
  }

  /** Close top page. Returns whether successful and pages still open */
  closePage(): { success: boolean, pageCount: number } {
    if (this.state.pages.length == 0) {
      throw new Error("Zero pages in stack")
    }

    // Validate all instances within page
    const pageIndex = this.state.pages.length - 1
    const result = this.validatePage(pageIndex)
    if (!result) {
      return { success: false, pageCount: this.state.pages.length }
    }

    const pages = this.state.pages.slice()
    pages.splice(pages.length - 1, 1)
    this.setState({ pages })

    return { success: true, pageCount: pages.length }
  }

  closeAllPages(): boolean {
    const pages = this.state.pages.slice()

    while (pages.length > 0) {
      // Validate all instances within page
      const pageIndex = pages.length - 1

      const result = this.validatePage(pageIndex)
      if (!result) {
        return false
      }
      pages.splice(pages.length - 1, 1)
    }
    
    this.setState({ pages: [] })
    return true
  }

  /** Validates a single page (by pageIndex), showing an error if fails */
  validatePage(pageIndex: number): boolean {
    const validationMessages: string[] = []

    for (const key of Object.keys(this.validationRegistrations)) {
      const value = this.validationRegistrations[key]!
      if (value.pageIndex != pageIndex) {
        continue
      }

      const msg = value.validate()
      if (msg != null) {
        validationMessages.push(msg)
      }
    }

    if (validationMessages.length > 0) {
      // "" just blocks
      if (_.compact(validationMessages).length > 0) {
        alert(_.compact(validationMessages).join("\n"))
      }
      return false
    }
    return true
  }

  renderChildBlock = (instanceCtx: InstanceCtx, childBlockDef: BlockDef | null) => {
    // Create block
    if (childBlockDef) {
      const block = instanceCtx.createBlock(childBlockDef)
      return block.renderInstance(instanceCtx)
    }
    return null
  }

  handleClose = () => {
    this.closePage()
  }

  /** Stores the registration for validation of a child block and returns an unregister function */
  registerChildForValidation = (pageIndex: number, validate: () => string | null): (() => void) => {
    const key = uuid()
    this.validationRegistrations[key] = { pageIndex: pageIndex, validate: validate }
    return () => {
      delete this.validationRegistrations[key]
    }
  }

  renderPageContents(page: Page, pageIndex: number) {
    // Lookup widget
    const widgetDef = this.props.baseCtx.widgetLibrary.widgets[page.widgetId!]

    if (!widgetDef) {
      return <div className="alert alert-danger">Widget not found</div>
    }

    // Case of empty widget
    if (!widgetDef.blockDef) {
      return null
    }

    // Create outer instanceCtx. Context variables will be injected after
    const outerInstanceCtx: InstanceCtx = {
      ...this.props.baseCtx,
      pageStack: this,
      contextVars: [],
      contextVarValues: {},
      getContextVarExprValue: () => { throw new Error("Non-existant context variable") },
      onSelectContextVar: () => { throw new Error("Non-existant context variable") },
      setFilter: () => { throw new Error("Non-existant context variable") },
      getFilters: () => { throw new Error("Non-existant context variable") },
      renderChildBlock: this.renderChildBlock,
      registerForValidation: this.registerChildForValidation.bind(null, pageIndex)
    }

    // Wrap in context var injector
    return <ContextVarsInjector 
      injectedContextVars={(this.props.baseCtx.globalContextVars || []).concat(widgetDef.contextVars)}
      innerBlock={widgetDef.blockDef}
      injectedContextVarValues={page.contextVarValues}
      instanceCtx={{ ...outerInstanceCtx, database: page.database }}>
        {(innerInstanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
          if (loading) {
            return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
          }
          return (
            <div style={{ opacity: refreshing ? 0.6 : undefined }}>
              { this.renderChildBlock(innerInstanceCtx, widgetDef.blockDef) }
            </div>
          )
        }}
      </ContextVarsInjector>
  }

  renderPage(page: Page, index: number) {
    // Determine if invisible (behind a normal page)
    let invisible = false
    for (let i = index + 1; i < this.state.pages.length ; i++) {
      if (this.state.pages[i].type === "normal") {
        invisible = true
      }
    }

    const contents = this.renderPageContents(page, index)

    switch (page.type) {
      case "normal":
        return (
          <div style={{ display: invisible ? "none" : "block" }} key={index}>
            <NormalPage isFirst={index === 0} onClose={this.handleClose} key={index} title={page.title}>
              {contents}
            </NormalPage>
          </div>
        )
      case "modal":
        return (
          <div style={{ display: invisible ? "none" : "block" }} key={index}>
            <ModalPage onClose={this.handleClose} key={index} title={page.title}>
              {contents}
            </ModalPage>
          </div>
        )
      case "inline":
        return (
          <div style={{ display: invisible ? "none" : "block" }} key={index}>
            {contents}
          </div>
        )
    }
  }
 
  render() {
    return this.state.pages.map((page, index) => this.renderPage(page, index))
  }
}

class NormalPage extends React.Component<{ 
  isFirst: boolean
  onClose: () => void
  title?: string 
}> {
  render() {
    return (
      <div className="normal-page">
        { !this.props.isFirst || this.props.title ?
          <div className="normal-page-header" key="header">
            <h4>
              { !this.props.isFirst ?
                <i className="normal-page-header-back fa fa-arrow-left fa-fw" onClick={this.props.onClose} />
              : null }
              { this.props.title }
            </h4>
          </div>
        : null}
        <div key="contents" className="normal-page-contents">
          {this.props.children}
        </div>
      </div>
    )
  }
}

class ModalPage extends React.Component<{ title?: string, onClose: () => void }> {
  render() {
    return (
      <ModalPopupComponent onClose={this.props.onClose} size="large" header={this.props.title}>
        {this.props.children}
      </ModalPopupComponent>
    )
  }
}