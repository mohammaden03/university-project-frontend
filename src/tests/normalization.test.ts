/**
 * Manuscript AI - Persian & Arabic Unicode Normalization Tests
 * Tests pure frontend string algorithms using Node's built-in test runner.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePersianArabicText, createSearchSnippet } from '../utils/text';

test('Unicode Normalization: Unifies Arabic and Persian Yeh characters', () => {
  const arabicYeh = 'علي بن ابي طالب'; // with Arabic Yeh \u064A
  const expectedPersian = 'علی بن ابی طالب'; // with Persian Yeh \u06CC
  const normalized = normalizePersianArabicText(arabicYeh);
  assert.equal(normalized, expectedPersian);
});

test('Unicode Normalization: Unifies Arabic and Persian Kaf characters', () => {
  const arabicKaf = 'كتاب الحكمة'; // with Arabic Kaf \u0643
  const expectedPersian = 'کتاب الحکمة'; // with Persian Kaf \u06A9
  const normalized = normalizePersianArabicText(arabicKaf, { unifyAlef: false, removeDiacritics: false });
  assert.equal(normalized, expectedPersian);
});

test('Unicode Normalization: Strips Arabic Harakat/Tashkeel and Tatweel', () => {
  const inputWithDiacritics = 'بِسْمِ اللَّـهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const inputWithTatweel = 'فـــردوســـی';

  const normalizedDiacritics = normalizePersianArabicText(inputWithDiacritics);
  assert.equal(normalizedDiacritics.includes('\u064E'), false); // No Fatha
  assert.equal(normalizedDiacritics.includes('\u0650'), false); // No Kasra

  const normalizedTatweel = normalizePersianArabicText(inputWithTatweel);
  assert.equal(normalizedTatweel, 'فردوسی');
});

test('Unicode Normalization: Unifies Alef variations (Madda, Hamza Above, Hamza Below)', () => {
  const input = 'آغاز إسلام أحمد';
  const normalized = normalizePersianArabicText(input);
  assert.equal(normalized, 'اغاز اسلام احمد');
});

test('Search Snippet: Creates excerpt snippet around matching query', () => {
  const original = 'منت خدای را عز و جل که طاعتش موجب قربت است و به شکر اندرش مزید نعمت';
  const normalized = normalizePersianArabicText(original);
  const result = createSearchSnippet(original, normalized, 'موجب قربت');

  assert.equal(result.matchFound, true);
  assert.ok(result.snippet.includes('موجب قربت'));
});
