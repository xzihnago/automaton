import { Locale } from "discord.js";

declare global {
  var i18nWrapper: <T extends I18nPartial>(i18n: T) => I18n<T>;
}

type I18nPartial = Record<
  string,
  Record<Locale.EnglishUS, string> & Partial<Record<Locale, string>>
>;

type I18n<T extends I18nPartial> = Record<keyof T, Record<Locale, string>>;

global.i18nWrapper = (i18n) => {
  for (const key in i18n) {
    i18n[key] = new Proxy(i18n[key], {
      get: (target, locale: Locale) =>
        target[locale] ?? target[Locale.EnglishUS],
    });
  }

  return i18n as I18n<typeof i18n>;
};
