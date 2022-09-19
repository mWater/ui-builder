import { LocalizedString } from "mwater-expressions";
/** Localized string that is available as a prop */
export interface CodedLocalizedString {
    /** Name of the expression. Will be exposed as prop */
    name: string;
    /** Text to localize */
    value: LocalizedString;
}
/** Edits coded localized string. */
export declare const CodedLocalizedStringsEditor: (props: {
    value?: CodedLocalizedString[] | null | undefined;
    onChange: (value: CodedLocalizedString[]) => void;
    locale: string;
}) => JSX.Element;
/** Allows editing of an coded expression */
export declare const CodedLocalizedStringEditor: (props: {
    value: CodedLocalizedString;
    onChange: (codedLocalizedString: CodedLocalizedString) => void;
    locale: string;
}) => JSX.Element;
