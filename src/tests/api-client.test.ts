import test from 'node:test';
import assert from 'node:assert/strict';
import { validateApiBaseUrl } from '../api/client';

test('validateApiBaseUrl accepts valid absolute HTTP/HTTPS URLs', () => {
  const res1 = validateApiBaseUrl('http://localhost:3000/api/v1');
  assert.equal(res1.isValid, true);
  assert.equal(res1.normalizedUrl, 'http://localhost:3000/api/v1');

  const res2 = validateApiBaseUrl('https://api.manuscript.ac.ir/api/v1/');
  assert.equal(res2.isValid, true);
  // Strips trailing slashes
  assert.equal(res2.normalizedUrl, 'https://api.manuscript.ac.ir/api/v1');

  const res3 = validateApiBaseUrl('http://127.0.0.1:8080/v1');
  assert.equal(res3.isValid, true);
  assert.equal(res3.normalizedUrl, 'http://127.0.0.1:8080/v1');
});

test('validateApiBaseUrl accepts safe relative paths', () => {
  const res1 = validateApiBaseUrl('/api/v1');
  assert.equal(res1.isValid, true);
  assert.equal(res1.normalizedUrl, '/api/v1');

  const res2 = validateApiBaseUrl('/custom-prefix///');
  assert.equal(res2.isValid, true);
  assert.equal(res2.normalizedUrl, '/custom-prefix');
});

test('validateApiBaseUrl rejects protocol-relative URLs (SSRF / Open Redirect)', () => {
  const res = validateApiBaseUrl('//evil-attacker.com/api/v1');
  assert.equal(res.isValid, false);
  assert.match(res.error || '', /پروتکل-نسبی/);
});

test('validateApiBaseUrl rejects malicious URI schemes and invalid URLs', () => {
  const jsRes = validateApiBaseUrl('javascript:alert(1)');
  assert.equal(jsRes.isValid, false);

  const dataRes = validateApiBaseUrl('data:text/html,<script>alert(1)</script>');
  assert.equal(dataRes.isValid, false);

  const fileRes = validateApiBaseUrl('file:///etc/passwd');
  assert.equal(fileRes.isValid, false);

  const notUrl = validateApiBaseUrl('not-a-valid-url');
  assert.equal(notUrl.isValid, false);
});

test('validateApiBaseUrl rejects URLs containing credentials (user:pass@host)', () => {
  const res = validateApiBaseUrl('http://admin:secret@api.manuscript.internal/v1');
  assert.equal(res.isValid, false);
  assert.match(res.error || '', /رمز عبور/);
});

test('validateApiBaseUrl rejects empty or null values', () => {
  assert.equal(validateApiBaseUrl('').isValid, false);
  assert.equal(validateApiBaseUrl('   ').isValid, false);
  assert.equal(validateApiBaseUrl(null as any).isValid, false);
  assert.equal(validateApiBaseUrl(undefined as any).isValid, false);
});
