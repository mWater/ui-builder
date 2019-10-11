import moment from 'moment';
import React from 'react';
import { Expr } from 'mwater-expressions';
import "react-datepicker/dist/react-datepicker.css";
import './datepicker-tweaks.css';
/** Either range or preset id or null */
export declare type DateValue = [string | null, string | null] | string | null;
interface Props {
    value: DateValue;
    onChange: (value: DateValue) => void;
    /** true to use datetime */
    datetime: boolean;
    table: string;
    placeholder?: string;
}
interface State {
    dropdownOpen: boolean;
    /** True when custom dates displayed */
    custom: boolean;
}
interface Preset {
    id: string;
    name: string;
}
/** Convert a filter value to an expression */
export declare const toExpr: (table: string, expr: Expr, datetime: boolean, value: DateValue) => Expr;
/** Allows selection of a date expressions for quickfilters */
export default class DateExprComponent extends React.Component<Props, State> {
    constructor(props: Props);
    toMoment(value: string | null): moment.Moment | null;
    fromMoment(value?: moment.Moment): string | null;
    handleClickOut: () => void;
    handleCustom: () => void;
    handleStartChange: (value: moment.Moment) => void;
    handleEndChange: (value: moment.Moment) => void;
    handlePreset: (preset: Preset) => void;
    handleOpen: () => void;
    renderClear(): JSX.Element;
    renderSummary(): string | JSX.Element;
    renderPresets(): JSX.Element;
    renderDropdown(): JSX.Element;
    renderCustomDropdown(): JSX.Element;
    render(): JSX.Element;
}
export {};
