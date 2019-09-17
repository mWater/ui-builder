import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { CreateBlock, RenderInstanceProps, Filter, BlockDef } from "./widgets/blocks";
import { Schema, Expr, DataSource } from "mwater-expressions";
import ContextVarsInjector from "./widgets/ContextVarsInjector";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { ActionLibrary } from "./widgets/ActionLibrary";
import { WidgetLibrary } from "./designer/widgetLibrary";

import './PageStackDisplay.css'
import uuid = require("uuid");

interface Props {
  initialPage: Page
  createBlock: CreateBlock
  locale: string
  schema: Schema
  dataSource: DataSource
  actionLibrary: ActionLibrary
  widgetLibrary: WidgetLibrary
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

  closePage(): number | null {
    if (this.state.pages.length == 0) {
      throw new Error("Zero pages in stack")
    }

    // Validate all instances within page
    const pageIndex = this.state.pages.length - 1
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
      return null
    }

    const pages = this.state.pages.slice()
    pages.splice(pages.length - 1, 1)
    this.setState({ pages })
    return pages.length
  }

  renderChildBlock = (props: RenderInstanceProps, childBlockDef: BlockDef | null) => {
    // Create block
    if (childBlockDef) {
      const block = this.props.createBlock(childBlockDef)
      return block.renderInstance(props)
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
    const widgetDef = this.props.widgetLibrary.widgets[page.widgetId!]

    if (!widgetDef) {
      return <div className="alert alert-danger">Widget not found</div>
    }

    // Case of empty widget
    if (!widgetDef.blockDef) {
      return null
    }

    // Create outer renderInstanceProps. Context variables will be injected after
    const outerRenderInstanceProps: RenderInstanceProps = {
      locale: this.props.locale,
      database: page.database,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      actionLibrary: this.props.actionLibrary,
      widgetLibrary: this.props.widgetLibrary,
      pageStack: this,
      contextVars: [],
      contextVarValues: {},
      getContextVarExprValue: (contextVarId: string, expr: Expr) => { throw new Error("Non-existant context variable") },
      onSelectContextVar: (contextVarId: string, primaryKey: any) => { throw new Error("Non-existant context variable") },
      setFilter: (contextVarId: string, filter: Filter) => { throw new Error("Non-existant context variable") },
      getFilters: (contextVarId: string) => { throw new Error("Non-existant context variable") },
      renderChildBlock: this.renderChildBlock,
      registerForValidation: this.registerChildForValidation.bind(null, pageIndex)
    }

    // Wrap in context var injector
    return <ContextVarsInjector 
      injectedContextVars={widgetDef.contextVars}
      createBlock={this.props.createBlock}
      innerBlock={widgetDef.blockDef}
      injectedContextVarValues={page.contextVarValues}
      renderInstanceProps={outerRenderInstanceProps}
      schema={this.props.schema}
      database={page.database}>
        {(innerRenderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => {
          if (loading) {
            return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
          }
          return (
            <div style={{ opacity: refreshing ? 0.6 : undefined }}>
              { this.renderChildBlock(innerRenderInstanceProps, widgetDef.blockDef) }
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
            <NormalPage isFirst={index === 0} onClose={this.handleClose} key={index}>
              {contents}
            </NormalPage>
          </div>
        )
      case "modal":
        return (
          <div style={{ display: invisible ? "none" : "block" }} key={index}>
            <ModalPage onClose={this.handleClose} key={index}>
              {contents}
            </ModalPage>
          </div>
        )
    }
  }
 
  render() {
    return this.state.pages.map((page, index) => this.renderPage(page, index))
  }
}

class NormalPage extends React.Component<{ isFirst: boolean, onClose: () => void }> {
  render() {
    return (
      <div className="normal-page">
        <div key="header" className="normal-page-header">
          { !this.props.isFirst ?
            <i className="fa fa-chevron-left" onClick={this.props.onClose} />
          : null }
        </div>
        <div key="contents" className="normal-page-contents">
          {this.props.children}
        </div>
      </div>
    )
  }
}

class ModalPage extends React.Component<{ onClose: () => void }> {
  render() {
    return (
      <ModalPopupComponent onClose={this.props.onClose} size="large">
        {this.props.children}
      </ModalPopupComponent>
    )
  }
}