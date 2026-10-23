/**
 * Manuscript AI - Frontend Helpers & Logic Unit Tests
 * Runs with Node's native test runner (via `tsx --test`).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAxiosError, AppApiError } from '../api/errors';

test('Error Normalization: Returns network error when response is missing', () => {
  const fakeAxiosNetworkError = {
    isAxiosError: true,
    message: 'Network Error',
    response: undefined,
  };

  const normalized = normalizeAxiosError(fakeAxiosNetworkError);
  assert.equal(normalized.code, 'NETWORK_ERROR');
  assert.equal(normalized.isNetworkError, true);
  assert.ok(normalized.message.includes('ارتباط با سرور بک‌اند برقرار نشد'));
});

test('Error Normalization: Maps HTTP 409 to Persian Concurrency Conflict explanation', () => {
  const fakeConflictError = {
    isAxiosError: true,
    response: {
      status: 409,
      data: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Expected version 1, found version 2',
        },
      },
    },
  };

  const normalized = normalizeAxiosError(fakeConflictError);
  assert.equal(normalized.statusCode, 409);
  assert.equal(normalized.code, 'CONFLICT');
  assert.ok(normalized.message.includes('تداخل همزمانی') || normalized.message.includes('Expected version'));
});

test('Error Normalization: Handles standard JS generic Error gracefully', () => {
  const genericError = new Error('Unexpected client exception');
  const normalized = normalizeAxiosError(genericError);
  assert.equal(normalized.code, 'CLIENT_ERROR');
  assert.equal(normalized.message, 'Unexpected client exception');
});

test('Error Normalization: Maps HTTP 401 to Persian unauthenticated session explanation', () => {
  const fake401 = {
    isAxiosError: true,
    response: {
      status: 401,
      data: {
        success: false,
        error: { code: 'UNAUTHORIZED' },
      },
    },
  };
  const normalized = normalizeAxiosError(fake401);
  assert.equal(normalized.statusCode, 401);
  assert.ok(normalized.message.includes('نشست کاربری شما منقضی شده'));
});

test('Error Normalization: Maps HTTP 403 to Persian forbidden permission explanation', () => {
  const fake403 = {
    isAxiosError: true,
    response: {
      status: 403,
      data: {
        success: false,
        error: { code: 'FORBIDDEN' },
      },
    },
  };
  const normalized = normalizeAxiosError(fake403);
  assert.equal(normalized.statusCode, 403);
  assert.ok(normalized.message.includes('مجوز لازم'));
});
