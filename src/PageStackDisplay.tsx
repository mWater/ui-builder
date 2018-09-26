import * as React from "react";
import { Page, PageStack } from "./PageStack";
import { CreateBlock, RenderInstanceProps, Filter, BlockDef } from "./widgets/blocks";
import { Schema, Expr } from "mwater-expressions";
import ContextVarsInjector from "./widgets/ContextVarsInjector";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { ActionFactory } from "./widgets/actions";
import { LookupWidget } from "./widgets/widgets";

interface Props {
  initialPage: Page
  createBlock: CreateBlock
  locale: string
  schema: Schema
  actionFactory: ActionFactory
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
    throw new Error("Method not implemented.");
  }

  closePage(): void {
    throw new Error("Method not implemented.");
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
    // TODO
  }

  renderPageContents(page: Page, isTop: boolean, contents: React.ReactElement<any>) {
    switch (page.type) {
      case "normal":
        return (
          <NormalPage isTop={isTop} onClose={this.handleClose}>
            {contents}
          </NormalPage>
        )
      case "modal":
        return (
          <ModalPage onClose={this.handleClose}>
            {contents}
          </ModalPage>
        )
    }
  }

  renderPage(page: Page, index: number) {
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
      actionFactory: this.props.actionFactory,
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
      key={index}
      contextVars={widgetDef.contextVars}
      createBlock={this.props.createBlock}
      innerBlock={widgetDef.blockDef}
      contextVarValues={page.contextVarValues}
      renderInstanceProps={outerRenderInstanceProps}
      schema={this.props.schema}>
        {(innerRenderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => {
          // TODO loading/refreshing display
          return block.renderInstance(innerRenderInstanceProps)
        }}
      </ContextVarsInjector>
  }
  
  render() {
    return this.state.pages.map((page, index) => this.renderPage(page, index))
  }
}

class NormalPage extends React.Component<{ isTop: boolean, onClose: () => void }> {
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