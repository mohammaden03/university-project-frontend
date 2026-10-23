/**
 * Manuscript AI - Persian & Arabic Unicode Text Normalization Engine
 *
 * Provides historical manuscript text normalization for search and indexing:
 * - Unifies Arabic Yeh (ي \u064A) and Persian Yeh (ی \u06CC), Yeh with Hamza (ئ \u0626), Alef Maqsura (ى \u0649)
 * - Unifies Arabic Kaf (ك \u0643) and Persian Kaf (ک \u06A9)
 * - Normalizes Alef variations (آ \u0622, أ \u0623, إ \u0625, ٱ \u0671 -> ا \u0627)
 * - Strips Tashkeel / Harakat (diacritics: Fatha, Damma, Kasra, Sukun, Shadda, Tanween)
 * - Strips Tatweel / Kashida (ـ \u0640)
 * - Normalizes Zero-Width Non-Joiner (ZWNJ \u200C) and collapses excessive whitespace
 * - Applies Unicode NFKC normalization
 */

const HARAKAT_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL_REGEX = /\u0640/g;
const ALEF_VARIANTS_REGEX = /[\u0622\u0623\u0625\u0671]/g;
const ZWNJ = '\u200C';
const MULTIPLE_ZWNJ_REGEX = /\u200C+/g;
const BOUNDARY_ZWNJ_REGEX = /(^\u200C+|\u200C+$|\s\u200C|\u200C\s)/g;

export interface NormalizationOptions {
  unifyYeh?: boolean;
  unifyKaf?: boolean;
  unifyAlef?: boolean;
  removeDiacritics?: boolean;
  removeTatweel?: boolean;
  cleanZwnj?: boolean;
  unifyNumbers?: boolean;
}

const DEFAULT_OPTIONS: NormalizationOptions = {
  unifyYeh: true,
  unifyKaf: true,
  unifyAlef: true,
  removeDiacritics: true,
  removeTatweel: true,
  cleanZwnj: true,
  unifyNumbers: true,
};

export function normalizePersianArabicText(
  input: string,
  options: NormalizationOptions = DEFAULT_OPTIONS
): string {
  if (!input) return '';

  let text = input.normalize('NFKC');

  if (options.removeDiacritics !== false) {
    text = text.replace(HARAKAT_REGEX, '');
  }

  if (options.removeTatweel !== false) {
    text = text.replace(TATWEEL_REGEX, '');
  }

  if (options.unifyYeh !== false) {
    text = text
      .replace(/\u064A/g, '\u06CC')
      .replace(/\u0649/g, '\u06CC');
  }

  if (options.unifyKaf !== false) {
    text = text.replace(/\u0643/g, '\u06A9');
  }

  if (options.unifyAlef !== false) {
    text = text.replace(ALEF_VARIANTS_REGEX, '\u0627');
  }

  if (options.cleanZwnj !== false) {
    text = text.replace(MULTIPLE_ZWNJ_REGEX, ZWNJ);
    text = text.replace(BOUNDARY_ZWNJ_REGEX, ' ');
  }

  if (options.unifyNumbers !== false) {
    text = text
      .replace(/[٠۰]/g, '0')
      .replace(/[١۱]/g, '1')
      .replace(/[٢۲]/g, '2')
      .replace(/[٣۳]/g, '3')
      .replace(/[٤۴]/g, '4')
      .replace(/[٥۵]/g, '5')
      .replace(/[٦۶]/g, '6')
      .replace(/[٧۷]/g, '7')
      .replace(/[٨۸]/g, '8')
      .replace(/[٩۹]/g, '9');
  }

  return text.replace(/\s+/g, ' ').trim();
}

export function createSearchSnippet(
  originalText: string,
  normalizedText: string,
  query: string,
  maxSnippetChars: number = 140
): { snippet: string; matchFound: boolean } {
  if (!query || !originalText) {
    return {
      snippet: originalText ? originalText.slice(0, maxSnippetChars) : '',
      matchFound: false,
    };
  }

  const normalizedQuery = normalizePersianArabicText(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    const queryWords = normalizedQuery.split(' ').filter(Boolean);
    let bestIndex = -1;
    for (const word of queryWords) {
      const idx = normalizedText.indexOf(word);
      if (idx !== -1) {
        bestIndex = idx;
        break;
      }
    }

    if (bestIndex === -1) {
      return {
        snippet: originalText.slice(0, maxSnippetChars) + (originalText.length > maxSnippetChars ? '...' : ''),
        matchFound: false,
      };
    }

    const start = Math.max(0, bestIndex - Math.floor(maxSnippetChars / 2));
    const end = Math.min(originalText.length, start + maxSnippetChars);
    const snippet = (start > 0 ? '...' : '') + originalText.slice(start, end) + (end < originalText.length ? '...' : '');
    return { snippet, matchFound: true };
  }

  const start = Math.max(0, matchIndex - Math.floor(maxSnippetChars / 2));
  const end = Math.min(originalText.length, start + maxSnippetChars);
  const snippet = (start > 0 ? '...' : '') + originalText.slice(start, end) + (end < originalText.length ? '...' : '');

  return { snippet, matchFound: true };
}
