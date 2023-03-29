import _ from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { Page, PageStack } from "./PageStack"
import { BlockDef } from "./widgets/blocks"
import ContextVarsInjector from "./widgets/ContextVarsInjector"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { BaseCtx, InstanceCtx } from "./contexts"
import uuid from "uuid"

import "./PageStackDisplay.css"
import { WidgetDef } from "./widgets/widgets"
import { localizeString } from "mwater-expressions"
import { formatEmbeddedExprString } from "./embeddedExprs"
import { evalContextVarExpr } from "./widgets/evalContextVarExpr"

interface Props {
  baseCtx: BaseCtx
  initialPage?: Page

  /** Allows overriding the page stack that is passed to the widgets and used for the close arrow */
  overridePageStack?: PageStack
}

interface State {
  pages: Page[]
}

/** Maintains and displays the stack of pages, including modals */
export class PageStackDisplay extends React.Component<Props, State> implements PageStack {
  /** Stores validation registrations for all sub-components so that they can be validated
   * before being saved. Contains pageIndex as well to allow validating a single page.
   * Indexed by random uuid.
   */
  validationRegistrations: {
    [key: string]: { pageIndex: number; validate: () => string | null | Promise<string | null> }
  }

  constructor(props: Props) {
    super(props)

    // Display initial page
    this.state = {
      pages: props.initialPage ? [props.initialPage] : []
    }

    this.validationRegistrations = {}
  }

  openPage(page: Page): void {
    this.setState({ pages: this.state.pages.concat(page) })
  }

  /** Replace current page with specified one */
  async replacePage(page: Page): Promise<boolean> {
    if (this.state.pages.length == 0) {
      throw new Error("Zero pages in stack")
    }

    // Validate all instances within page
    const pageIndex = this.state.pages.length - 1
    const result = await this.validatePage(pageIndex)
    if (!result) {
      return false
    }

    const pages = this.state.pages.slice()
    pages.splice(pages.length - 1, 1)
    pages.push(page)
    this.setState({ pages })
    return true
  }

  /** Close top page. Returns whether successful and pages still open and page */
  async closePage(): Promise<{ success: boolean; pageCount: number, page: Page }> {
    if (this.state.pages.length == 0) {
      throw new Error("Zero pages in stack")
    }

    const pageIndex = this.state.pages.length - 1
    const page = this.state.pages[pageIndex]
    
    // Validate all instances within page
    const result = await this.validatePage(pageIndex)
    if (!result) {
      return { success: false, pageCount: this.state.pages.length, page }
    }

    const pages = this.state.pages.slice()
    pages.splice(pages.length - 1, 1)
    this.setState({ pages })

    return { success: true, pageCount: pages.length, page }
  }

  /** Closes all pages. true for success, false for failure */
  async closeAllPages(): Promise<boolean> {
    const pages = this.state.pages.slice()

    while (pages.length > 0) {
      // Validate all instances within page
      const pageIndex = pages.length - 1

      const result = await this.validatePage(pageIndex)
      if (!result) {
        return false
      }
      pages.splice(pages.length - 1, 1)
    }

    this.setState({ pages: [] })
    return true
  }

  /** Validates a single page (by pageIndex), showing an error if fails */
  async validatePage(pageIndex: number): Promise<boolean> {
    const validationMessages: string[] = []

    for (const key of Object.keys(this.validationRegistrations)) {
      const value = this.validationRegistrations[key]!
      if (value.pageIndex != pageIndex) {
        continue
      }

      const msg = await value.validate()
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

  /** Gets the page stack. Last item is top page */
  getPageStack(): Page[] {
    return this.state.pages
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
    if (this.props.overridePageStack) {
      this.props.overridePageStack.closePage()
    }
    else {
      this.closePage()
    }
  }

  /** Stores the registration for validation of a child block and returns an unregister function */
  registerChildForValidation = (pageIndex: number, validate: () => string | null): (() => void) => {
    const key = uuid()
    this.validationRegistrations[key] = { pageIndex: pageIndex, validate: validate }
    return () => {
      delete this.validationRegistrations[key]
    }
  }

  renderPage(page: Page, index: number) {
    // Determine if invisible (behind a normal page)
    let invisible = false
    for (let i = index + 1; i < this.state.pages.length; i++) {
      if (this.state.pages[i].type === "normal") {
        invisible = true
      }
    }

    return <SinglePage
      key={index}
      page={page}
      index={index}
      invisible={invisible}
      baseCtx={this.props.baseCtx}
      pageStack={this.props.overridePageStack || this}
      registerChildForValidation={this.registerChildForValidation}
      handleClose={this.handleClose}
    />
  }

  render() {
    return this.state.pages.map((page, index) => this.renderPage(page, index))
  }
}

/** Displays a single page of a page stack. Calculates the title appropriately */
function SinglePage(props: { 
  page: Page
  index: number
  baseCtx: BaseCtx
  pageStack: PageStack
  handleClose: () => void
  registerChildForValidation: (pageIndex: number, validate: () => string | null) => (() => void)
  invisible: boolean
}) {
  const { page, index, handleClose, baseCtx, pageStack, invisible, registerChildForValidation } = props

  // Lookup widget
  const widgetDef = baseCtx.widgetLibrary.widgets[page.widgetId!]

  function renderChildBlock(instanceCtx: InstanceCtx, childBlockDef: BlockDef | null) {
    // Create block
    if (childBlockDef) {
      const block = instanceCtx.createBlock(childBlockDef)
      return block.renderInstance(instanceCtx)
    }
    return null
  }

  // Create outer instanceCtx. Context variables will be injected after
  const outerInstanceCtx = useMemo(() => {
    return {
      ...baseCtx,
      pageStack: pageStack,
      contextVars: [],
      contextVarValues: {},
      getContextVarExprValue: () => {
        throw new Error("Non-existant context variable")
      },
      onSelectContextVar: () => {
        throw new Error("Non-existant context variable")
      },
      setFilter: () => {
        throw new Error("Non-existant context variable")
      },
      getFilters: () => {
        throw new Error("Non-existant context variable")
      },
      renderChildBlock: renderChildBlock,
      registerForValidation: registerChildForValidation.bind(null, index)
    }
  }, [])

  // Get title if specified in the widget definition
  const title = useTitle(widgetDef, page, outerInstanceCtx)

  function renderPageContents() {
    // Case of empty widget
    if (!widgetDef.blockDef) {
      return null
    }

    const injectedContextVars = (baseCtx.globalContextVars || [])
      .concat(widgetDef.contextVars)
      .concat(widgetDef.privateContextVars || [])

    // Page context var values contains global and context vars. Add private values
    const injectedContextVarValues = {
      ...page.contextVarValues,
      // Exclude stale values
      ..._.pick(
        widgetDef.privateContextVarValues || {},
        (widgetDef.privateContextVars || []).map((cv) => cv.id)
      )
    }

    // Wrap in context var injector
    return (
      <ContextVarsInjector
        injectedContextVars={injectedContextVars}
        innerBlock={widgetDef.blockDef}
        injectedContextVarValues={injectedContextVarValues}
        instanceCtx={{ ...outerInstanceCtx, database: page.database }}
      >
        {(innerInstanceCtx: InstanceCtx, loading: boolean, refreshing: boolean) => {
          if (loading) {
            return (
              <div style={{ color: "#AAA", textAlign: "center" }}>
                <i className="fa fa-circle-o-notch fa-spin" />
              </div>
            )
          }
          return renderChildBlock(innerInstanceCtx, widgetDef.blockDef)
        }}
      </ContextVarsInjector>
    )
  }

  if (!widgetDef) {
    return <div className="alert alert-danger">Widget not found</div>
  }

  const contents = renderPageContents()

  switch (page.type) {
    case "normal":
      return (
        <div style={{ display: invisible ? "none" : "block" }} key={index} className={`page-${page.widgetId}`}>
          <NormalPage
            isFirst={index === 0}
            onClose={handleClose}
            key={index}
            title={title}
            pageMargins={widgetDef.pageMargins || "normal"}
          >
            {contents}
          </NormalPage>
        </div>
      )
    case "modal":
      return (
        <div style={{ display: invisible ? "none" : "block" }} key={index} className={`page-${page.widgetId}`}>
          <ModalPage onClose={handleClose} key={index} title={title} size={page.modalSize || "normal"}>
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

/**
 * 
 * @param widgetDef Definition of widget
 * @param page Page
 * @param instanceCtx Instance context (without context variables)
 */
function useTitle(widgetDef: WidgetDef, page: Page, instanceCtx: InstanceCtx) {
  // Determine the title
  const [title, setTitle] = useState<string | undefined>(page.title)

  const contextVars = (instanceCtx.globalContextVars || []).concat(widgetDef.contextVars)

  async function determineTitle() {
    // Localize string
    const titleTemplate = localizeString(widgetDef.title, instanceCtx.locale)

    if (titleTemplate == null) {
      setTitle(undefined)
      return
    }

    // Temporarily set title with {0}, {1}, etc. for embedded expressions to be replaced
    // by "..."
    setTitle(titleTemplate.replace(/\{(\d+)\}/g, "..."))

    // Get any embedded expression values
    const exprValues: any[] = []
    for (const ee of widgetDef.titleEmbeddedExprs || []) {
      const contextVar = ee.contextVarId ? contextVars.find((cv) => cv.id == ee.contextVarId)! : null
      exprValues.push(
        await evalContextVarExpr({
          contextVar,
          contextVarValue: contextVar ? page.contextVarValues[contextVar.id] : null,
          ctx: instanceCtx,
          expr: ee.expr
        })
      )
    }

    // Format and replace
    const formattedTitle = formatEmbeddedExprString({
      text: titleTemplate,
      embeddedExprs: widgetDef.titleEmbeddedExprs || [],
      exprValues: exprValues,
      schema: instanceCtx.schema,
      contextVars: instanceCtx.contextVars,
      locale: instanceCtx.locale,
      formatLocale: instanceCtx.formatLocale
    })

    setTitle(formattedTitle)
  }

  // If title is not specified, use widgetDef.title
  useEffect(() => {
    if (page.title) {
      return
    }

    determineTitle().catch((err) => {
      console.error(err)
    })
  }, [page.title])

  return title
}


/** Displays a page that is not a modal. Shows the title if present.
 * If the title is present and is not the first page, it may show a back
 * arrow as well.
 */
class NormalPage extends React.Component<{
  isFirst: boolean
  onClose: () => void
  title?: string
  pageMargins: "normal" | "none"
}> {
  render() {
    return (
      <div className={`normal-page normal-page-margins-${this.props.pageMargins}`}>
        {this.props.title ? (
          <div className="normal-page-header" key="header">
            <h4>
              {!this.props.isFirst ? (
                <i className="normal-page-header-back fa fa-arrow-left fa-fw" onClick={this.props.onClose} />
              ) : null}
              {this.props.title}
            </h4>
          </div>
        ) : null}
        <div key="contents" className="normal-page-contents">
          {this.props.children}
        </div>
      </div>
    )
  }
}

class ModalPage extends React.Component<{
  title?: string
  onClose: () => void
  size: "small" | "normal" | "large" | "full"
}> {
  render() {
    // Map to larger styles, as BS5 has quite small modals
    let size: "large" | "full" | "normal" | "small" | "x-large" = "normal"
    if (this.props.size == "small") {
      size = "normal"
    }
    else if (this.props.size == "normal") {
      size = "large"
    }
    else if (this.props.size == "large") {
      size = "x-large"
    }
    else if (this.props.size == "full") {
      size = "full"
    }

    return (
      <ModalPopupComponent
        onClose={this.props.onClose}
        size={size}
        header={this.props.title}
        showCloseX={true}
      >
        {this.props.children}
      </ModalPopupComponent>
    )
  }
}
