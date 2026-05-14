export type AppLang = "ka" | "en";

export function resolveLang(value?: string | null): AppLang {
  return value === "en" ? "en" : "ka";
}
