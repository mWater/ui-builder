/// <reference types="react" />
/** Simple date filter that is year, month or year-month */
export declare const DateFilterInstance: (props: {
    mode: "year" | "yearmonth" | "month";
    value: any;
    onChange: (value: any) => void;
    placeholder: string;
    locale: string;
}) => JSX.Element;
