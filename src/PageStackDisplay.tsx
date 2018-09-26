import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { CreateBlock, RenderInstanceProps, Filter, BlockDef } from "./widgets/blocks";
import { Schema, Expr } from "mwater-expressions";
import ContextVarsInjector from "./widgets/ContextVarsInjector";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { LookupWidget } from "./widgets/widgets";
import { ActionLibrary } from "./widgets/ActionLibrary";

interface Props {
  initialPage: Page
  createBlock: CreateBlock
  locale: string
  schema: Schema
  actionLibrary: ActionLibrary
  lookupWidget: LookupWidget
}

interface State {
  pages: Page[]
}

/** Maintains and displays the stack of pages, including modals.  */
export class PageStackDisplay extends React.Component<Props, State> implements PageStack {
  constructor(props: Props) {
    super(props)

    // Display initial page
    this.state = {
      pages: [props.initialPage]
    }
  }

  openPage(page: Page): void {
    this.setState({ pages: this.state.pages.concat(page) })
  }

  closePage(): void {
    // TODO validate and prevent popping last page
    const pages = this.state.pages.slice()
    pages.splice(pages.length - 1, 1)
    this.setState({ pages })
  }

  renderChildBlock = (page: Page, props: RenderInstanceProps, childBlockDef: BlockDef | null, instanceId?: string) => {
    // Create block
    if (childBlockDef) {
      const block = this.props.createBlock(childBlockDef)

      // TODO capture rendered blocks refs for validation purposes
      return block.renderInstance(props)
    }
    else {
      return null
    }
  }

  handleClose = () => {
    this.closePage()
  }

  renderPageContents(page: Page) {
    // Lookup widget
    const widgetDef = this.props.lookupWidget(page.widgetId)!

    // Case of empty widget
    if (!widgetDef.blockDef) {
      return null
    }

    // Create block
    const block = this.props.createBlock(widgetDef.blockDef)

    // Create outer renderInstanceProps. Context variables will be injected after
    const outerRenderInstanceProps: RenderInstanceProps = {
      locale: this.props.locale,
      database: page.database,
      schema: this.props.schema,
      actionLibrary: this.props.actionLibrary,
      pageStack: this,
      contextVars: [],
      getContextVarValue: (contextVarId: string) => { throw new Error("Non-existant context variable") },
      getContextVarExprValue: (contextVarId: string, expr: Expr) => { throw new Error("Non-existant context variable") },
      onSelectContextVar: (contextVarId: string, primaryKey: any) => { throw new Error("Non-existant context variable") },
      setFilter: (contextVarId: string, filter: Filter) => { throw new Error("Non-existant context variable") },
      getFilters: (contextVarId: string) => { throw new Error("Non-existant context variable") },
      renderChildBlock: this.renderChildBlock.bind(null, page)
    }

    // Wrap in context var injector
    return <ContextVarsInjector 
      contextVars={widgetDef.contextVars}
      createBlock={this.props.createBlock}
      innerBlock={widgetDef.blockDef}
      contextVarValues={page.contextVarValues}
      renderInstanceProps={outerRenderInstanceProps}
      schema={this.props.schema}>
        {(innerRenderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => {
          if (loading) {
            return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
          }
          return (
            <div style={{ opacity: refreshing ? 0.6 : undefined }}>
              { block.renderInstance(innerRenderInstanceProps) }
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

    const contents = this.renderPageContents(page)

    switch (page.type) {
      case "normal":
        return (
          <div style={{ display: invisible ? "none" : "block" }}>
            <NormalPage isFirst={index === 0} onClose={this.handleClose} key={index}>
              {contents}
            </NormalPage>
          </div>
        )
      case "modal":
        return (
          <div style={{ display: invisible ? "none" : "block" }}>
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
  // TODO page header
  render() {
    return this.props.children
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