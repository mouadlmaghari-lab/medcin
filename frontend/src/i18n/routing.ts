import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const rtlLocales: Locale[] = ['ar'];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});
