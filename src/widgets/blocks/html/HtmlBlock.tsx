import produce from "immer"
import { default as React, useState, useEffect, useMemo } from "react"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import { Checkbox, TextInput } from "react-library/lib/bootstrap"
import { DataSource, LocalizedString, localizeString, Schema } from "mwater-expressions"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"
import { BlockDef, DesignCtx, InstanceCtx, validateContextVarExpr, useDatabaseChangeListener, LabeledProperty, PropertyEditor, ContextVar, EmbeddedExprEditor } from "../../.."
import { EmbeddedExpr, formatEmbeddedExpr } from "../../../embeddedExprs"
import { evalContextVarExpr } from "../../evalContextVarExpr"
import LeafBlock from "../../LeafBlock"

/** Block that contains an HTML component */
export interface HtmlBlockDef extends BlockDef {
  type: "html"

  /** Html that is displayed. Html can contain strings to be localized
   *  {"some string"}
   */
  html?: string

  /** Localized strings, automatically extracted from html */
  localizedStrings?: LocalizedString[]

  /** Named expressions which can be referenced as {{exprid}} */
  namedExprs?: HtmlNamedExpr[]
}

interface HtmlNamedExpr {
  /** Id to reference as {{id}} */
  id: string

  /** Content of the named expr */
  embeddedExpr: EmbeddedExpr
}

export default class HtmlBlock extends LeafBlock<HtmlBlockDef> {
  constructor(blockDef: HtmlBlockDef) {
    super(blockDef)
  }

  renderDesign(ctx: DesignCtx) {
    return <div dangerouslySetInnerHTML={{ __html: localizeHtml(this.blockDef.html || "", this.blockDef.localizedStrings || [], ctx.locale) }}></div>
  }

  renderInstance(ctx: InstanceCtx) {
    return <HtmlBlockInstance
      blockDef={this.blockDef}
      ctx={ctx}
    />
  }

  renderEditor(ctx: DesignCtx) {
    return <HtmlBlockEditor blockDef={this.blockDef} ctx={ctx} />
  }

  validate(ctx: DesignCtx) {
    // Validate expressions
    for (const namedExpr of this.blockDef.namedExprs || []) {
      const error = validateContextVarExpr({
        contextVars: ctx.contextVars,
        contextVarId: namedExpr.embeddedExpr.contextVarId,
        expr: namedExpr.embeddedExpr.expr,
        schema: ctx.schema
      })
      if (error) {
        return error
      }
    }

    return null
  }
}

function HtmlBlockInstance(props: {
  blockDef: HtmlBlockDef
  ctx: InstanceCtx
}) {
  const { blockDef, ctx } = props

  // Evaluate named expressions
  const [namedExprValues, setNamedExprValues] = useState<{ [id: string]: any }>({})

  const changeListener = useDatabaseChangeListener(ctx.database)

  async function updateValues() {
    for (const namedExpr of blockDef.namedExprs || []) {
      const contextVar = namedExpr.embeddedExpr.contextVarId ? ctx.contextVars.find(cv => cv.id == namedExpr.embeddedExpr.contextVarId) ?? null : null
      const contextVarValue = namedExpr.embeddedExpr.contextVarId ? ctx.contextVarValues[namedExpr.embeddedExpr.contextVarId] : null
      const exprValue = await evalContextVarExpr({
        contextVar,
        contextVarValue,
        ctx,
        expr: namedExpr.embeddedExpr.expr
      })
      setNamedExprValues(existing => ({ ...existing, [namedExpr.id]: exprValue }))
    }
  }

  useEffect(() => {
    updateValues().catch(err => {
      console.error(err)
    })
  }, [changeListener])

  let html = blockDef.html || ""

  html = localizeHtml(blockDef.html || "", blockDef.localizedStrings || [], ctx.locale)
  html = substituteNamedExprs(html, blockDef.namedExprs || [], namedExprValues, ctx)

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>

}

/** Replace named expressions with values e.g. {{somename}} */
function substituteNamedExprs(html: string, namedExprs: HtmlNamedExpr[], exprValues: { [id: string]: any }, ctx: InstanceCtx) {
  return html.replace(/\{\{(.+)\}\}/g, (match: string, g1: string) => {
    // Check named expressions
    for (const namedExpr of namedExprs) {
      if (namedExpr.id == g1) {
        if (namedExpr.id in exprValues) {
          // Get value
          const exprValue = exprValues[namedExpr.id]

          return formatEmbeddedExpr({
            embeddedExpr: namedExpr.embeddedExpr,
            contextVars: ctx.contextVars,
            exprValue: exprValue,
            locale: ctx.locale,
            schema: ctx.schema,
            formatLocale: ctx.formatLocale
          })
        }
        else {
          return "..."
        }
      }
    }

    // Just leave as {{someid}} to indicate that missing
    return match
  })
}

/** Replace {"some string"} templates with localized html */
function localizeHtml(html: string, localizedStrings: LocalizedString[], locale: string): string {
  return html.replace(/\{"(.+)"\}/g, (match: string, g1: string) => {
    // Check in localized strings
    for (const str of localizedStrings) {
      if (str[str._base] == g1) {
        return localizeString(str, locale) || ""
      }
    }
    return g1
  })
}

/** Extracts localized strings, putting them in the specified locale */
function extractLocalizedStrings(html: string, locale: string) {
  const strs: LocalizedString[] = []

  for (const match of html.matchAll(/\{"(.+)"\}/g)) {
    strs.push({ _base: locale, [locale]: match[1] })
  }

  return strs
}

/** Merge existing localized strings with current ones, keeping unique
 * and preferring existing as may have other locales.
 */
function mergeLocalizedStrings(existing: LocalizedString[], current: LocalizedString[]) {
  // Only keep if have non-base localizations
  const strs = existing.filter(s => {
    if (Object.keys(s).some(k => k != "_base" && k != s._base)) {
      return true
    }
    return false
  })

  for (const str of current) {
    if (!strs.some(s => s[s._base] == str[str._base])) {
      strs.push(str)
    }
  }

  return strs
}

function HtmlBlockEditor(props: { blockDef: HtmlBlockDef; ctx: DesignCtx} ) {
  const [modalOpen, setModalOpen] = useState(false)
  const { blockDef, ctx } = props

  return (
    <div>
      {modalOpen ? (
        <HtmlBlockEditModal blockDef={props.blockDef} ctx={props.ctx} onClose={() => setModalOpen(false)} />
      ) : null}
      <div className="mb-3">
        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(true)}>
          <i className="fa fa-pencil" /> Edit Html
        </button>
      </div>

      <LabeledProperty label="Named expressions" hint="Referenced as {{id}}">
        <PropertyEditor obj={blockDef} onChange={ctx.store.replaceBlock} property="namedExprs">
          {(value: HtmlNamedExpr[] | null | undefined, onChange) => (
            <HtmlNamedExprsEditor
              contextVars={ctx.contextVars}
              schema={ctx.schema}
              dataSource={ctx.dataSource}
              value={value}
              onChange={onChange}
            />
          )}
        </PropertyEditor>
      </LabeledProperty>
    </div>
  )
}

/** Edits named expressions. */
export function HtmlNamedExprsEditor(props: {
  value?: HtmlNamedExpr[] | null
  onChange: (value: HtmlNamedExpr[]) => void
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}) {
  const { value, onChange, schema, dataSource, contextVars } = props

  return (
    <div>
      <ListEditorComponent
        items={value || []}
        onItemsChange={onChange}
        renderItem={(item, index, onItemChange) => (
          <HtmlNamedExprEditor
            value={item}
            onChange={onItemChange}
            schema={schema}
            dataSource={dataSource}
            contextVars={contextVars} />
        )}
        createNew={() => ({ id: "", embeddedExpr: { contextVarId: null, expr: null, format: null }})} />
    </div>
  )
}

/** Allows editing of an named expression */
export function HtmlNamedExprEditor(props: {
  value: HtmlNamedExpr
  onChange: (HtmlNamedExpr: HtmlNamedExpr) => void
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}) {
  const { schema, dataSource, contextVars, value } = props

  const handleEmbedExprChange = (embeddedExpr: EmbeddedExpr) => {
    props.onChange({ ...props.value, embeddedExpr })
  }

  const embeddedExpr = value.embeddedExpr

  return (
    <div>
      <LabeledProperty label="Id" key="id">
        <PropertyEditor obj={props.value} onChange={props.onChange} property="id">
          {(value, onChange) => <TextInput value={value} onChange={(v) => onChange(v || "")} />}
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="Expression" key="expr">
        <EmbeddedExprEditor
          value={embeddedExpr}
          onChange={handleEmbedExprChange}
          schema={schema}
          dataSource={dataSource}
          contextVars={contextVars} />
      </LabeledProperty>
    </div>
  )
}


function HtmlBlockEditModal(props: { blockDef: HtmlBlockDef; ctx: DesignCtx; onClose: () => void} ) {
  const [html, setHtml] = useState<string>(props.blockDef.html || "")
  const [Monaco, setMonaco] = useState<any>()
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    window.React = React
    loadScript("https://unpkg.com/prop-types@15.7.2/prop-types.js").then(() => {
      loadScript("https://unpkg.com/@monaco-editor/loader@1.3.2/lib/umd/monaco-loader.min.js").then(() => {
        loadScript("https://unpkg.com/@monaco-editor/react@4.4.5/lib/umd/monaco-react.js").then(() => {
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

  function handleSave() {
    props.ctx.store.alterBlock(
      props.blockDef.id,
      produce((b: HtmlBlockDef) => {
        b.html = html
        b.localizedStrings = mergeLocalizedStrings(props.blockDef.localizedStrings || [], extractLocalizedStrings(html, props.ctx.locale))
      }) as (blockDef: BlockDef) => BlockDef | null
    )
    props.onClose()
  }

  return (
    <ModalWindowComponent isOpen={true} onRequestClose={handleSave}>
      <Checkbox
        value={preview || false}
        onChange={setPreview}
      >Preview</Checkbox>
      {preview ?
        <div dangerouslySetInnerHTML={{ __html: localizeHtml(html, props.blockDef.localizedStrings || [], props.ctx.locale) }} />
        : (
          Monaco ? (
            <Monaco
              language="html"
              height="80vh"
              onChange={setHtml}
              theme="vs-dark"
              defaultValue={html}
              options={monacoOptions as any} />
          ) : null
        )}
    </ModalWindowComponent>
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