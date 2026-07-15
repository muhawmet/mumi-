/* =============================================================
   textCase — locale-correct uppercasing for a Turkish UI that is
   full of English technical loanwords.

   The trap: <html lang="tr"> means CSS `text-transform: uppercase`
   AND JS `toLocaleUpperCase('tr')` both dot the letter i → İ. That is
   right for Turkish ("kayıpsız" → "KAYIPSIZ") but WRONG for English
   terms ("ingest" → "İNGEST", "medium" → "MEDİUM", "brief" → "BRİEF").

   smartUpper decides per word: a word carrying a Turkish-specific
   letter (ç ğ ı ö ş ü / İ) is uppercased with the Turkish locale so its
   diacritics stay correct; a pure-ASCII word (an English loanword) is
   uppercased with plain ASCII rules so its i stays a dotless I.
   ============================================================= */

const TURKISH_MARK = /[çğıöşüÇĞİÖŞÜ]/;

/** Uppercase a single word with the locale its own letters imply. */
function upperWord(word: string): string {
  return TURKISH_MARK.test(word) ? word.toLocaleUpperCase('tr') : word.toUpperCase();
}

/**
 * Uppercase mixed Turkish/English text without letting the Turkish
 * dotted-İ leak onto English loanwords. Whitespace and punctuation are
 * preserved verbatim.
 */
export function smartUpper(text: string): string {
  return text.replace(/\S+/g, upperWord);
}
