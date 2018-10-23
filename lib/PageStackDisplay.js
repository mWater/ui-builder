import * as React from "react";
import ContextVarsInjector from "./widgets/ContextVarsInjector";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
import './PageStackDisplay.css';
/** Maintains and displays the stack of pages, including modals.  */
export class PageStackDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.refHandler = (key, component) => {
            if (component) {
                this.instanceRefs[key] = component;
            }
            else {
                delete this.instanceRefs[key];
            }
        };
        this.renderChildBlock = (page, pageIndex, props, childBlockDef, instanceId) => {
            // Create block
            if (childBlockDef) {
                const block = this.props.createBlock(childBlockDef);
                const elem = block.renderInstance(props);
                // Add ref to element
                const key = instanceId ? pageIndex + ":" + childBlockDef.id + ":" + instanceId : pageIndex + ":" + childBlockDef.id;
                const refedElem = React.cloneElement(elem, Object.assign({}, elem.props, { ref: this.refHandler.bind(null, key) }));
                return refedElem;
            }
            else {
                return null;
            }
        };
        this.handleClose = () => {
            this.closePage();
        };
        // Display initial page
        this.state = {
            pages: [props.initialPage]
        };
        this.instanceRefs = {};
    }
    openPage(page) {
        this.setState({ pages: this.state.pages.concat(page) });
    }
    closePage() {
        // Validate all instances within page
        const pageIndex = this.state.pages.length - 1;
        const validationMessages = [];
        for (const key of Object.keys(this.instanceRefs)) {
            if (!key.startsWith(pageIndex + ":")) {
                continue;
            }
            const component = this.instanceRefs[key];
            if (component.validate) {
                const msg = component.validate();
                if (msg != null) {
                    validationMessages.push(msg);
                }
            }
        }
        if (validationMessages.length > 0) {
            // "" just blocks
            if (_.compact(validationMessages).length > 0) {
                alert(_.compact(validationMessages).join("\n"));
            }
            return;
        }
        const pages = this.state.pages.slice();
        pages.splice(pages.length - 1, 1);
        this.setState({ pages });
    }
    renderPageContents(page, pageIndex) {
        // Lookup widget
        const widgetDef = this.props.widgetLibrary.widgets[page.widgetId];
        if (!widgetDef) {
            return React.createElement("div", { className: "alert alert-danger" }, "Widget not found");
        }
        // Case of empty widget
        if (!widgetDef.blockDef) {
            return null;
        }
        // Create outer renderInstanceProps. Context variables will be injected after
        const outerRenderInstanceProps = {
            locale: this.props.locale,
            database: page.database,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            actionLibrary: this.props.actionLibrary,
            widgetLibrary: this.props.widgetLibrary,
            pageStack: this,
            contextVars: [],
            contextVarValues: {},
            getContextVarExprValue: (contextVarId, expr) => { throw new Error("Non-existant context variable"); },
            onSelectContextVar: (contextVarId, primaryKey) => { throw new Error("Non-existant context variable"); },
            setFilter: (contextVarId, filter) => { throw new Error("Non-existant context variable"); },
            getFilters: (contextVarId) => { throw new Error("Non-existant context variable"); },
            renderChildBlock: this.renderChildBlock.bind(null, page, pageIndex)
        };
        // Wrap in context var injector
        return React.createElement(ContextVarsInjector, { injectedContextVars: widgetDef.contextVars, createBlock: this.props.createBlock, innerBlock: widgetDef.blockDef, injectedContextVarValues: page.contextVarValues, renderInstanceProps: outerRenderInstanceProps, schema: this.props.schema, database: page.database }, (innerRenderInstanceProps, loading, refreshing) => {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, this.renderChildBlock(page, pageIndex, innerRenderInstanceProps, widgetDef.blockDef)));
        });
    }
    renderPage(page, index) {
        // Determine if invisible (behind a normal page)
        let invisible = false;
        for (let i = index + 1; i < this.state.pages.length; i++) {
            if (this.state.pages[i].type === "normal") {
                invisible = true;
            }
        }
        const contents = this.renderPageContents(page, index);
        switch (page.type) {
            case "normal":
                return (React.createElement("div", { style: { display: invisible ? "none" : "block" } },
                    React.createElement(NormalPage, { isFirst: index === 0, onClose: this.handleClose, key: index }, contents)));
            case "modal":
                return (React.createElement("div", { style: { display: invisible ? "none" : "block" } },
                    React.createElement(ModalPage, { onClose: this.handleClose, key: index }, contents)));
        }
    }
    render() {
        return this.state.pages.map((page, index) => this.renderPage(page, index));
    }
}
class NormalPage extends React.Component {
    render() {
        return (React.createElement("div", { className: "normal-page" },
            React.createElement("div", { key: "header", className: "normal-page-header" }, !this.props.isFirst ?
                React.createElement("i", { className: "fa fa-arrow-left", onClick: this.props.onClose })
                : null),
            React.createElement("div", { key: "contents", className: "normal-page-contents" }, this.props.children)));
    }
}
class ModalPage extends React.Component {
    render() {
        return (React.createElement(ModalPopupComponent, { onClose: this.props.onClose }, this.props.children));
    }
}
//# sourceMappingURL=PageStackDisplay.js.map