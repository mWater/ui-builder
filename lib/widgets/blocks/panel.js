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
exports.PanelBlock = void 0;
const React = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const blocks_1 = require("../blocks");
const immer_1 = __importDefault(require("immer"));
class PanelBlock extends blocks_1.Block {
    getChildren(contextVars) {
        // Get for all cells
        return _.compact([this.blockDef.mainContent, this.blockDef.headerContent, this.blockDef.footerContent]).map((bd) => ({ blockDef: bd, contextVars: contextVars }));
    }
    validate() {
        return null;
    }
    processChildren(action) {
        return (0, immer_1.default)(this.blockDef, (draft) => {
            draft.mainContent = action(this.blockDef.mainContent);
            if (this.blockDef.headerContent) {
                draft.headerContent = action(this.blockDef.headerContent);
            }
            if (this.blockDef.footerContent) {
                draft.footerContent = action(this.blockDef.footerContent);
            }
        });
    }
    renderDesign(props) {
        const handleSetMainContent = (blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.mainContent = blockDef;
            }), blockDef.id);
        };
        const handleSetHeaderContent = (blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.headerContent = blockDef;
            }), blockDef.id);
        };
        const handleSetFooterContent = (blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.footerContent = blockDef;
            }), blockDef.id);
        };
        const mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent, handleSetMainContent);
        const headerContentNode = this.blockDef.headerContent !== undefined
            ? props.renderChildBlock(props, this.blockDef.headerContent, handleSetHeaderContent)
            : null;
        const footerContentNode = this.blockDef.footerContent !== undefined
            ? props.renderChildBlock(props, this.blockDef.footerContent, handleSetFooterContent)
            : null;
        return React.createElement(PanelComponent, { header: headerContentNode, main: mainContentNode, footer: footerContentNode });
    }
    renderInstance(props) {
        const mainContentNode = props.renderChildBlock(props, this.blockDef.mainContent);
        const headerContentNode = props.renderChildBlock(props, this.blockDef.headerContent || null);
        const footerContentNode = props.renderChildBlock(props, this.blockDef.footerContent || null);
        return React.createElement(PanelComponent, { header: headerContentNode, main: mainContentNode, footer: footerContentNode });
    }
    renderEditor(props) {
        const showHeader = () => {
            props.store.replaceBlock(Object.assign(Object.assign({}, this.blockDef), { headerContent: null }));
        };
        const hideHeader = () => {
            props.store.replaceBlock(Object.assign(Object.assign({}, this.blockDef), { headerContent: undefined }));
        };
        const showFooter = () => {
            props.store.replaceBlock(Object.assign(Object.assign({}, this.blockDef), { footerContent: null }));
        };
        const hideFooter = () => {
            props.store.replaceBlock(Object.assign(Object.assign({}, this.blockDef), { footerContent: undefined }));
        };
        return (React.createElement("div", null,
            React.createElement("div", null, this.blockDef.headerContent === undefined ? (React.createElement("button", { className: "btn btn-link", onClick: showHeader }, "Show Header")) : (React.createElement("button", { className: "btn btn-link", onClick: hideHeader }, "Hide Header"))),
            React.createElement("div", null, this.blockDef.footerContent === undefined ? (React.createElement("button", { className: "btn btn-link", onClick: showFooter }, "Show Footer")) : (React.createElement("button", { className: "btn btn-link", onClick: hideFooter }, "Hide Footer")))));
    }
}
exports.PanelBlock = PanelBlock;
const PanelComponent = (props) => {
    return (React.createElement("div", { className: "card mb-3" },
        props.header ? React.createElement("div", { className: "card-header ui-builder-card-header" }, props.header) : null,
        React.createElement("div", { className: "card-body" }, props.main),
        props.footer ? React.createElement("div", { className: "card-footer" }, props.footer) : null));
};
