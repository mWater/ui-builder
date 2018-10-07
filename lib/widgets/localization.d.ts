export interface LocalizedString {
    _base: string;
    [language: string]: string;
}
export declare function localize(str: LocalizedString | null, locale?: string): string;
