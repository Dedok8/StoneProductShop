import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import ukAuth from "./locales/uk/auth.json";
import ukCommon from "./locales/uk/common.json";

export const defaultNS = "common";

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
  },
  uk: {
    common: ukCommon,
    auth: ukAuth,
  },
} as const;

export const SUPPORTED_LANGUAGES = ["en", "uk"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ["common", "auth"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
