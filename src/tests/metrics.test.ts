/**
 * Manuscript AI - CER and WER Evaluation Metric Tests
 * Tests pure frontend Levenshtein and accuracy algorithms.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCerWer } from '../utils/metrics';

test('CER & WER Metrics: Computes zero error for identical texts', () => {
  const gt = 'به نام خداوند جان و خرد';
  const hyp = 'به نام خداوند جان و خرد';
  const result = calculateCerWer(gt, hyp);
  assert.equal(result.cer, 0.0);
  assert.equal(result.wer, 0.0);
  assert.equal(result.charAccuracy, 1.0);
  assert.equal(result.wordAccuracy, 1.0);
});

test('CER & WER Metrics: Computes exact CER and WER for single character substitution', () => {
  const gt = 'کتاب';
  const hyp = 'کباب'; // 1 character substitution ('ت' -> 'ب')
  const result = calculateCerWer(gt, hyp);
  assert.equal(result.charEdits, 1);
  assert.equal(result.cer, 0.25); // 1 edit out of 4 characters = 25%
  assert.equal(result.wordEdits, 1);
  assert.equal(result.wer, 1.0); // 1 word modified out of 1 word = 100%
});

test('CER & WER Metrics: Computes CER for additions and deletions', () => {
  const gt = 'شاهنامه';
  const hyp = 'شاهنامه فردوسی';
  const result = calculateCerWer(gt, hyp);
  assert.ok(result.cer > 0);
  assert.equal(result.groundTruthChars, 7);
  assert.equal(result.hypothesisChars, 14);
});
