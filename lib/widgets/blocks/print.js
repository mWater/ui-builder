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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class PrintBlock extends blocks_1.Block {
    getChildren(contextVars) {
        return this.blockDef.content ? [{ blockDef: this.blockDef.content, contextVars: contextVars }] : [];
    }
    validate() { return null; }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, draft => {
            draft.content = content;
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        return (React.createElement("div", null,
            React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("button", { type: "button", className: "btn btn-link" },
                    React.createElement("i", { className: "fa fa-print" }))),
            props.renderChildBlock(props, this.blockDef.content, handleAdd)));
    }
    renderInstance(ctx) {
        return React.createElement(PrintInstance, { ctx: ctx, blockDef: this.blockDef });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Paper Size" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "paperSize" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value || "letter-portrait", onChange: onChange, options: [
                        { value: "letter-portrait", label: "Letter (portrait)" },
                        { value: "letter-landscape", label: "Letter (landscape)" }
                    ] })))));
    }
}
exports.PrintBlock = PrintBlock;
/** Instance which shows the print button and a preview */
const PrintInstance = (props) => {
    const [printing, setPrinting] = react_1.useState(false);
    const handleClick = () => {
        setPrinting(true);
    };
    return (React.createElement("div", null,
        React.createElement("div", { style: { textAlign: "right" } },
            React.createElement("button", { type: "button", className: "btn btn-link", onClick: handleClick },
                React.createElement("i", { className: "fa fa-print" }))),
        props.ctx.renderChildBlock(props.ctx, props.blockDef.content),
        printing ? React.createElement(ExecutePrintInstance, { blockDef: props.blockDef, ctx: props.ctx, onComplete: () => setPrinting(false) }) : null));
};
/** Component which is displayed which creates the element to print in a portal,
 * waits for it to finish loading, executes the print and does a callback
 */
const ExecutePrintInstance = (props) => {
    /** Keep track of number of pending queries */
    const pendingQueriesRef = react_1.useRef(0);
    /** Keep track of number of total queries */
    const totalQueriesRef = react_1.useRef(0);
    /** Query status string */
    const [statusString, setStatusString] = react_1.useState("");
    /** Create tracking database and data source to make context that tracks query requests */
    const printCtx = react_1.useMemo(() => {
        const onStartQuery = () => {
            pendingQueriesRef.current = pendingQueriesRef.current + 1;
            totalQueriesRef.current = totalQueriesRef.current + 1;
            setStatusString(`${totalQueriesRef.current - pendingQueriesRef.current} / ${totalQueriesRef.current}`);
        };
        const onEndQuery = () => {
            pendingQueriesRef.current = pendingQueriesRef.current - 1;
            setStatusString(`${totalQueriesRef.current - pendingQueriesRef.current} / ${totalQueriesRef.current}`);
        };
        return { ...props.ctx,
            database: new TrackingDatabase(props.ctx.database, onStartQuery, onEndQuery),
            dataSource: props.ctx.dataSource ? new TrackingDataSource(props.ctx.dataSource, onStartQuery, onEndQuery) : undefined
        };
    }, []);
    // Create printable element
    const printElem = react_1.useMemo(() => {
        const paperSize = props.blockDef.paperSize || "letter-portait";
        // Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side). 1440 is double, so scale down
        let width = 1440;
        if (paperSize == "letter-landscape") {
            width = 1920;
        }
        return React.createElement("div", { style: { transform: "scale(0.5)", transformOrigin: "top left" } },
            React.createElement("div", { style: { width: width } }, printCtx.renderChildBlock(printCtx, props.blockDef.content)));
    }, [printCtx]);
    // Perform print after delay of waiting for no queries
    react_1.useEffect(() => {
        // Repeatedly check pending queries
        const interval = setInterval(() => {
            // If no queries, print after cancelling intervals
            if (pendingQueriesRef.current == 0) {
                clearInterval(interval);
                // Extra delay to ensure finished rendering
                setTimeout(() => {
                    window.print();
                    props.onComplete();
                }, 3000);
            }
        }, 3000);
        return () => { clearInterval(interval); };
    }, []);
    // Create size css string
    const sizeCss = (props.blockDef.paperSize || "letter-portait") == "letter-portait" ? "8.5in 11in" : "11in 8.5in landscape";
    // Fragment that contains CSS, splash screen and element to print
    const printFragment = React.createElement(React.Fragment, null,
        React.createElement("style", null, `
        @media print {
        /* Hide body and get rid of margins */
        body {
          visibility: hidden;
          margin: 0;
          padding: 0;
          opacity: 100%
        }

        /* Hide all children of body */
        body > * {
          display: none;
        }

        /* Setup special region */
        #react_element_printer {
          display: block !important;
          visibility: visible;
        }
      }

      @media screen {
        /* REMOVED: Don't show when not printing. Caused c3 problems */
        /*#react_element_printer {
          visibility: hidden;
        }*/
      }

      @page  {
        size: ${sizeCss}; 
        margin: 0.5in 0.5in 0.5in 0.5in; 
      }

      #react_element_printer_splash {
        display: flex; 
        align-items: center;
        justify-content: center;    
        position: fixed; 
        left: 0;
        top: 0;
        z-index: 9999;
        width: 100%;
        height: 100%;
        overflow: visible;    
        background-color: rgba(255,255,255,0.8);
      }

      @media print {
        #react_element_printer_splash {
          display: none;
        }
      }
    `),
        React.createElement("div", { id: "react_element_printer" }, printElem),
        React.createElement("div", { id: "react_element_printer_splash" },
            React.createElement("div", { style: { fontSize: 30, width: "50%" } },
                React.createElement("div", { className: "progress" },
                    React.createElement("div", { className: "progress-bar progress-bar-striped active", role: "progressbar", style: { width: "100%" } },
                        React.createElement("i", { className: "fa fa-print" }),
                        "\u00A0\u00A0",
                        statusString)))));
    return react_dom_1.createPortal(printFragment, document.body);
};
/** Database that proxies another database but calls callback whenever a query is started or ended.
 * Allows tracking of when queries have gone idle */
class TrackingDatabase {
    constructor(database, onStartQuery, onEndQuery) {
        this.database = database;
        this.onStartQuery = onStartQuery;
        this.onEndQuery = onEndQuery;
    }
    query(options, contextVars, filteredContextVarValues) {
        // Notify of query
        this.onStartQuery();
        return new Promise((resolve, reject) => {
            this.database.query(options, contextVars, filteredContextVarValues).then((rows) => {
                resolve(rows);
            }).catch((reason) => { reject(reason); }).finally(() => {
                this.onEndQuery();
            });
        });
    }
    addChangeListener(changeListener) {
        // Do nothing as printing should not update dynamically
    }
    removeChangeListener(changeListener) {
        // Do nothing as printing should not update dynamically
    }
    transaction() {
        return this.database.transaction();
    }
}
/** Data source that proxies another data source but calls callback whenever a query is performed.
 * Allows tracking of when queries have gone idle */
class TrackingDataSource extends mwater_expressions_1.DataSource {
    constructor(dataSource, onStartQuery, onEndQuery) {
        super();
        this.dataSource = dataSource;
        this.onStartQuery = onStartQuery;
        this.onEndQuery = onEndQuery;
    }
    performQuery(query, cb) {
        if (!cb) {
            return new Promise((resolve, reject) => {
                this.performQuery(query, (error, rows) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(error);
                    }
                });
            });
        }
        this.onStartQuery();
        this.dataSource.performQuery(query, (error, rows) => {
            this.onEndQuery();
            cb(error, rows);
        });
        return;
    }
    /** Get the url to download an image (by id from an image or imagelist column)
      Height, if specified, is minimum height needed. May return larger image
      Can be used to upload by posting to this url
    */
    getImageUrl(imageId, height) {
        return this.dataSource.getImageUrl(imageId, height);
    }
    // Clears the cache if possible with this data source
    clearCache() {
        this.dataSource.clearCache();
    }
    // Get the cache expiry time in ms from epoch. No cached items before this time will be used. 0 for no cache limit.
    // Useful for knowing when cache has been cleared, as it will be set to time of clearing.
    getCacheExpiry() { return this.dataSource.getCacheExpiry(); }
}
