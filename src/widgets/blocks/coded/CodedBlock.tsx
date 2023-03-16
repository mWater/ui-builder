import produce from "immer"
import { default as React, useState, useEffect, useMemo } from "react"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import { Expr, localizeString } from "mwater-expressions"
import { CodedExpr, CodedExprsEditor } from "./CodedExpr"
import { CodedQuery, CodedQueriesEditor, validateCodedQuery } from "./CodedQuery"
import { CodedLocalizedString, CodedLocalizedStringsEditor } from "./CodedLocalizedString"
import { CodedAction, CodedActionsEditor } from "./CodedAction"
import { BlockDef, ContextVar, DesignCtx, InstanceCtx, LabeledProperty, PropertyEditor, validateContextVarExpr, QueryOptions, getFilteredContextVarValues, Filter } from "../../.."
import ErrorBoundary from "../../../designer/ErrorBoundary"
import LeafBlock from "../../LeafBlock"
import _ from "lodash"
import FillDownwardComponent from "react-library/lib/FillDownwardComponent"
import { Toggle } from "react-library/lib/bootstrap"

/** Extra packages that can be imported inside a coded block. By default, only
 * includes react.
 */
const extraPackages: { [packageId: string]: () => Promise<any> } = {}

/** Register an extra package id that can be imported using "import" inside a coded
 * block. Importer should return imported module e.g. return import("lodash")
 */
export function registerExtraCodedPackage(packageId: string, importer: () => Promise<any>) {
  extraPackages[packageId] = importer
}

/** Extra props that are available inside a coded block */
const extraProps: { [propId: string]: any } = {}

/** Register an extra prop that is available inside a coded block */
export function registerExtraProp(propId: string, value: any) {
  extraProps[propId] = value
}

/** Block that contains a coded component.
 * It can define expressions that will be present as props.
 * It can define queries that will be present as props.
 * It can define localized strings that will be present as props.
 * It can define actions that will be present as props.
 * 
 * It can define a design component that will be used in the designer (optional, export DesignComp)
 * It can define an instance component that will be used in the viewer (required, export InstanceComp)
 * It can define initial filters that will be applied to the context variables (export getInitialFilters)
 */
export interface CodedBlockDef extends BlockDef {
  type: "coded"

  /** JSX + ES6 code. Should export InstanceComp and optionally DesignComp as React components. */
  code: string

  /** ES5 compiled version of code. Empty if invalid or not compiled */
  compiledCode: string

  /** Edit mode. Default is modal */
  editMode?: "modal" | "inline"

  /** Expressions that are made available as props */
  codedExprs: CodedExpr[]

  /** Queries that are made available as props */
  codedQueries?: CodedQuery[]

  /** Localized strings that are made available as props */
  codedLocalizedStrings?: CodedLocalizedString[]

  /** Actions that re made available as props */
  codedActions?: CodedAction[]
}

/** Evaluate a module which has been transpiled to commonjs */
async function evaluateModule(code: string) {
  // Get all requires
  const requires = [...code.matchAll(/[^a-zA-Z]require\([\'\"]([a-zA-Z0-9-]+)[\'\"]\)/g)].map((match) => match[1])

  // Import them all
  const importedModules: { [key: string]: any } = {}

  for (const req of requires) {
    if (req == "react") {
      importedModules[req] = await import("react")
    }
    else if (req == "react-dom") {
      importedModules[req] = await import("react-dom")
    }
    else if (req in extraPackages) {
      importedModules[req] = await extraPackages[req]()
    }
    else {
      throw new Error(`Import ${req} not found`)
    }
  }

  // Create require function
  function requireFunc(value: string) {
    return importedModules[value]
  }

  const exports: { [key: string]: any } = {}

  new Function("require", "exports", code)(requireFunc, exports)

  return exports
}

export default class CodedBlock extends LeafBlock<CodedBlockDef> {
  constructor(blockDef: CodedBlockDef) {
    super(blockDef)
  }

  getContextVarExprs(contextVar: ContextVar, ctx: DesignCtx | InstanceCtx): Expr[] {
    return this.blockDef.codedExprs.filter((ce) => ce.contextVarId == contextVar.id).map((ce) => ce.expr)
  }

  async getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Promise<Filter[]> {
    const mod = await evaluateModule(this.blockDef.compiledCode)
    if (mod.getInitialFilters) {
      return mod.getInitialFilters(contextVarId, instanceCtx)
    }
    return []
  }

  renderDesign(ctx: DesignCtx) {
    if (this.blockDef.editMode == "inline") {
      return <CodedBlockEditInline
        blockDef={this.blockDef}
        ctx={ctx}
      />
    } else {
      return <CodedBlockDesign blockDef={this.blockDef} designCtx={ctx} />
    }
  }

  renderInstance(ctx: InstanceCtx) {
    return <CodedBlockInstance blockDef={this.blockDef} instanceCtx={ctx} />
  }

  renderEditor(ctx: DesignCtx) {
    return (
      <div>
        <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="editMode">
          {(value, onChange) => (
            <Toggle
              value={value || "modal"}
              options={[
                { value: "modal", label: "Modal" },
                { value: "inline", label: "Inline" }
              ]}
              onChange={onChange}
              size="sm"
            />
          )}
        </PropertyEditor>
        { (this.blockDef.editMode || "modal") == "modal" &&  <CodedBlockEditor blockDef={this.blockDef} ctx={ctx} /> }
        <br />
        <LabeledProperty label="Expressions" key="exprs">
          <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="codedExprs">
            {(value: CodedExpr[] | null | undefined, onChange) => (
              <CodedExprsEditor
                value={value}
                onChange={onChange}
                schema={ctx.schema}
                dataSource={ctx.dataSource}
                contextVars={ctx.contextVars}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Queries" key="queries">
          <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="codedQueries">
            {(value: CodedQuery[] | undefined, onChange) => (
              <CodedQueriesEditor
                value={value}
                onChange={onChange}
                schema={ctx.schema}
                dataSource={ctx.dataSource}
                contextVars={ctx.contextVars}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Actions" key="actions">
          <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="codedActions">
            {(value: CodedAction[] | null | undefined, onChange) => (
              <CodedActionsEditor
                value={value}
                onChange={onChange}
                designCtx={ctx}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Localized Strings" key="localizedStrings">
          <PropertyEditor obj={this.blockDef} onChange={ctx.store.replaceBlock} property="codedLocalizedStrings">
            {(value: CodedLocalizedString[] | undefined, onChange) => (
              <CodedLocalizedStringsEditor value={value} onChange={onChange} locale={ctx.locale} />
            )}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }

  validate(ctx: DesignCtx) {
    // Validate expressions
    for (const codedExpr of this.blockDef.codedExprs) {
      const error = validateContextVarExpr({
        contextVars: ctx.contextVars,
        contextVarId: codedExpr.contextVarId,
        expr: codedExpr.expr,
        schema: ctx.schema
      })
      if (error) {
        return error
      }
    }

    // Validate queries
    for (const codedQuery of this.blockDef.codedQueries || []) {
      const error = validateCodedQuery(codedQuery, ctx.schema, ctx.contextVars)
      if (error) {
        return error
      }
    }
    return null
  }
}

function CodedBlockInstance(props: { blockDef: CodedBlockDef; instanceCtx: InstanceCtx }) {
  const [mod, setMod] = useState<any>()
  const [error, setError] = useState<string>()

  const [queryResults, setQueryResults] = useState<{ [name: string]: any[] | undefined }>({})

  const [refresh, setRefresh] = useState(0)

  // Listen for updates
  useEffect(() => {
    const changeListnener = () => {
      setRefresh((r) => r + 1)
    }
    props.instanceCtx.database.addChangeListener(changeListnener)
    return () => props.instanceCtx.database.removeChangeListener(changeListnener)
  }, [props.instanceCtx.database])

  useEffect(() => {
    if (!props.blockDef.compiledCode) {
      setError("Coded block needs to be edited before use")
      return
    }

    setError(undefined)
    evaluateModule(props.blockDef.compiledCode)
      .then((m) => {
        setMod(m)
      })
      .catch((err) => {
        setError(err.message)
      })
  }, [props.blockDef])

  useEffect(() => {
    for (const codedQuery of props.blockDef.codedQueries || []) {
      const query: QueryOptions = {
        select: {},
        distinct: codedQuery.distinct,
        from: codedQuery.from,
        where: codedQuery.where,
        orderBy: codedQuery.orderBy,
        limit: codedQuery.limit
      }

      for (const select of codedQuery.selects) {
        query.select[select.alias] = select.expr
      }

      setQueryResults((qr) => ({ ...qr, [codedQuery.name]: undefined }))
      props.instanceCtx.database
        .query(query, props.instanceCtx.contextVars, getFilteredContextVarValues(props.instanceCtx))
        .then((rows) => {
          setQueryResults((qr) => ({ ...qr, [codedQuery.name]: rows }))
        })
        .catch((err) => setError(err.message))
    }
  }, [refresh])

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  if (!mod) {
    return <div>Loading...</div>
  }

  // Create props
  const compProps: any = { ctx: props.instanceCtx, ...extraProps }

  // Add coded expressions
  for (const codedExpr of props.blockDef.codedExprs) {
    compProps[codedExpr.name] = props.instanceCtx.getContextVarExprValue(codedExpr.contextVarId, codedExpr.expr)
  }

  // Add coded query results
  for (const codedQuery of props.blockDef.codedQueries || []) {
    compProps[codedQuery.name] = queryResults[codedQuery.name]
  }

  // Add coded actions
  for (const codedAction of props.blockDef.codedActions || []) {
    if (codedAction.actionDef) {
      const action = props.instanceCtx.actionLibrary.createAction(codedAction.actionDef)
      compProps[codedAction.name] = () => action.performAction(props.instanceCtx)
    }
  }
  
  // Add coded strings
  for (const codedLocalizedString of props.blockDef.codedLocalizedStrings || []) {
    compProps[codedLocalizedString.name] = localizeString(codedLocalizedString.value, props.instanceCtx.locale)
  }

  return React.createElement(mod.InstanceComp, compProps)
}

function CodedBlockDesign(props: { blockDef: CodedBlockDef; designCtx: DesignCtx }) {
  const [mod, setMod] = useState<any>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    setError(undefined)
    evaluateModule(props.blockDef.compiledCode)
      .then((m) => {
        setMod(m)
      })
      .catch((err) => {
        setError(err.message)
      })
  }, [props.blockDef])

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  if (!mod) {
    return <div>Loading...</div>
  }

  // Create props
  if (mod.DesignComp) {
    // Create props
    const compProps: any = { ctx: props.designCtx, ...extraProps }

    // Add coded strings
    for (const codedLocalizedString of props.blockDef.codedLocalizedStrings || []) {
      compProps[codedLocalizedString.name] = localizeString(codedLocalizedString.value, props.designCtx.locale)
    }

    return <ErrorBoundary>{React.createElement(mod.DesignComp, compProps)}</ErrorBoundary>
  }
  return <div style={{ border: "solid 1px #DDD", padding: 5 }}>Coded Block</div>
}

/** Button with modal editor */
function CodedBlockEditor(props: { 
  blockDef: CodedBlockDef
  ctx: DesignCtx
} ) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="mt-2">
      {modalOpen ? (
        <CodedBlockEditModal blockDef={props.blockDef} ctx={props.ctx} onClose={() => setModalOpen(false)} />
      ) : null}
      <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
        <i className="fa fa-pencil" /> Edit Code
      </button>
    </div>
  )
}

/** Modal that compiles on close */
function CodedBlockEditModal(props: { blockDef: CodedBlockDef; ctx: DesignCtx; onClose: () => void} ) {
  const [code, setCode] = useState<string>(props.blockDef.code)
  const [babel, setBabel] = useState<any>()

  useEffect(() => {
    window.React = React
    loadScript("https://cdn.jsdelivr.net/npm/@babel/standalone@7.19.3/babel.js").then(() => {
      setBabel(window["Babel"])
    })
  }, [])

  const handleChange = (value: string) => {
    setCode(value)
  }

  const handleSave = () => {
    try {
      const compiled = babel.transform(code, { plugins: ["transform-modules-commonjs", "transform-react-jsx"] }).code
      //console.log(compiled)
      props.ctx.store.alterBlock(
        props.blockDef.id,
        produce((b: CodedBlockDef) => {
          b.code = code
          b.compiledCode = compiled
        }) as (blockDef: BlockDef) => BlockDef | null
      )

      props.onClose()
    } catch (err: any) {
      alert(err.message)
      return
    }
  }

  return (
    <ModalWindowComponent isOpen={true} onRequestClose={handleSave}>
      {babel != null &&
        <CodedBlockCodeEditor
          code={code}
          ctx={props.ctx}
          onCodeChange={handleChange} />}
    </ModalWindowComponent>
  )
}

/** Inline editor of a coded block */
function CodedBlockEditInline(props: { 
  blockDef: CodedBlockDef
  ctx: DesignCtx
} ) {
  const [code, setCode] = useState<string>(props.blockDef.code)
  const [babel, setBabel] = useState<any>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    window.React = React
    loadScript("https://cdn.jsdelivr.net/npm/@babel/standalone@7.19.3/babel.js").then(() => {
      setBabel(window["Babel"])
    })
  }, [])

  // Throttled callback to save and compile code
  const saveBlock = useMemo(() => {
    function saveBlockInner(code: string) {
      try {
        const compiled = babel.transform(code, { plugins: ["transform-modules-commonjs", "transform-react-jsx"] }).code

        props.ctx.store.alterBlock(
          props.blockDef.id,
          produce((b: CodedBlockDef) => {
            b.code = code
            b.compiledCode = compiled
          }) as (blockDef: BlockDef) => BlockDef | null
        )
        setError(undefined)
      } catch (err: any) {
        props.ctx.store.alterBlock(
          props.blockDef.id,
          produce((b: CodedBlockDef) => {
            b.code = code
            b.compiledCode = ""
          }) as (blockDef: BlockDef) => BlockDef | null
        )
        setError(err.message)
      }
    }

    return _.debounce(saveBlockInner, 1000, { leading: false, trailing: true })
  }, [babel])

  const handleChange = (value: string) => {
    setCode(value)
    saveBlock(value)
  }

  if (babel == null) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ marginBottom: 10 }}>
      {error ? <div className="text-danger">{error}</div> : <div>&nbsp;</div>}
      <FillDownwardComponent>
        <CodedBlockCodeEditor
          code={code}
          ctx={props.ctx}
          onCodeChange={handleChange} />
      </FillDownwardComponent>
    </div>
  )
}

function CodedBlockCodeEditor(props: {
  code: string
  ctx: DesignCtx
  onCodeChange: (code: string) => void
}) {
  const [Monaco, setMonaco] = useState<any>()

  useEffect(() => {
    window.React = React
    loadScript("https://cdn.jsdelivr.net/npm/prop-types@15.7.2/prop-types.js").then(() => {
      loadScript("https://cdn.jsdelivr.net/npm/@monaco-editor/loader@1.3.2/lib/umd/monaco-loader.min.js").then(() => {
        loadScript("https://cdn.jsdelivr.net/npm/@monaco-editor/react@4.4.5/lib/umd/monaco-react.js").then(() => {
          setMonaco(window["monaco_react"].default)
        })
      })
    })
  }, [])

  const monacoOptions = useMemo(
    () => ({
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
      accessibilitySupport: "auto",
      autoIndent: false,
      automaticLayout: true,
      codeLens: true,
      colorDecorators: true,
      contextmenu: true,
      cursorBlinking: "blink",
      cursorSmoothCaretAnimation: false,
      cursorStyle: "line",
      disableLayerHinting: false,
      disableMonospaceOptimizations: false,
      dragAndDrop: false,
      fixedOverflowWidgets: false,
      folding: false,
      foldingStrategy: "auto",
      fontLigatures: false,
      fontSize: "14px",
      formatOnPaste: false,
      formatOnType: false,
      hideCursorInOverviewRuler: false,
      highlightActiveIndentGuide: true,
      lineNumbers: "off",
      links: true,
      matchBrackets: "never",
      minimap: { enabled: false },
      mouseWheelZoom: false,
      multiCursorMergeOverlapping: true,
      multiCursorModifier: "alt",
      overviewRulerBorder: true,
      overviewRulerLanes: 2,
      quickSuggestions: false,
      quickSuggestionsDelay: 100,
      readOnly: false,
      renderControlCharacters: false,
      renderFinalNewline: true,
      renderIndentGuides: false,
      renderLineHighlight: "all",
      renderWhitespace: "none",
      revealHorizontalRightPadding: 30,
      roundedSelection: true,
      rulers: [],
      scrollBeyondLastColumn: 5,
      scrollBeyondLastLine: true,
      selectOnLineNumbers: true,
      selectionClipboard: true,
      selectionHighlight: true,
      showFoldingControls: "mouseover",
      smoothScrolling: false,
      suggestOnTriggerCharacters: true,
      tabSize: 2,
      wordBasedSuggestions: true,
      wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
      wordWrap: "off",
      wordWrapBreakAfterCharacters: "\t})]?|&,;",
      wordWrapBreakBeforeCharacters: "{([+",
      wordWrapBreakObtrusiveCharacters: ".",
      wordWrapColumn: 80,
      wordWrapMinified: true,
      wrappingIndent: "none"
    }),
    []
  )

  const handleChange = (value: string) => {
    props.onCodeChange(value)
  }

  return (
    Monaco ? (
      <Monaco
        language="javascript"
        height="100%"
        onChange={handleChange}
        theme="vs-dark"
        value={props.code}
        options={monacoOptions as any} />
    ) : null
  )
}

/** Loads a script */
async function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.setAttribute("src", src)
    script.setAttribute("type", "module")
    document.body.appendChild(script)

    script.onload = resolve
    script.onerror = reject
  })
}