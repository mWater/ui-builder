import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { CreateBlock, RenderInstanceProps, Filter, BlockDef, ValidatableInstance } from "./widgets/blocks";
import { Schema, Expr, DataSource } from "mwater-expressions";
import ContextVarsInjector from "./widgets/ContextVarsInjector";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { ActionLibrary } from "./widgets/ActionLibrary";
import { WidgetLibrary } from "./designer/widgetLibrary";

import './PageStackDisplay.css'

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
  /** Keyed by <page index>:<block id>:<block instance> */
  instanceRefs: { [key: string]: React.Component<any> & ValidatableInstance }

  constructor(props: Props) {
    super(props)

    // Display initial page
    this.state = {
      pages: [props.initialPage]
    }

    this.instanceRefs = {}
  }

  openPage(page: Page): void {
    this.setState({ pages: this.state.pages.concat(page) })
  }

  closePage(): void {
    // Validate all instances within page
    const pageIndex = this.state.pages.length - 1
    const validationMessages: string[] = []

    for (const key of Object.keys(this.instanceRefs)) {
      if (!key.startsWith(pageIndex + ":")) {
        continue
      }

      const component = this.instanceRefs[key]
      if (component.validate) {
        const msg = component.validate()
        if (msg != null) {
          validationMessages.push(msg)
        }
      }
    }

    if (validationMessages.length > 0) {
      // "" just blocks
      if (_.compact(validationMessages).length > 0) {
        alert(_.compact(validationMessages).join("\n"))
      }
      return
    }

    const pages = this.state.pages.slice()
    pages.splice(pages.length - 1, 1)
    this.setState({ pages })
  }

  refHandler = (key: string, component: React.Component<any> | null) => {
    if (component) {
      this.instanceRefs[key] = component
    }
    else {
      delete this.instanceRefs[key]
    }
  }

  renderChildBlock = (page: Page, pageIndex: number, props: RenderInstanceProps, childBlockDef: BlockDef | null, instanceId?: string) => {
    // Create block
    if (childBlockDef) {
      const block = this.props.createBlock(childBlockDef)

      const elem = block.renderInstance(props)
  
      // Add ref to element
      const key = instanceId ? pageIndex + ":" + childBlockDef.id + ":" + instanceId : pageIndex + ":" +childBlockDef.id
      const refedElem = React.cloneElement(elem, { ...elem.props, ref: this.refHandler.bind(null, key) })
      return refedElem
    }
    else {
      return null
    }
  }

  handleClose = () => {
    this.closePage()
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
      renderChildBlock: this.renderChildBlock.bind(null, page, pageIndex)
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
              { this.renderChildBlock(page, pageIndex, innerRenderInstanceProps, widgetDef.blockDef) }
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
            <i className="fa fa-arrow-left" onClick={this.props.onClose} />
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
      <ModalPopupComponent onClose={this.props.onClose}>
        {this.props.children}
      </ModalPopupComponent>
    )
  }
}