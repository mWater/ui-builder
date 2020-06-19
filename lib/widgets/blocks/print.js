"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var PrintBlock = /** @class */ (function (_super) {
    __extends(PrintBlock, _super);
    function PrintBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrintBlock.prototype.getChildren = function (contextVars) {
        return this.blockDef.content ? [{ blockDef: this.blockDef.content, contextVars: contextVars }] : [];
    };
    PrintBlock.prototype.validate = function () { return null; };
    PrintBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.content = content;
        });
    };
    PrintBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleAdd = function (addedBlockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        return (React.createElement("div", null,
            React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("button", { type: "button", className: "btn btn-link" },
                    React.createElement("i", { className: "fa fa-print" }))),
            props.renderChildBlock(props, this.blockDef.content, handleAdd)));
    };
    PrintBlock.prototype.renderInstance = function (ctx) {
        return React.createElement(PrintInstance, { ctx: ctx, blockDef: this.blockDef });
    };
    return PrintBlock;
}(blocks_1.Block));
exports.PrintBlock = PrintBlock;
/** Instance which shows the print button and a preview */
var PrintInstance = function (props) {
    var _a = react_1.useState(false), printing = _a[0], setPrinting = _a[1];
    var handleClick = function () {
        setPrinting(true);
    };
    return (React.createElement("div", null,
        React.createElement("div", { style: { textAlign: "right" } },
            React.createElement("button", { type: "button", className: "btn btn-link", onClick: handleClick },
                React.createElement("i", { className: "fa fa-print" }))),
        props.ctx.renderChildBlock(props.ctx, props.blockDef.content),
        printing ? React.createElement(ExecutePrintInstance, { blockDef: props.blockDef, ctx: props.ctx, onComplete: function () { return setPrinting(false); } }) : null));
};
/** Component which is displayed which creates the element to print in a portal,
 * waits for it to finish loading, executes the print and does a callback
 */
var ExecutePrintInstance = function (props) {
    /** Keep track of number of pending queries */
    var pendingQueriesRef = react_1.useRef(0);
    /** Keep track of number of total queries */
    var totalQueriesRef = react_1.useRef(0);
    /** Query status string */
    var _a = react_1.useState(""), statusString = _a[0], setStatusString = _a[1];
    /** Create tracking database and data source to make context that tracks query requests */
    var printCtx = react_1.useMemo(function () {
        var onStartQuery = function () {
            pendingQueriesRef.current = pendingQueriesRef.current + 1;
            totalQueriesRef.current = totalQueriesRef.current + 1;
            setStatusString(totalQueriesRef.current - pendingQueriesRef.current + " / " + totalQueriesRef.current);
        };
        var onEndQuery = function () {
            pendingQueriesRef.current = pendingQueriesRef.current - 1;
            setStatusString(totalQueriesRef.current - pendingQueriesRef.current + " / " + totalQueriesRef.current);
        };
        return __assign(__assign({}, props.ctx), { database: new TrackingDatabase(props.ctx.database, onStartQuery, onEndQuery), dataSource: props.ctx.dataSource ? new TrackingDataSource(props.ctx.dataSource, onStartQuery, onEndQuery) : undefined });
    }, []);
    // Create printable element
    var printElem = react_1.useMemo(function () {
        return printCtx.renderChildBlock(printCtx, props.blockDef.content);
    }, [printCtx]);
    // Perform print after delay of waiting for no queries
    react_1.useEffect(function () {
        // Repeatedly check pending queries
        var interval = setInterval(function () {
            // If no queries, print after cancelling intervals
            if (pendingQueriesRef.current == 0) {
                clearInterval(interval);
                // Extra delay to ensure finished rendering
                setTimeout(function () {
                    window.print();
                    props.onComplete();
                }, 3000);
            }
        }, 3000);
        return function () { clearInterval(interval); };
    }, []);
    // Fragment that contains CSS, splash screen and element to print
    var printFragment = React.createElement(React.Fragment, null,
        React.createElement("style", null, "\n        @media print {\n        /* Hide body and get rid of margins */\n        body {\n          visibility: hidden;\n          margin: 0;\n          padding: 0;\n          opacity: 100%\n        }\n\n        /* Hide all children of body */\n        body > * {\n          display: none;\n        }\n\n        /* Setup special region */\n        #react_element_printer {\n          display: block !important;\n          visibility: visible;\n        }\n      }\n\n      @media screen {\n        /* REMOVED: Don't show when not printing. Caused c3 problems */\n        /*#react_element_printer {\n          visibility: hidden;\n        }*/\n      }\n\n      /* Default to letter sized pages */\n      @page  {\n        size: 8.5in 11in; \n        margin: 0.5in 0.5in 0.5in 0.5in; \n      }\n\n      #react_element_printer_splash {\n        display: flex; \n        align-items: center;\n        justify-content: center;    \n        position: fixed; \n        left: 0;\n        top: 0;\n        z-index: 9999;\n        width: 100%;\n        height: 100%;\n        overflow: visible;    \n        background-color: rgba(255,255,255,0.8);\n      }\n\n      @media print {\n        #react_element_printer_splash {\n          display: none;\n        }\n      }\n    "),
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
var TrackingDatabase = /** @class */ (function () {
    function TrackingDatabase(database, onStartQuery, onEndQuery) {
        this.database = database;
        this.onStartQuery = onStartQuery;
        this.onEndQuery = onEndQuery;
    }
    TrackingDatabase.prototype.query = function (options, contextVars, filteredContextVarValues) {
        var _this = this;
        // Notify of query
        this.onStartQuery();
        return new Promise(function (resolve, reject) {
            _this.database.query(options, contextVars, filteredContextVarValues).then(function (rows) {
                resolve(rows);
            }).catch(function (reason) { reject(reason); }).finally(function () {
                _this.onEndQuery();
            });
        });
    };
    TrackingDatabase.prototype.addChangeListener = function (changeListener) {
        // Do nothing as printing should not update dynamically
    };
    TrackingDatabase.prototype.removeChangeListener = function (changeListener) {
        // Do nothing as printing should not update dynamically
    };
    TrackingDatabase.prototype.transaction = function () {
        return this.database.transaction();
    };
    return TrackingDatabase;
}());
/** Data source that proxies another data source but calls callback whenever a query is performed.
 * Allows tracking of when queries have gone idle */
var TrackingDataSource = /** @class */ (function (_super) {
    __extends(TrackingDataSource, _super);
    function TrackingDataSource(dataSource, onStartQuery, onEndQuery) {
        var _this = _super.call(this) || this;
        _this.dataSource = dataSource;
        _this.onStartQuery = onStartQuery;
        _this.onEndQuery = onEndQuery;
        return _this;
    }
    /** Performs a single query. Calls cb with (error, rows) */
    TrackingDataSource.prototype.performQuery = function (query, cb) {
        var _this = this;
        this.onStartQuery();
        this.dataSource.performQuery(query, function (error, rows) {
            _this.onEndQuery();
            cb(error, rows);
        });
    };
    /** Get the url to download an image (by id from an image or imagelist column)
      Height, if specified, is minimum height needed. May return larger image
      Can be used to upload by posting to this url
    */
    TrackingDataSource.prototype.getImageUrl = function (imageId, height) {
        return this.dataSource.getImageUrl(imageId, height);
    };
    // Clears the cache if possible with this data source
    TrackingDataSource.prototype.clearCache = function () {
        this.dataSource.clearCache();
    };
    // Get the cache expiry time in ms from epoch. No cached items before this time will be used. 0 for no cache limit.
    // Useful for knowing when cache has been cleared, as it will be set to time of clearing.
    TrackingDataSource.prototype.getCacheExpiry = function () { return this.dataSource.getCacheExpiry(); };
    return TrackingDataSource;
}(mwater_expressions_1.DataSource));
