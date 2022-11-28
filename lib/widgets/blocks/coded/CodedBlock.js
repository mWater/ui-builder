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
exports.registerExtraProp = exports.registerExtraCodedPackage = void 0;
const immer_1 = __importDefault(require("immer"));
const react_1 = __importStar(require("react"));
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const mwater_expressions_1 = require("mwater-expressions");
const CodedExpr_1 = require("./CodedExpr");
const CodedQuery_1 = require("./CodedQuery");
const CodedLocalizedString_1 = require("./CodedLocalizedString");
const CodedAction_1 = require("./CodedAction");
const __1 = require("../../..");
const ErrorBoundary_1 = __importDefault(require("../../../designer/ErrorBoundary"));
const LeafBlock_1 = __importDefault(require("../../LeafBlock"));
/** Extra packages that can be imported inside a coded block. By default, only
 * includes react.
 */
const extraPackages = {};
/** Register an extra package id that can be imported using "import" inside a coded
 * block. Importer should return imported module e.g. return import("lodash")
 */
function registerExtraCodedPackage(packageId, importer) {
    extraPackages[packageId] = importer;
}
exports.registerExtraCodedPackage = registerExtraCodedPackage;
/** Extra props that are available inside a coded block */
const extraProps = {};
/** Register an extra prop that is available inside a coded block */
function registerExtraProp(propId, value) {
    extraProps[propId] = value;
}
exports.registerExtraProp = registerExtraProp;
/** Evaluate a module which has been transpiled to commonjs */
function evaluateModule(code) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get all requires
        const requires = [...code.matchAll(/[^a-zA-Z]require\([\'\"]([a-zA-Z0-9-]+)[\'\"]\)/g)].map((match) => match[1]);
        // Import them all
        const importedModules = {};
        for (const req of requires) {
            if (req == "react") {
                importedModules[req] = yield Promise.resolve().then(() => __importStar(require("react")));
            }
            if (req == "react-dom") {
                importedModules[req] = yield Promise.resolve().then(() => __importStar(require("react-dom")));
            }
            else if (req in extraPackages) {
                importedModules[req] = yield extraPackages[req]();
            }
            else {
                throw new Error(`Import ${req} not found`);
            }
        }
        // Create require function
        function requireFunc(value) {
            return importedModules[value];
        }
        const exports = {};
        new Function("require", "exports", code)(requireFunc, exports);
        return exports;
    });
}
class CodedBlock extends LeafBlock_1.default {
    constructor(blockDef) {
        super(blockDef);
    }
    getContextVarExprs(contextVar, ctx) {
        return this.blockDef.codedExprs.filter((ce) => ce.contextVarId == contextVar.id).map((ce) => ce.expr);
    }
    renderDesign(ctx) {
        return react_1.default.createElement(CodedBlockDesign, { blockDef: this.blockDef, designCtx: ctx });
    }
    renderInstance(ctx) {
        return react_1.default.createElement(CodedBlockInstance, { blockDef: this.blockDef, instanceCtx: ctx });
    }
    renderEditor(ctx) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(CodedBlockCodeEditor, { blockDef: this.blockDef, ctx: ctx }),
            react_1.default.createElement("br", null),
            react_1.default.createElement(__1.LabeledProperty, { label: "Expressions", key: "exprs" },
                react_1.default.createElement(__1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "codedExprs" }, (value, onChange) => (react_1.default.createElement(CodedExpr_1.CodedExprsEditor, { value: value, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, contextVars: ctx.contextVars })))),
            react_1.default.createElement(__1.LabeledProperty, { label: "Queries", key: "queries" },
                react_1.default.createElement(__1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "codedQueries" }, (value, onChange) => (react_1.default.createElement(CodedQuery_1.CodedQueriesEditor, { value: value, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, contextVars: ctx.contextVars })))),
            react_1.default.createElement(__1.LabeledProperty, { label: "Actions", key: "actions" },
                react_1.default.createElement(__1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "codedActions" }, (value, onChange) => (react_1.default.createElement(CodedAction_1.CodedActionsEditor, { value: value, onChange: onChange, designCtx: ctx })))),
            react_1.default.createElement(__1.LabeledProperty, { label: "Localized Strings", key: "localizedStrings" },
                react_1.default.createElement(__1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "codedLocalizedStrings" }, (value, onChange) => (react_1.default.createElement(CodedLocalizedString_1.CodedLocalizedStringsEditor, { value: value, onChange: onChange, locale: ctx.locale }))))));
    }
    validate(ctx) {
        // Validate expressions
        for (const codedExpr of this.blockDef.codedExprs) {
            const error = (0, __1.validateContextVarExpr)({
                contextVars: ctx.contextVars,
                contextVarId: codedExpr.contextVarId,
                expr: codedExpr.expr,
                schema: ctx.schema
            });
            if (error) {
                return error;
            }
        }
        // Validate queries
        for (const codedQuery of this.blockDef.codedQueries || []) {
            const error = (0, CodedQuery_1.validateCodedQuery)(codedQuery, ctx.schema, ctx.contextVars);
            if (error) {
                return error;
            }
        }
        return null;
    }
}
exports.default = CodedBlock;
function CodedBlockInstance(props) {
    const [mod, setMod] = (0, react_1.useState)();
    const [error, setError] = (0, react_1.useState)();
    const [queryResults, setQueryResults] = (0, react_1.useState)({});
    const [refresh, setRefresh] = (0, react_1.useState)(0);
    // Listen for updates
    (0, react_1.useEffect)(() => {
        const changeListnener = () => {
            setRefresh((r) => r + 1);
        };
        props.instanceCtx.database.addChangeListener(changeListnener);
        return () => props.instanceCtx.database.removeChangeListener(changeListnener);
    }, [props.instanceCtx.database]);
    (0, react_1.useEffect)(() => {
        if (!props.blockDef.compiledCode) {
            setError("Coded block needs to be edited before use");
            return;
        }
        setError(undefined);
        evaluateModule(props.blockDef.compiledCode)
            .then((m) => {
            setMod(m);
        })
            .catch((err) => {
            setError(err.message);
        });
    }, [props.blockDef]);
    (0, react_1.useEffect)(() => {
        for (const codedQuery of props.blockDef.codedQueries || []) {
            const query = {
                select: {},
                distinct: codedQuery.distinct,
                from: codedQuery.from,
                where: codedQuery.where,
                orderBy: codedQuery.orderBy,
                limit: codedQuery.limit
            };
            for (const select of codedQuery.selects) {
                query.select[select.alias] = select.expr;
            }
            setQueryResults((qr) => (Object.assign(Object.assign({}, qr), { [codedQuery.name]: undefined })));
            props.instanceCtx.database
                .query(query, props.instanceCtx.contextVars, (0, __1.getFilteredContextVarValues)(props.instanceCtx))
                .then((rows) => {
                setQueryResults((qr) => (Object.assign(Object.assign({}, qr), { [codedQuery.name]: rows })));
            })
                .catch((err) => setError(err.message));
        }
    }, [refresh]);
    if (error) {
        return react_1.default.createElement("div", { className: "alert alert-danger" }, error);
    }
    if (!mod) {
        return react_1.default.createElement("div", null, "Loading...");
    }
    // Create props
    const compProps = Object.assign({ ctx: props.instanceCtx }, extraProps);
    // Add coded expressions
    for (const codedExpr of props.blockDef.codedExprs) {
        compProps[codedExpr.name] = props.instanceCtx.getContextVarExprValue(codedExpr.contextVarId, codedExpr.expr);
    }
    // Add coded query results
    for (const codedQuery of props.blockDef.codedQueries || []) {
        compProps[codedQuery.name] = queryResults[codedQuery.name];
    }
    // Add coded actions
    for (const codedAction of props.blockDef.codedActions || []) {
        if (codedAction.actionDef) {
            const action = props.instanceCtx.actionLibrary.createAction(codedAction.actionDef);
            compProps[codedAction.name] = () => action.performAction(props.instanceCtx);
        }
    }
    // Add coded strings
    for (const codedLocalizedString of props.blockDef.codedLocalizedStrings || []) {
        compProps[codedLocalizedString.name] = (0, mwater_expressions_1.localizeString)(codedLocalizedString.value, props.instanceCtx.locale);
    }
    return react_1.default.createElement(mod.InstanceComp, compProps);
}
function CodedBlockDesign(props) {
    const [mod, setMod] = (0, react_1.useState)();
    const [error, setError] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        setError(undefined);
        evaluateModule(props.blockDef.compiledCode)
            .then((m) => {
            setMod(m);
        })
            .catch((err) => {
            setError(err.message);
        });
    }, [props.blockDef]);
    if (error) {
        return react_1.default.createElement("div", { className: "alert alert-danger" }, error);
    }
    if (!mod) {
        return react_1.default.createElement("div", null, "Loading...");
    }
    // Create props
    if (mod.DesignComp) {
        // Create props
        const compProps = Object.assign({ ctx: props.designCtx }, extraProps);
        // Add coded strings
        for (const codedLocalizedString of props.blockDef.codedLocalizedStrings || []) {
            compProps[codedLocalizedString.name] = (0, mwater_expressions_1.localizeString)(codedLocalizedString.value, props.designCtx.locale);
        }
        return react_1.default.createElement(ErrorBoundary_1.default, null, react_1.default.createElement(mod.DesignComp, compProps));
    }
    return react_1.default.createElement("div", { style: { border: "solid 1px #DDD", padding: 5 } }, "Coded Block");
}
const CodedBlockCodeEditor = (props) => {
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    return (react_1.default.createElement("div", null,
        modalOpen ? (react_1.default.createElement(CodedBlockEditModal, { blockDef: props.blockDef, ctx: props.ctx, onClose: () => setModalOpen(false) })) : null,
        react_1.default.createElement("button", { type: "button", className: "btn btn-primary", onClick: () => setModalOpen(true) },
            react_1.default.createElement("i", { className: "fa fa-pencil" }),
            " Edit Code")));
};
const CodedBlockEditModal = (props) => {
    const [code, setCode] = (0, react_1.useState)(props.blockDef.code);
    const [babel, setBabel] = (0, react_1.useState)();
    const [Monaco, setMonaco] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        window.React = react_1.default;
        loadScript("https://unpkg.com/prop-types@15.7.2/prop-types.js").then(() => {
            loadScript("https://unpkg.com/@monaco-editor/loader@1.3.2/lib/umd/monaco-loader.min.js").then(() => {
                loadScript("https://unpkg.com/@monaco-editor/react@4.4.5/lib/umd/monaco-react.js").then(() => {
                    loadScript("https://unpkg.com/@babel/standalone@7.19.3/babel.js").then(() => {
                        setMonaco(window["monaco_react"].default);
                        setBabel(window["Babel"]);
                    });
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
    const handleChange = (value) => {
        setCode(value);
    };
    const handleSave = () => {
        try {
            const compiled = babel.transform(code, { plugins: ["transform-modules-commonjs", "transform-react-jsx"] }).code;
            //console.log(compiled)
            props.ctx.store.alterBlock(props.blockDef.id, (0, immer_1.default)((b) => {
                b.code = code;
                b.compiledCode = compiled;
            }));
            props.onClose();
        }
        catch (err) {
            alert(err.message);
            return;
        }
    };
    return (react_1.default.createElement(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: handleSave }, Monaco && babel ? (react_1.default.createElement(Monaco, { language: "javascript", height: "100%", onChange: handleChange, theme: "vs-dark", value: code, options: monacoOptions })) : null));
};
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
