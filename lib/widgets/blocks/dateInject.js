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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateInjectBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const react_datepicker_1 = __importDefault(require("react-datepicker"));
const moment_1 = __importDefault(require("moment"));
const ContextVarsInjector_1 = __importDefault(require("../ContextVarsInjector"));
const react_1 = require("react");
class DateInjectBlock extends blocks_1.Block {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            return [{ blockDef: this.blockDef.content, contextVars: contextVars.concat([this.createContextVar()]) }];
        }
        return [];
    }
    createContextVar() {
        return { type: "date", id: this.blockDef.id, name: "Date" };
    }
    validate(options) {
        return null;
    }
    processChildren(action) {
        const content = action(this.blockDef.content);
        return (0, immer_1.default)(this.blockDef, (draft) => {
            draft.content = content;
        });
    }
    renderDesign(designCtx) {
        const handleSetContent = (blockDef) => {
            designCtx.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        // Create ctx for child
        const contextVar = this.createContextVar();
        let contentDesignCtx = designCtx;
        // Add context variable if knowable
        if (contextVar) {
            contentDesignCtx = Object.assign(Object.assign({}, contentDesignCtx), { contextVars: designCtx.contextVars.concat([contextVar]) });
        }
        const contentNode = designCtx.renderChildBlock(contentDesignCtx, this.blockDef.content, handleSetContent);
        return (React.createElement("div", null,
            React.createElement("div", null,
                React.createElement(react_datepicker_1.default, { selected: (0, moment_1.default)(), onChange: () => { }, dateFormat: "ll", className: "form-control" })),
            contentNode));
    }
    renderInstance(instanceCtx) {
        return React.createElement(DateInjectInstance, { instanceCtx: instanceCtx, block: this });
    }
    renderEditor(designCtx) {
        return React.createElement("div", null);
    }
}
exports.DateInjectBlock = DateInjectBlock;
const DateInjectInstance = (props) => {
    const [date, setDate] = (0, react_1.useState)((0, moment_1.default)().format("YYYY-MM-DD"));
    const { instanceCtx, block } = props;
    const dateContextVar = block.createContextVar();
    return (React.createElement("div", null,
        React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
            React.createElement(react_datepicker_1.default, { selected: (0, moment_1.default)(date, "YYYY-MM-DD"), onChange: (momentDate) => {
                    setDate(momentDate.format("YYYY-MM-DD"));
                }, dateFormat: "ll", isClearable: false, className: "form-control" })),
        React.createElement(ContextVarsInjector_1.default, { injectedContextVars: [dateContextVar], injectedContextVarValues: { [dateContextVar.id]: { type: "literal", valueType: "date", value: date } }, innerBlock: block.blockDef.content, instanceCtx: instanceCtx }, (innerInstanceCtx, loading, refreshing) => {
            if (loading) {
                return (React.createElement("div", { style: { color: "#AAA", textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" })));
            }
            return innerInstanceCtx.renderChildBlock(innerInstanceCtx, block.blockDef.content);
        })));
};
