

export interface LocalizedString {
  _base: string,
  [language: string]: string  // Localizations
}

export function localize(str: LocalizedString, locale: string): string {
  if (str[locale]) {
    return str[locale]
  }
  else {
    return str[str._base]
  }
}