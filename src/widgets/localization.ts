

export interface LocalizedString {
  _base: string,
  [language: string]: string  // Localizations
}

export function localize(str: LocalizedString | null, locale?: string): string {
  if (!str) {
    return ""
  }
  if (str[locale || "en"]) {
    return str[locale || "en"]
  }
  else {
    return str[str._base]
  }
}