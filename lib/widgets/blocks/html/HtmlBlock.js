"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlNamedExprEditor = exports.HtmlNamedExprsEditor = void 0;
const immer_1 = __importDefault(require("immer"));
const react_1 = __importStar(require("react"));
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_1 = require("mwater-expressions");
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const __1 = require("../../..");
const embeddedExprs_1 = require("../../../embeddedExprs");
const evalContextVarExpr_1 = require("../../evalContextVarExpr");
const LeafBlock_1 = __importDefault(require("../../LeafBlock"));
class HtmlBlock extends LeafBlock_1.default {
    constructor(blockDef) {
        super(blockDef);
    }
    renderDesign(ctx) {
        return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: localizeHtml(this.blockDef.html || "", this.blockDef.localizedStrings || [], ctx.locale) } });
    }
    renderInstance(ctx) {
        return react_1.default.createElement(HtmlBlockInstance, { blockDef: this.blockDef, ctx: ctx });
    }
    renderEditor(ctx) {
        return react_1.default.createElement(HtmlBlockEditor, { blockDef: this.blockDef, ctx: ctx });
    }
    validate(ctx) {
        // Validate expressions
        for (const namedExpr of this.blockDef.namedExprs || []) {
            const error = (0, __1.validateContextVarExpr)({
                contextVars: ctx.contextVars,
                contextVarId: namedExpr.embeddedExpr.contextVarId,
                expr: namedExpr.embeddedExpr.expr,
                schema: ctx.schema
            });
            if (error) {
                return error;
            }
        }
        return null;
    }
}
exports.default = HtmlBlock;
function HtmlBlockInstance(props) {
    const { blockDef, ctx } = props;
    // Evaluate named expressions
    const [namedExprValues, setNamedExprValues] = (0, react_1.useState)({});
    const changeListener = (0, __1.useDatabaseChangeListener)(ctx.database);
    function updateValues() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (const namedExpr of blockDef.namedExprs || []) {
                const contextVar = namedExpr.embeddedExpr.contextVarId ? (_a = ctx.contextVars.find(cv => cv.id == namedExpr.embeddedExpr.contextVarId)) !== null && _a !== void 0 ? _a : null : null;
                const contextVarValue = namedExpr.embeddedExpr.contextVarId ? ctx.contextVarValues[namedExpr.embeddedExpr.contextVarId] : null;
                const exprValue = yield (0, evalContextVarExpr_1.evalContextVarExpr)({
                    contextVar,
                    contextVarValue,
                    ctx,
                    expr: namedExpr.embeddedExpr.expr
                });
                setNamedExprValues(existing => (Object.assign(Object.assign({}, existing), { [namedExpr.id]: exprValue })));
            }
        });
    }
    (0, react_1.useEffect)(() => {
        updateValues().catch(err => {
            console.error(err);
        });
    }, [changeListener]);
    let html = blockDef.html || "";
    html = localizeHtml(blockDef.html || "", blockDef.localizedStrings || [], ctx.locale);
    html = substituteNamedExprs(html, blockDef.namedExprs || [], namedExprValues, ctx);
    return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: html } });
}
/** Replace named expressions with values e.g. {{somename}} */
function substituteNamedExprs(html, namedExprs, exprValues, ctx) {
    return html.replace(/\{\{(.+)\}\}/g, (match, g1) => {
        // Check named expressions
        for (const namedExpr of namedExprs) {
            if (namedExpr.id == g1) {
                if (namedExpr.id in exprValues) {
                    // Get value
                    const exprValue = exprValues[namedExpr.id];
                    return (0, embeddedExprs_1.formatEmbeddedExpr)({
                        embeddedExpr: namedExpr.embeddedExpr,
                        contextVars: ctx.contextVars,
                        exprValue: exprValue,
                        locale: ctx.locale,
                        schema: ctx.schema,
                        formatLocale: ctx.formatLocale
                    });
                }
                else {
                    return "...";
                }
            }
        }
        // Just leave as {{someid}} to indicate that missing
        return match;
    });
}
/** Replace {"some string"} templates with localized html */
function localizeHtml(html, localizedStrings, locale) {
    return html.replace(/\{"(.+)"\}/g, (match, g1) => {
        // Check in localized strings
        for (const str of localizedStrings) {
            if (str[str._base] == g1) {
                return (0, mwater_expressions_1.localizeString)(str, locale) || "";
            }
        }
        return g1;
    });
}
/** Extracts localized strings, putting them in the specified locale */
function extractLocalizedStrings(html, locale) {
    const strs = [];
    for (const match of html.matchAll(/\{"(.+)"\}/g)) {
        strs.push({ _base: locale, [locale]: match[1] });
    }
    return strs;
}
/** Merge existing localized strings with current ones, keeping unique
 * and preferring existing as may have other locales.
 */
function mergeLocalizedStrings(existing, current) {
    // Only keep if have non-base localizations
    const strs = existing.filter(s => {
        if (Object.keys(s).some(k => k != "_base" && k != s._base)) {
            return true;
        }
        return false;
    });
    for (const str of current) {
        if (!strs.some(s => s[s._base] == str[str._base])) {
            strs.push(str);
        }
    }
    return strs;
}
function HtmlBlockEditor(props) {
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    const { blockDef, ctx } = props;
    return (react_1.default.createElement("div", null,
        modalOpen ? (react_1.default.createElement(HtmlBlockEditModal, { blockDef: props.blockDef, ctx: props.ctx, onClose: () => setModalOpen(false) })) : null,
        react_1.default.createElement("div", { className: "mb-3" },
            react_1.default.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setModalOpen(true) },
                react_1.default.createElement("i", { className: "fa fa-pencil" }),
                " Edit Html")),
        react_1.default.createElement(__1.LabeledProperty, { label: "Named expressions", hint: "Referenced as {{id}}" },
            react_1.default.createElement(__1.PropertyEditor, { obj: blockDef, onChange: ctx.store.replaceBlock, property: "namedExprs" }, (value, onChange) => (react_1.default.createElement(HtmlNamedExprsEditor, { contextVars: ctx.contextVars, schema: ctx.schema, dataSource: ctx.dataSource, value: value, onChange: onChange }))))));
}
/** Edits named expressions. */
function HtmlNamedExprsEditor(props) {
    const { value, onChange, schema, dataSource, contextVars } = props;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value || [], onItemsChange: onChange, renderItem: (item, index, onItemChange) => (react_1.default.createElement(HtmlNamedExprEditor, { value: item, onChange: onItemChange, schema: schema, dataSource: dataSource, contextVars: contextVars })), createNew: () => ({ id: "", embeddedExpr: { contextVarId: null, expr: null, format: null } }) })));
}
exports.HtmlNamedExprsEditor = HtmlNamedExprsEditor;
/** Allows editing of an named expression */
function HtmlNamedExprEditor(props) {
    const { schema, dataSource, contextVars, value } = props;
    const handleEmbedExprChange = (embeddedExpr) => {
        props.onChange(Object.assign(Object.assign({}, props.value), { embeddedExpr }));
    };
    const embeddedExpr = value.embeddedExpr;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(__1.LabeledProperty, { label: "Id", key: "id" },
            react_1.default.createElement(__1.PropertyEditor, { obj: props.value, onChange: props.onChange, property: "id" }, (value, onChange) => react_1.default.createElement(bootstrap_1.TextInput, { value: value, onChange: (v) => onChange(v || "") }))),
        react_1.default.createElement(__1.LabeledProperty, { label: "Expression", key: "expr" },
            react_1.default.createElement(__1.EmbeddedExprEditor, { value: embeddedExpr, onChange: handleEmbedExprChange, schema: schema, dataSource: dataSource, contextVars: contextVars }))));
}
exports.HtmlNamedExprEditor = HtmlNamedExprEditor;
function HtmlBlockEditModal(props) {
    const [html, setHtml] = (0, react_1.useState)(props.blockDef.html || "");
    const [Monaco, setMonaco] = (0, react_1.useState)();
    const [preview, setPreview] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        window.React = react_1.default;
        loadScript("https://unpkg.com/prop-types@15.7.2/prop-types.js").then(() => {
            loadScript("https://unpkg.com/@monaco-editor/loader@1.3.2/lib/umd/monaco-loader.min.js").then(() => {
                loadScript("https://unpkg.com/@monaco-editor/react@4.4.5/lib/umd/monaco-react.js").then(() => {
                    setMonaco(window["monaco_react"].default);
                });
            });
        });
    }, []);
    const monacoOptions = (0, react_1.useMemo)(() => ({
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
    }), []);
    function handleSave() {
        props.ctx.store.alterBlock(props.blockDef.id, (0, immer_1.default)((b) => {
            b.html = html;
            b.localizedStrings = mergeLocalizedStrings(props.blockDef.localizedStrings || [], extractLocalizedStrings(html, props.ctx.locale));
        }));
        props.onClose();
    }
    return (react_1.default.createElement(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: handleSave },
        react_1.default.createElement(bootstrap_1.Checkbox, { value: preview || false, onChange: setPreview }, "Preview"),
        preview ?
            react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: localizeHtml(html, props.blockDef.localizedStrings || [], props.ctx.locale) } })
            : (Monaco ? (react_1.default.createElement(Monaco, { language: "html", height: "80vh", onChange: setHtml, theme: "vs-dark", defaultValue: html, options: monacoOptions })) : null)));
}
/** Loads a script */
function loadScript(src) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.setAttribute("src", src);
            script.setAttribute("type", "module");
            document.body.appendChild(script);
            script.onload = resolve;
            script.onerror = reject;
        });
    });
}
