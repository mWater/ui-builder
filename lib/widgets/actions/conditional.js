"use strict";
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
exports.ConditionalAction = void 0;
const react_1 = __importDefault(require("react"));
const actions_1 = require("../actions");
const propertyEditors_1 = require("../propertyEditors");
const evalContextVarExpr_1 = require("../evalContextVarExpr");
const __1 = require("../..");
/** Action that does one of two things depending on an expression */
class ConditionalAction extends actions_1.Action {
    validate(designCtx) {
        if (this.actionDef.ifExpr) {
            const error = (0, __1.validateContextVarExpr)({
                schema: designCtx.schema,
                contextVars: designCtx.contextVars,
                contextVarId: this.actionDef.ifExpr.contextVarId,
                expr: this.actionDef.ifExpr.expr,
                types: ["boolean"],
            });
            if (error) {
                return error;
            }
        }
        if (this.actionDef.thenAction) {
            const action = designCtx.actionLibrary.createAction(this.actionDef.thenAction);
            const error = action.validate(designCtx);
            if (error) {
                return error;
            }
        }
        if (this.actionDef.elseAction) {
            const action = designCtx.actionLibrary.createAction(this.actionDef.elseAction);
            const error = action.validate(designCtx);
            if (error) {
                return error;
            }
        }
        return null;
    }
    renderEditor(props) {
        const onChange = props.onChange;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Conditional Expression" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "ifExpr" }, (value, onChange) => (react_1.default.createElement(__1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "literal"], types: ["boolean"], contextVarExpr: value, onChange: onChange })))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Action if true" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "thenAction" }, (value, onChange) => react_1.default.createElement(__1.ActionDefEditor, { value: value, onChange: onChange, designCtx: props }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Action if false" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "elseAction" }, (value, onChange) => react_1.default.createElement(__1.ActionDefEditor, { value: value, onChange: onChange, designCtx: props })))));
    }
    performAction(instanceCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.actionDef.ifExpr) {
                return;
            }
            // Evaluate if
            const contextVar = instanceCtx.contextVars.find((cv) => cv.id == this.actionDef.ifExpr.contextVarId);
            const ifValue = yield (0, evalContextVarExpr_1.evalContextVarExpr)({
                contextVar: contextVar,
                contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
                ctx: instanceCtx,
                expr: this.actionDef.ifExpr.expr
            });
            if (ifValue) {
                if (this.actionDef.thenAction) {
                    const action = instanceCtx.actionLibrary.createAction(this.actionDef.thenAction);
                    yield action.performAction(instanceCtx);
                }
            }
            else {
                if (this.actionDef.elseAction) {
                    const action = instanceCtx.actionLibrary.createAction(this.actionDef.elseAction);
                    yield action.performAction(instanceCtx);
                }
            }
        });
    }
}
exports.ConditionalAction = ConditionalAction;
