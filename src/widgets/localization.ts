import { LocalizedString } from "mwater-expressions";

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